import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../services/api'

const getDefaultBoard = (boardId) => ({
  id: boardId,
  name: 'Novo Projeto',
  columns: [],
  labels: []
})

const useBoardStore = create(
  persist(
    (set, get) => ({
      boards: {},
      
      getBoard: (boardId) => {
        const state = get()
        return state.boards[boardId] || getDefaultBoard(boardId)
      },

      updateBoard: (boardId, updates) => set((state) => {
        const currentBoard = state.boards[boardId] || getDefaultBoard(boardId)
        return {
          boards: {
            ...state.boards,
            [boardId]: {
              ...currentBoard,
              ...updates
            }
          }
        }
      }),

      updateColumn: async (boardId, columnId, updates) => {
        try {
          await api.updateColumn(boardId, columnId, updates)
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            const columns = board.columns.map(col =>
              col.id === columnId ? { ...col, ...updates } : col
            )
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao atualizar coluna:', error)
          throw error
        }
      },

      addCard: async (boardId, columnId, card) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        
        // Salvar estado anterior para rollback em caso de erro
        const previousBoardState = JSON.parse(JSON.stringify(board))
        
        // Criar card temporário com ID temporário
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const tempCard = {
          id: tempId,
          title: card.title,
          description: card.description || null,
          assignee: card.assignee || null,
          label_ids: card.label_ids || [],
          highlight_label_id: card.highlight_label_id || null,
          created_at: card.created_at || new Date().toISOString(),
          position: board.columns.find(col => col.id === columnId)?.cards.length || 0
        }
        
        // OPTIMISTIC UPDATE: Atualizar estado imediatamente
        set((state) => {
          const board = state.boards[boardId] || getDefaultBoard(boardId)
          const columns = board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: [...col.cards, tempCard]
              }
            }
            return col
          })
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns
              }
            }
          }
        })
        
        // Fazer requisição em paralelo (sem bloquear a UI)
        try {
          const newCard = await api.createCard(boardId, columnId, card)
          
          // Substituir card temporário pelo card real retornado da API
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            const columns = board.columns.map(col => {
              if (col.id === columnId) {
                return {
                  ...col,
                  cards: col.cards.map(c => c.id === tempId ? newCard : c)
                }
              }
              return col
            })
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao criar card:', error)
          // ROLLBACK: Reverter para o estado anterior em caso de erro
          set((state) => ({
            boards: {
              ...state.boards,
              [boardId]: previousBoardState
            }
          }))
          throw error
        }
      },

      updateCard: async (boardId, columnId, cardId, updates) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        
        // Salvar estado anterior para rollback em caso de erro
        const previousBoardState = JSON.parse(JSON.stringify(board))
        
        let currentColumnId = columnId
        
        // Se o card mudou de coluna, encontrar a coluna atual
        if (updates.columnId) {
          currentColumnId = updates.columnId
          delete updates.columnId
        }

        // Encontrar o card atual
        let currentCard = null
        let cardColumnId = columnId
        board.columns.forEach(col => {
          const card = col.cards.find(c => c.id === cardId)
          if (card) {
            currentCard = card
            cardColumnId = col.id
          }
        })

        if (!currentCard) {
          throw new Error('Card não encontrado')
        }

        // Preparar dados para API (sem columnId se não mudou)
        const apiUpdates = { ...updates }
        if (currentColumnId !== columnId) {
          apiUpdates.columnId = currentColumnId
        }

        // OPTIMISTIC UPDATE: Atualizar estado imediatamente
        set((state) => {
          const board = state.boards[boardId] || getDefaultBoard(boardId)
          
          const columns = board.columns.map(col => {
            // Se mudou de coluna
            if (currentColumnId !== cardColumnId) {
              if (col.id === cardColumnId) {
                // Remover da coluna antiga
                return {
                  ...col,
                  cards: col.cards.filter(card => card.id !== cardId)
                }
              }
              if (col.id === currentColumnId) {
                // Adicionar na nova coluna com dados atualizados
                const updatedCard = {
                  ...currentCard,
                  ...updates,
                  id: cardId,
                  label_ids: updates.label_ids !== undefined ? updates.label_ids : currentCard.label_ids || [],
                  highlight_label_id: updates.highlight_label_id !== undefined ? updates.highlight_label_id : currentCard.highlight_label_id || null
                }
                return {
                  ...col,
                  cards: [...col.cards, updatedCard]
                }
              }
            } else {
              // Mesma coluna - atualizar card existente mantendo posição
              if (col.id === cardColumnId) {
                return {
                  ...col,
                  cards: col.cards.map((card) =>
                    card.id === cardId 
                      ? { 
                          ...card, 
                          ...updates,
                          id: cardId,
                          position: card.position, // Preservar posição
                          label_ids: updates.label_ids !== undefined ? updates.label_ids : card.label_ids || [],
                          highlight_label_id: updates.highlight_label_id !== undefined ? updates.highlight_label_id : card.highlight_label_id || null
                        } 
                      : card
                  )
                }
              }
            }
            return col
          })
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns
              }
            }
          }
        })

        // Fazer requisição em paralelo (sem bloquear a UI)
        try {
          // Chamar API e obter card atualizado
          const updatedCardData = await api.updateCard(boardId, cardId, apiUpdates)

          // Atualizar estado local com dados retornados da API (garantir sincronização)
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            
            const columns = board.columns.map(col => {
              // Se mudou de coluna
              if (currentColumnId !== cardColumnId) {
                if (col.id === cardColumnId) {
                  // Remover da coluna antiga
                  return {
                    ...col,
                    cards: col.cards.filter(card => card.id !== cardId)
                  }
                }
                if (col.id === currentColumnId) {
                  // Adicionar na nova coluna com dados atualizados
                  const newCard = {
                    ...currentCard,
                    ...updatedCardData,
                    id: cardId
                  }
                  return {
                    ...col,
                    cards: [...col.cards, newCard]
                  }
                }
              } else {
                // Mesma coluna - atualizar card existente mantendo posição
                if (col.id === cardColumnId) {
                  return {
                    ...col,
                    cards: col.cards.map((card) =>
                      card.id === cardId 
                        ? { 
                            ...card, 
                            ...updatedCardData,
                            id: cardId,
                            position: card.position // Preservar posição
                          } 
                        : card
                    )
                  }
                }
              }
              return col
            })
            
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao atualizar card:', error)
          // ROLLBACK: Reverter para o estado anterior em caso de erro
          set((state) => ({
            boards: {
              ...state.boards,
              [boardId]: previousBoardState
            }
          }))
          throw error
        }
      },

      deleteCard: async (boardId, columnId, cardId) => {
        try {
          await api.deleteCard(boardId, cardId)
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            const columns = board.columns.map(col => {
              if (col.id === columnId) {
                return {
                  ...col,
                  cards: col.cards.filter(card => card.id !== cardId)
                }
              }
              return col
            })
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao deletar card:', error)
          throw error
        }
      },

      moveCard: async (boardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        const sourceColumn = board.columns.find(col => col.id === sourceColumnId)
        const destinationColumn = board.columns.find(col => col.id === destinationColumnId)
        
        if (!sourceColumn || !destinationColumn) return

        const movedCard = sourceColumn.cards[sourceIndex]
        if (!movedCard) return

        // Salvar estado anterior para rollback em caso de erro
        const previousBoardState = JSON.parse(JSON.stringify(board))

        // Preparar arrays para atualização
        const newSourceCards = [...sourceColumn.cards]
        newSourceCards.splice(sourceIndex, 1)
        
        const newDestinationCards = sourceColumnId === destinationColumnId 
          ? [...sourceColumn.cards]
          : [...destinationColumn.cards]
        
        if (sourceColumnId === destinationColumnId) {
          const [removedCard] = newDestinationCards.splice(sourceIndex, 1)
          newDestinationCards.splice(destinationIndex, 0, removedCard)
        } else {
          newDestinationCards.splice(destinationIndex, 0, movedCard)
        }

        // OPTIMISTIC UPDATE: Atualizar estado imediatamente
        set((state) => {
          const board = state.boards[boardId] || getDefaultBoard(boardId)
          const columns = board.columns.map(col => {
            if (col.id === sourceColumnId && sourceColumnId === destinationColumnId) {
              return { ...col, cards: newDestinationCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            if (col.id === sourceColumnId) {
              return { ...col, cards: newSourceCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            if (col.id === destinationColumnId) {
              return { ...col, cards: newDestinationCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            return col
          })

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns
              }
            }
          }
        })

        // Fazer requisições em paralelo (sem bloquear a UI)
        try {
          if (sourceColumnId === destinationColumnId) {
            // Se for a mesma coluna, precisamos reordenar todos os cards
            await api.reorderCards(boardId, destinationColumnId, newDestinationCards.map((card, index) => ({
              id: card.id,
              position: index
            })))
          } else {
            // Se for coluna diferente, atualizar o card movido e reordenar ambas as colunas
            // Fazer todas as requisições em paralelo
            await Promise.all([
              api.updateCard(boardId, movedCard.id, {
                columnId: destinationColumnId,
                position: destinationIndex
              }),
              api.reorderCards(boardId, sourceColumnId, newSourceCards.map((card, index) => ({
                id: card.id,
                position: index
              }))),
              api.reorderCards(boardId, destinationColumnId, newDestinationCards.map((card, index) => ({
                id: card.id,
                position: index
              })))
            ])
          }
        } catch (error) {
          console.error('Erro ao mover card:', error)
          // ROLLBACK: Reverter para o estado anterior em caso de erro
          set((state) => ({
            boards: {
              ...state.boards,
              [boardId]: previousBoardState
            }
          }))
          throw error
        }
      },

      addColumn: async (boardId, column) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        
        // Salvar estado anterior para rollback em caso de erro
        const previousBoardState = JSON.parse(JSON.stringify(board))
        
        // Criar coluna temporária com ID temporário
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const tempColumn = {
          id: tempId,
          title: column.title,
          position: board.columns.length,
          cards: []
        }
        
        // OPTIMISTIC UPDATE: Atualizar estado imediatamente
        set((state) => {
          const board = state.boards[boardId] || getDefaultBoard(boardId)
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: [...board.columns, tempColumn]
              }
            }
          }
        })
        
        // Fazer requisição em paralelo (sem bloquear a UI)
        try {
          const newColumn = await api.createColumn(boardId, column.title)
          
          // Substituir coluna temporária pela coluna real retornada da API
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns: board.columns.map(col => col.id === tempId ? { ...newColumn, cards: [] } : col)
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao criar coluna:', error)
          // ROLLBACK: Reverter para o estado anterior em caso de erro
          set((state) => ({
            boards: {
              ...state.boards,
              [boardId]: previousBoardState
            }
          }))
          throw error
        }
      },

      deleteColumn: async (boardId, columnId) => {
        try {
          await api.deleteColumn(boardId, columnId)
          set((state) => {
            const board = state.boards[boardId] || getDefaultBoard(boardId)
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns: board.columns.filter(col => col.id !== columnId)
                }
              }
            }
          })
        } catch (error) {
          console.error('Erro ao deletar coluna:', error)
          throw error
        }
      },

      moveColumn: async (boardId, sourceIndex, destinationIndex) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        
        // Salvar estado anterior para rollback em caso de erro
        const previousBoardState = JSON.parse(JSON.stringify(board))
        
        const newColumns = [...board.columns]
        const [movedColumn] = newColumns.splice(sourceIndex, 1)
        newColumns.splice(destinationIndex, 0, movedColumn)

        // OPTIMISTIC UPDATE: Atualizar estado imediatamente
        set({
          boards: {
            ...state.boards,
            [boardId]: {
              ...board,
              columns: newColumns.map((col, idx) => ({ ...col, position: idx }))
            }
          }
        })

        // Fazer requisições em paralelo (sem bloquear a UI)
        try {
          // Preparar todas as atualizações necessárias
          const updatePromises = []
          for (let i = 0; i < newColumns.length; i++) {
            if (newColumns[i].position !== i) {
              updatePromises.push(
                api.updateColumn(boardId, newColumns[i].id, { position: i })
              )
            }
          }
          
          // Executar todas as atualizações em paralelo
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises)
          }
        } catch (error) {
          console.error('Erro ao mover coluna:', error)
          // ROLLBACK: Reverter para o estado anterior em caso de erro
          set((state) => ({
            boards: {
              ...state.boards,
              [boardId]: previousBoardState
            }
          }))
          throw error
        }
      },

      // Função temporária para preview durante o drag (não persiste)
      previewMoveCard: (boardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
        const state = get()
        const board = state.boards[boardId] || getDefaultBoard(boardId)
        const sourceColumn = board.columns.find(col => col.id === sourceColumnId)
        const destinationColumn = board.columns.find(col => col.id === destinationColumnId)
        
        if (!sourceColumn || !destinationColumn) return

        const movedCard = sourceColumn.cards[sourceIndex]
        if (!movedCard) return

        // Preparar arrays para preview
        const newSourceCards = [...sourceColumn.cards]
        newSourceCards.splice(sourceIndex, 1)
        
        const newDestinationCards = sourceColumnId === destinationColumnId 
          ? [...sourceColumn.cards]
          : [...destinationColumn.cards]
        
        if (sourceColumnId === destinationColumnId) {
          const [removedCard] = newDestinationCards.splice(sourceIndex, 1)
          newDestinationCards.splice(destinationIndex, 0, removedCard)
        } else {
          newDestinationCards.splice(destinationIndex, 0, movedCard)
        }

        // Atualizar estado temporariamente para preview
        set((state) => {
          const board = state.boards[boardId] || getDefaultBoard(boardId)
          const columns = board.columns.map(col => {
            if (col.id === sourceColumnId && sourceColumnId === destinationColumnId) {
              return { ...col, cards: newDestinationCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            if (col.id === sourceColumnId) {
              return { ...col, cards: newSourceCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            if (col.id === destinationColumnId) {
              return { ...col, cards: newDestinationCards.map((card, idx) => ({ ...card, position: idx })) }
            }
            return col
          })

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns
              }
            }
          }
        })
      },

      // Reverter preview para o estado original
      revertPreview: (boardId, previousBoardState) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: previousBoardState
          }
        }))
      }
    }),
    {
      name: 'kardio-storage',
    }
  )
)

export default useBoardStore

