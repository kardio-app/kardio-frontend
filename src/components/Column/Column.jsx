import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useBoardStore from '../../store/useBoardStore'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import ModalMoveColumn from '../ModalMoveColumn/ModalMoveColumn'
import ModalAddCard from '../ModalAddCard/ModalAddCard'
import ModalColumnLabel from '../ModalColumnLabel/ModalColumnLabel'
import ColumnDropdown from '../ColumnDropdown/ColumnDropdown'
import Card from '../Card/Card'
import './Column.css'

function Column({ boardId, column, showToast }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateColumn = useBoardStore((state) => state.updateColumn)
  const deleteColumn = useBoardStore((state) => state.deleteColumn)
  const addCard = useBoardStore((state) => state.addCard)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768)
  const [hasScrollbar, setHasScrollbar] = useState(false)
  const cardsRef = useRef(null)
  const settingsButtonRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${column.id}`,
  })

  // Combinar refs
  const setNodeRef = (node) => {
    setSortableRef(node)
    setDroppableRef(node)
  }

  // Otimizar cálculo do transform apenas quando necessário
  const transformString = useMemo(() => {
    return transform ? CSS.Transform.toString(transform) : undefined
  }, [transform])

  const style = useMemo(() => ({
    transform: transformString,
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transformString, transition, isDragging])

  // Atualizar coluna quando boards mudar
  const currentBoard = boards[boardId] || getBoard(boardId)
  const currentColumn = currentBoard.columns.find(col => col.id === column.id) || column
  const [title, setTitle] = useState(currentColumn.title)
  
  // Buscar a legenda selecionada
  const labels = currentBoard.labels || []
  const selectedLabel = currentColumn.label_id 
    ? labels.find(l => l.id === currentColumn.label_id) 
    : null

  // Verificar se há scrollbar
  useEffect(() => {
    const checkScrollbar = () => {
      if (cardsRef.current) {
        const hasScroll = cardsRef.current.scrollHeight > cardsRef.current.clientHeight
        setHasScrollbar(hasScroll)
      }
    }

    // Verificar imediatamente
    checkScrollbar()
    
    // Verificar quando o tamanho do container ou conteúdo muda
    const observer = new ResizeObserver(checkScrollbar)
    if (cardsRef.current) {
      observer.observe(cardsRef.current)
    }

    // Verificar também quando os cards mudam (usar timeout para aguardar renderização)
    const timeoutId = setTimeout(checkScrollbar, 0)

    return () => {
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [currentColumn.cards.length])
  
  // Encontrar posição atual da coluna
  const currentPosition = currentBoard.columns.findIndex(col => col.id === column.id)
  const totalColumns = currentBoard.columns.length

  // Sincronizar título quando coluna mudar
  useEffect(() => {
    if (!isEditing) {
      setTitle(currentColumn.title)
    }
  }, [currentColumn.title, isEditing])

  // Aplicar filtros aos cards
  const filters = currentBoard.filters || {}
  const filteredCards = useMemo(() => {
    let cards = currentColumn.cards || []
    
    // Filtro por legendas
    if (filters.labels && filters.labels.length > 0) {
      cards = cards.filter(card => {
        const cardLabelIds = card.label_ids || []
        return filters.labels.some(labelId => cardLabelIds.includes(labelId))
      })
    }
    
    // Filtro por responsável
    if (filters.assignees && filters.assignees.length > 0) {
      cards = cards.filter(card => 
        card.assignee && filters.assignees.includes(card.assignee)
      )
    }
    
    // Filtro por status de conclusão
    if (filters.completionStatus === 'completed') {
      cards = cards.filter(card => card.is_completed === true)
    } else if (filters.completionStatus === 'not-completed') {
      cards = cards.filter(card => !card.is_completed)
    }
    
    // Filtro por data
    if (filters.dateFilter && filters.dateFilter !== 'all' && cards.length > 0) {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setDate(now.getDate() - 30)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          break
      }
      
      cards = cards.filter(card => {
        if (!card.created_at) return false
        const cardDate = new Date(card.created_at)
        return cardDate >= filterDate
      })
    }
    
    return cards
  }, [currentColumn.cards, filters])
  
  const cardIds = filteredCards.map(card => card.id)

  const handleSettingsClick = (e) => {
    e.stopPropagation()
    if (settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      })
      setShowDropdown(true)
    }
  }

  const handleEditLabel = () => {
    setShowLabelModal(true)
  }

  const handleLabelConfirm = async (data) => {
    try {
      await updateColumn(boardId, column.id, data)
      setShowLabelModal(false)
      if (showToast) {
        if (data.label_id) {
          const label = labels.find(l => l.id === data.label_id)
          if (label) {
            showToast(`Legenda "${label.name}" adicionada à coluna`, 'success')
          }
        } else {
          showToast('Legenda removida da coluna', 'success')
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar legenda da coluna:', error)
      if (showToast) {
        showToast('Erro ao atualizar legenda', 'error')
      }
    }
  }

  const handleDeleteColumn = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteColumn(boardId, column.id)
      setShowDeleteConfirm(false)
      if (showToast) {
        showToast(`Coluna "${column.title}" excluída`, 'success')
      }
    } catch (error) {
      console.error('Erro ao deletar coluna:', error)
      if (showToast) {
        showToast('Erro ao excluir coluna', 'error')
      }
    }
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = async () => {
    setIsEditing(false)
    if (title.trim() && title.trim() !== column.title) {
      try {
        await updateColumn(boardId, column.id, { title: title.trim() })
        if (showToast) {
          showToast(`Coluna renomeada para "${title.trim()}"`, 'success')
        }
      } catch (error) {
        console.error('Erro ao atualizar título da coluna:', error)
        if (showToast) {
          showToast('Erro ao atualizar nome da coluna', 'error')
        }
        setTitle(column.title)
      }
    } else {
      setTitle(column.title)
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      const cardTitle = newCardTitle.trim()
      // Fechar formulário imediatamente (atualização otimista já mostra o card)
      setNewCardTitle('')
      setShowAddCard(false)
      try {
        await addCard(boardId, column.id, {
          title: cardTitle,
          description: '',
          assignee: '',
        })
        if (showToast) {
          showToast(`Tarefa "${cardTitle}" criada`, 'success')
        }
      } catch (error) {
        console.error('Erro ao criar card:', error)
        if (showToast) {
          showToast('Erro ao criar tarefa', 'error')
        }
      }
    }
  }

  const handleAddCardFromModal = async (title) => {
    // Fechar modal imediatamente (atualização otimista já mostra o card)
    setShowAddCardModal(false)
    try {
      await addCard(boardId, column.id, {
        title: title,
        description: '',
        assignee: '',
      })
      if (showToast) {
        showToast(`Tarefa "${title}" criada`, 'success')
      }
    } catch (error) {
      console.error('Erro ao criar card:', error)
      if (showToast) {
        showToast('Erro ao criar tarefa', 'error')
      }
    }
  }

  const handleAddCardKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddCard()
    }
    if (e.key === 'Escape') {
      setShowAddCard(false)
      setNewCardTitle('')
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`column ${isDragging ? 'column-dragging' : ''} ${selectedLabel ? 'has-label' : ''}`}
      >
        <div 
          className="column-label-bar"
          style={{ 
            backgroundColor: selectedLabel ? selectedLabel.color : 'transparent',
            pointerEvents: selectedLabel ? 'auto' : 'auto'
          }}
          title={selectedLabel ? selectedLabel.name : ''}
          {...(!isMobile && !isEditing ? attributes : {})}
          {...(!isMobile && !isEditing ? listeners : {})}
          onClick={(e) => {
            if (isMobile) {
              e.stopPropagation()
              setShowMoveModal(true)
            }
          }}
        />
        <div 
          className="column-header"
          onClick={(e) => {
            if (isMobile && !e.target.closest('.column-title') && !e.target.closest('.column-header-right')) {
              e.stopPropagation()
              setShowMoveModal(true)
            }
          }}
        >
          {isEditing ? (
            <input
              className="column-title-input"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h2
              className="column-title"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsEditing(true)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              {title}
            </h2>
          )}
          <div 
            className="column-header-right"
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <span 
              className="column-count"
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              {filteredCards.length}
            </span>
            <button
              ref={settingsButtonRef}
              className="column-settings-button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleSettingsClick(e)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
              title="Configurações da coluna"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
            </button>
          </div>
        </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div 
          ref={cardsRef}
          className={`column-cards ${isOver ? 'drag-over' : ''} ${hasScrollbar ? 'has-scrollbar' : ''}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {currentColumn.cards.length === 0 && isOver && (
            <div className="column-drop-indicator">
              Solte aqui
            </div>
          )}
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                boardId={boardId}
                columnId={column.id}
                card={card}
                showToast={showToast}
                columns={currentBoard.columns}
              />
            ))}
          
          {/* No mobile, botão e formulário ficam dentro do scroll */}
          {isMobile && (
            showAddCard ? (
              <div className="column-add-card-form">
                <div className="column-add-card-input-wrapper">
                  <input
                    className="column-add-card-input"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={handleAddCardKeyDown}
                    placeholder="Título do card..."
                    autoFocus
                  />
                  <div className="column-add-card-input-actions">
                    <button
                      className="column-add-card-icon-button"
                      onClick={handleAddCard}
                      type="button"
                      title="Adicionar"
                      aria-label="Adicionar"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button
                      className="column-add-card-icon-button column-add-card-icon-button-cancel"
                      onClick={() => {
                        setShowAddCard(false)
                        setNewCardTitle('')
                      }}
                      type="button"
                      title="Cancelar"
                      aria-label="Cancelar"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="column-add-button"
                onClick={() => {
                  setShowAddCardModal(true)
                }}
                title="Adicionar Tarefa"
                aria-label="Adicionar Tarefa"
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
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
              </button>
            )
          )}
        </div>
      </SortableContext>
      
      {/* No desktop, botão e formulário ficam fora do scroll */}
      {!isMobile && (
        showAddCard ? (
          <div className="column-add-card-form">
            <div className="column-add-card-input-wrapper">
              <input
                className="column-add-card-input"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleAddCardKeyDown}
                placeholder="Título do card..."
                autoFocus
              />
              <div className="column-add-card-input-actions">
                <button
                  className="column-add-card-icon-button"
                  onClick={handleAddCard}
                  type="button"
                  title="Adicionar"
                  aria-label="Adicionar"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button
                  className="column-add-card-icon-button column-add-card-icon-button-cancel"
                  onClick={() => {
                    setShowAddCard(false)
                    setNewCardTitle('')
                  }}
                  type="button"
                  title="Cancelar"
                  aria-label="Cancelar"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="column-add-button"
            onClick={() => {
              setShowAddCard(true)
            }}
            title="Adicionar Tarefa"
            aria-label="Adicionar Tarefa"
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
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
          </button>
        )
      )}
      </div>
      {showDeleteConfirm && createPortal(
        <ModalConfirm
          title="Excluir Coluna"
          message="Tem certeza que deseja excluir esta coluna? Todas as tarefas dentro dela serão excluídas. Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />,
        document.body
      )}
      {showMoveModal && (
        <ModalMoveColumn
          boardId={boardId}
          columnId={column.id}
          currentPosition={currentPosition}
          totalColumns={totalColumns}
          onClose={() => setShowMoveModal(false)}
          showToast={showToast}
        />
      )}
      {showAddCardModal && (
        <ModalAddCard
          onConfirm={handleAddCardFromModal}
          onCancel={() => setShowAddCardModal(false)}
        />
      )}
      {showDropdown && (
        <ColumnDropdown
          onEditLabel={handleEditLabel}
          onDelete={handleDeleteColumn}
          onClose={() => setShowDropdown(false)}
          position={dropdownPosition}
          hasLabel={!!currentColumn.label_id}
        />
      )}
      {showLabelModal && (
        <ModalColumnLabel
          boardId={boardId}
          column={currentColumn}
          onConfirm={handleLabelConfirm}
          onCancel={() => setShowLabelModal(false)}
          showToast={showToast}
        />
      )}
    </>
  )
}

export default Column

