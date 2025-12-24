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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768)
  const [hasScrollbar, setHasScrollbar] = useState(false)
  const cardsRef = useRef(null)

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

  const cardIds = currentColumn.cards.map(card => card.id)

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
      try {
        await addCard(boardId, column.id, {
          title: newCardTitle.trim(),
          description: '',
          assignee: '',
        })
        setNewCardTitle('')
        setShowAddCard(false)
        if (showToast) {
          showToast(`Tarefa "${newCardTitle.trim()}" criada`, 'success')
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
    try {
      await addCard(boardId, column.id, {
        title: title,
        description: '',
        assignee: '',
      })
      setShowAddCardModal(false)
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
        className={`column ${isDragging ? 'column-dragging' : ''}`}
      >
        <div className="column-header">
          <div 
            className="column-drag-handle"
            {...(!isMobile ? attributes : {})}
            {...(!isMobile ? listeners : {})}
            onClick={(e) => {
              if (isMobile) {
                e.stopPropagation()
                setShowMoveModal(true)
              }
            }}
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
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </div>
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
                setIsEditing(true)
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {title}
            </h2>
          )}
          <div className="column-header-right">
            <span className="column-count">{currentColumn.cards.length}</span>
            <button
              className="column-delete-button"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteColumn()
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Excluir coluna"
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
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
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
            {currentColumn.cards.map((card) => (
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
                <input
                  className="column-add-card-input"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={handleAddCardKeyDown}
                  placeholder="Título do card..."
                  autoFocus
                />
                <div className="column-add-card-actions">
                  <button
                    className="column-add-card-button"
                    onClick={handleAddCard}
                  >
                    Adicionar
                  </button>
                  <button
                    className="column-add-card-button"
                    onClick={() => {
                      setShowAddCard(false)
                      setNewCardTitle('')
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="column-add-button"
                onClick={() => {
                  setShowAddCardModal(true)
                }}
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
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                Adicionar Tarefa
              </button>
            )
          )}
        </div>
      </SortableContext>
      
      {/* No desktop, botão e formulário ficam fora do scroll */}
      {!isMobile && (
        showAddCard ? (
          <div className="column-add-card-form">
            <input
              className="column-add-card-input"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleAddCardKeyDown}
              placeholder="Título do card..."
              autoFocus
            />
            <div className="column-add-card-actions">
              <button
                className="column-add-card-button"
                onClick={handleAddCard}
              >
                Adicionar
              </button>
              <button
                className="column-add-card-button"
                onClick={() => {
                  setShowAddCard(false)
                  setNewCardTitle('')
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="column-add-button"
            onClick={() => {
              setShowAddCard(true)
            }}
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
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
            Adicionar Tarefa
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
    </>
  )
}

export default Column

