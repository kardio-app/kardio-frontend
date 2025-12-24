import { DndContext, closestCorners, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, getFirstCollision } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, useRef, useEffect } from 'react'
import useBoardStore from '../../store/useBoardStore'
import Column from '../Column/Column'
import ColumnCarousel from '../ColumnCarousel/ColumnCarousel'
import './Board.css'

function Board({ boardId, showToast }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const moveCard = useBoardStore((state) => state.moveCard)
  const moveColumn = useBoardStore((state) => state.moveColumn)
  const addColumn = useBoardStore((state) => state.addColumn)
  const board = getBoard(boardId)
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null) // 'card' ou 'column'
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0)
  const boardContainerRef = useRef(null)
  const activeTypeRef = useRef(null) // Ref para acessar activeType na função de colisão

  // Forçar re-render quando boards mudar
  const boardData = boards[boardId] || getBoard(boardId)
  const columnIds = boardData.columns.map(col => col.id)

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      try {
        await addColumn(boardId, { title: newColumnTitle.trim() })
        setNewColumnTitle('')
        setShowAddColumn(false)
        if (showToast) {
          showToast(`Coluna "${newColumnTitle.trim()}" criada`, 'success')
        }
      } catch (error) {
        console.error('Erro ao criar coluna:', error)
        if (showToast) {
          showToast('Erro ao criar coluna', 'error')
        }
      }
    }
  }

  const handleAddColumnKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddColumn()
    }
    if (e.key === 'Escape') {
      setShowAddColumn(false)
      setNewColumnTitle('')
    }
  }

  // Detectar se é mobile/touch device
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 768
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile
        ? {
            // No mobile: precisa segurar por 250ms e mover pelo menos 10px
            distance: 10,
            delay: 250,
            tolerance: 5,
          }
        : {
            // No desktop: comportamento original
            distance: 5,
            delay: 0,
            tolerance: 5,
          },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    // Verificar se é uma coluna ou um card
    const activeId = event.active.id.toString()
    const isColumn = boardData.columns.some(col => col.id === activeId)
    const type = isColumn ? 'column' : 'card'
    setActiveType(type)
    activeTypeRef.current = type // Atualizar ref também
    
    // Prevenir scroll durante o drag no mobile
    if (boardContainerRef.current) {
      boardContainerRef.current.style.overflowX = 'hidden'
      boardContainerRef.current.style.touchAction = 'none'
    }
  }

  // Detecção de colisão customizada para colunas horizontais
  const horizontalCollisionDetection = (args) => {
    // Se não for uma coluna, usar detecção padrão
    if (activeTypeRef.current !== 'column') {
      return closestCenter(args)
    }

    const { active, collisionRect, droppableRects, droppableContainers } = args
    
    // Para colunas, usar detecção baseada na posição horizontal do cursor
    const activeRect = collisionRect
    const activeCenterX = activeRect.left + activeRect.width / 2
    
    // Encontrar a coluna mais próxima baseada na posição X do centro do elemento ativo
    let closestColumn = null
    let closestDistance = Infinity
    
    droppableContainers.forEach((container) => {
      const rect = droppableRects.get(container.id)
      if (!rect) return
      
      // Verificar se é uma coluna (não um droppable de card)
      const isColumn = boardData.columns.some(col => col.id === container.id)
      if (!isColumn) return
      
      const containerCenterX = rect.left + rect.width / 2
      const distance = Math.abs(activeCenterX - containerCenterX)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestColumn = container
      }
    })
    
    if (closestColumn) {
      return [{
        id: closestColumn.id,
        data: {
          droppableContainer: closestColumn,
          value: closestColumn.id,
        }
      }]
    }
    
    // Fallback para detecção padrão
    return closestCenter(args)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    const activeId = active.id.toString()

    if (!over) {
      setActiveId(null)
      setActiveType(null)
      return
    }

    const overId = over.id.toString()

    // Se estiver arrastando uma coluna
    if (activeType === 'column') {
      const sourceIndex = boardData.columns.findIndex(col => col.id === activeId)
      const destinationIndex = boardData.columns.findIndex(col => col.id === overId)
      
      if (sourceIndex !== -1 && destinationIndex !== -1 && sourceIndex !== destinationIndex) {
        // Calcular o índice de destino baseado na direção do movimento
        let finalDestinationIndex = destinationIndex
        
        // Se estiver movendo para a direita, o índice já está correto
        // Se estiver movendo para a esquerda, também está correto
        // O problema pode ser que o @dnd-kit está detectando a coluna errada
        
        // Chamar sem await para não bloquear - o estado já foi atualizado otimisticamente
        moveColumn(boardId, sourceIndex, finalDestinationIndex)
          .then(() => {
            if (showToast) {
              showToast('Coluna movida', 'success')
            }
          })
          .catch((error) => {
            console.error('Erro ao mover coluna:', error)
            if (showToast) {
              showToast('Erro ao mover coluna', 'error')
            }
          })
      }
    } else {
      // Se estiver arrastando um card
      let sourceColumnId = null
      let sourceIndex = null
      let destinationColumnId = null
      let destinationIndex = null

      boardData.columns.forEach((column) => {
        const cardIndex = column.cards.findIndex((card) => card.id === activeId)
        if (cardIndex !== -1) {
          sourceColumnId = column.id
          sourceIndex = cardIndex
        }
      })

      // Verificar se está sendo arrastado sobre uma área droppable (coluna vazia)
      if (overId.startsWith('droppable-')) {
        destinationColumnId = overId.replace('droppable-', '')
        const destColumn = boardData.columns.find(col => col.id === destinationColumnId)
        destinationIndex = destColumn ? destColumn.cards.length : 0
    } else {
      // Está sendo arrastado sobre outro card ou sobre o cabeçalho de uma coluna
      boardData.columns.forEach((column) => {
        const cardIndex = column.cards.findIndex((card) => card.id === overId)
        if (cardIndex !== -1) {
          destinationColumnId = column.id
          destinationIndex = cardIndex
        }
      })

      // Se não encontrou card, pode estar sobre o cabeçalho da coluna
      if (!destinationColumnId) {
        const column = boardData.columns.find(col => col.id === overId)
        if (column) {
          destinationColumnId = column.id
          destinationIndex = column.cards.length
        }
      }
    }

      if (sourceColumnId && destinationColumnId && sourceIndex !== null && destinationIndex !== null) {
        // Se for a mesma coluna, ajustar o índice de destino
        if (sourceColumnId === destinationColumnId) {
          if (sourceIndex === destinationIndex) {
            setActiveId(null)
            setActiveType(null)
            return
          }
          // Se estiver movendo para baixo, ajustar o índice
          if (sourceIndex < destinationIndex) {
            destinationIndex = destinationIndex + 1
          }
        } else {
          // Se estiver movendo para outra coluna, ajustar o índice
          if (destinationIndex > 0) {
            destinationIndex = destinationIndex + 1
          }
        }

        // Chamar sem await para não bloquear - o estado já foi atualizado otimisticamente
        moveCard(boardId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex)
          .then(() => {
            if (showToast) {
              const sourceCol = boardData.columns.find(col => col.id === sourceColumnId)
              const destCol = boardData.columns.find(col => col.id === destinationColumnId)
              if (sourceCol && destCol && sourceCol.id !== destCol.id) {
                showToast('Tarefa movida', 'success')
              }
            }
          })
          .catch((error) => {
            console.error('Erro ao mover card:', error)
            if (showToast) {
              showToast('Erro ao mover tarefa', 'error')
            }
          })
      }
    }

    setActiveId(null)
    setActiveType(null)
    activeTypeRef.current = null // Limpar ref também
    
    // Reabilitar scroll após o drag
    if (boardContainerRef.current) {
      boardContainerRef.current.style.overflowX = 'auto'
      boardContainerRef.current.style.touchAction = 'pan-x'
    }
  }

  const activeCard = activeId ? boardData.columns
    .flatMap(col => col.cards)
    .find(card => card.id === activeId) : null

  // Implementar scroll horizontal com roda do mouse
  useEffect(() => {
    const container = boardContainerRef.current
    if (!container) return

    const handleWheel = (e) => {
      // Verificar se o evento está sobre uma área de cards de coluna
      const target = e.target
      const columnCardsElement = target.closest('.column-cards')
      
      // Se estiver sobre uma área de cards, permitir scroll vertical normal
      if (columnCardsElement) {
        return
      }

      // Verificar se há overflow horizontal
      if (container.scrollWidth > container.clientWidth) {
        // Prevenir scroll vertical padrão
        e.preventDefault()
        // Converter scroll vertical em horizontal
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [boardData.columns.length])

  return (
    <div className="board-container" ref={boardContainerRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={horizontalCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {isMobile ? (
          <>
            <div className="board-columns-mobile">
              <ColumnCarousel
                boardId={boardId}
                columns={boardData.columns}
                showToast={showToast}
                currentIndex={currentColumnIndex}
                setCurrentIndex={setCurrentColumnIndex}
              />
            </div>
            <div className="board-mobile-footer">
              {boardData.columns.length > 1 && (
                <div className="column-carousel-indicators">
                  {boardData.columns.map((_, index) => (
                    <button
                      key={index}
                      className={`column-carousel-indicator ${index === currentColumnIndex ? 'active' : ''}`}
                      onClick={() => setCurrentColumnIndex(index)}
                      aria-label={`Ir para coluna ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              {showAddColumn ? (
                <div className="board-add-column-form">
                  <input
                    className="board-add-column-input"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={handleAddColumnKeyDown}
                    placeholder="Nome da coluna..."
                    autoFocus
                  />
                  <div className="board-add-column-actions">
                    <button
                      className="board-add-column-button"
                      onClick={handleAddColumn}
                    >
                      Adicionar
                    </button>
                    <button
                      className="board-add-column-button"
                      onClick={() => {
                        setShowAddColumn(false)
                        setNewColumnTitle('')
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="board-add-column-button-main"
                  onClick={() => setShowAddColumn(true)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                  Adicionar Coluna
                </button>
              )}
            </div>
          </>
        ) : (
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div className="board-columns">
              {boardData.columns.map((column) => (
                <Column
                  key={column.id}
                  boardId={boardId}
                  column={column}
                  showToast={showToast}
                />
              ))}
            {showAddColumn ? (
              <div className="board-add-column-form">
                <input
                  className="board-add-column-input"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={handleAddColumnKeyDown}
                  placeholder="Nome da coluna..."
                  autoFocus
                />
                <div className="board-add-column-actions">
                  <button
                    className="board-add-column-button"
                    onClick={handleAddColumn}
                  >
                    Adicionar
                  </button>
                  <button
                    className="board-add-column-button"
                    onClick={() => {
                      setShowAddColumn(false)
                      setNewColumnTitle('')
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="board-add-column-button-main"
                onClick={() => setShowAddColumn(true)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                Adicionar Coluna
              </button>
            )}
            </div>
          </SortableContext>
        )}
        <DragOverlay>
          {activeCard ? (
            <div className="card card-dragging">
              <h3 className="card-title">{activeCard.title}</h3>
              {activeCard.description && (
                <p className="card-description">{activeCard.description}</p>
              )}
              {activeCard.assignee && (
                <div className="card-assignee">
                  <span className="card-assignee-label">Responsável:</span>
                  <span className="card-assignee-name">{activeCard.assignee}</span>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Board

