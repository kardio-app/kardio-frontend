import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import CommentsSection from '../CommentsSection/CommentsSection'
import './ModalCard.css'

function ModalCard({ boardId, columnId, card, onClose, showToast }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateCard = useBoardStore((state) => state.updateCard)
  const deleteCard = useBoardStore((state) => state.deleteCard)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [assignee, setAssignee] = useState(card.assignee || '')
  const [labelIds, setLabelIds] = useState(card.label_ids || [])
  const [highlightLabelId, setHighlightLabelId] = useState(card.highlight_label_id || null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('card')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const initialValues = useRef({
    title: card.title,
    description: card.description || '',
    assignee: card.assignee || '',
    label_ids: card.label_ids || [],
    highlight_label_id: card.highlight_label_id || null
  })

  const board = boards[boardId] || getBoard(boardId)
  const labels = board.labels || []
  
  // Buscar o card atualizado do store
  const currentCard = board.columns
    .flatMap(col => col.cards)
    .find(c => c.id === card.id) || card

  // Atualizar valores quando o modal é aberto ou quando o card é atualizado no store
  const isInitialMount = useRef(true)
  const cardIdRef = useRef(card.id)
  const lastSavedLabelIds = useRef(currentCard.label_ids || [])
  const lastSavedHighlightLabelId = useRef(currentCard.highlight_label_id || null)
  
  useEffect(() => {
    // Se o card mudou (modal foi fechado e reaberto), resetar valores
    if (cardIdRef.current !== card.id) {
      cardIdRef.current = card.id
      isInitialMount.current = true
      lastSavedLabelIds.current = currentCard.label_ids || []
      lastSavedHighlightLabelId.current = currentCard.highlight_label_id || null
    }
    
    // Se é a primeira renderização ou se o card foi atualizado no store (e não há alterações não salvas)
    if (isInitialMount.current) {
      const cardToUse = currentCard
      const initialLabelIds = Array.isArray(cardToUse.label_ids) ? cardToUse.label_ids : []
      const initialHighlightLabelId = cardToUse.highlight_label_id || null
      setTitle(cardToUse.title)
      setDescription(cardToUse.description || '')
      setAssignee(cardToUse.assignee || '')
      setLabelIds(initialLabelIds)
      setHighlightLabelId(initialHighlightLabelId)
      initialValues.current = {
        title: cardToUse.title,
        description: cardToUse.description || '',
        assignee: cardToUse.assignee || '',
        label_ids: [...initialLabelIds],
        highlight_label_id: initialHighlightLabelId
      }
      lastSavedLabelIds.current = [...initialLabelIds]
      lastSavedHighlightLabelId.current = initialHighlightLabelId
      isInitialMount.current = false
    } else {
      // Se o card foi atualizado no store (por outro usuário ou sincronização)
      // Verificar se há alterações não salvas comparando com valores iniciais
      const hasLocalChanges = 
        title.trim() !== initialValues.current.title ||
        description.trim() !== initialValues.current.description ||
        assignee.trim() !== initialValues.current.assignee ||
        JSON.stringify((Array.isArray(labelIds) ? labelIds : []).sort()) !== 
        JSON.stringify((Array.isArray(initialValues.current.label_ids) ? initialValues.current.label_ids : []).sort()) ||
        highlightLabelId !== initialValues.current.highlight_label_id
      
      // Se não há alterações locais não salvas, atualizar com dados do store
      if (!hasLocalChanges) {
        const currentLabelIds = Array.isArray(currentCard.label_ids) ? currentCard.label_ids : []
        const currentLabelIdsStr = JSON.stringify(currentLabelIds.sort())
        const savedLabelIdsStr = JSON.stringify(lastSavedLabelIds.current.sort())
        
        // Se as legendas mudaram no store
        if (currentLabelIdsStr !== savedLabelIdsStr) {
          setLabelIds(currentLabelIds)
          initialValues.current.label_ids = [...currentLabelIds]
          lastSavedLabelIds.current = [...currentLabelIds]
        }
        
        // Se a legenda de destaque mudou no store
        const currentHighlightLabelId = currentCard.highlight_label_id || null
        if (currentHighlightLabelId !== lastSavedHighlightLabelId.current) {
          setHighlightLabelId(currentHighlightLabelId)
          initialValues.current.highlight_label_id = currentHighlightLabelId
          lastSavedHighlightLabelId.current = currentHighlightLabelId
        }
        
        // Atualizar outros campos se mudaram no store
        if (currentCard.title !== title) {
          setTitle(currentCard.title)
          initialValues.current.title = currentCard.title
        }
        if ((currentCard.description || '') !== description) {
          setDescription(currentCard.description || '')
          initialValues.current.description = currentCard.description || ''
        }
        if ((currentCard.assignee || '') !== assignee) {
          setAssignee(currentCard.assignee || '')
          initialValues.current.assignee = currentCard.assignee || ''
        }
      }
    }
  }, [card.id, currentCard.label_ids, currentCard.title, currentCard.description, currentCard.assignee, title, description, assignee, labelIds])

  // Verificar se há alterações não salvas
  useEffect(() => {
    const currentLabelIds = Array.isArray(labelIds) ? labelIds : []
    const initialLabelIds = Array.isArray(initialValues.current.label_ids) ? initialValues.current.label_ids : []
    const hasChanges = 
      title.trim() !== initialValues.current.title ||
      description.trim() !== initialValues.current.description ||
      assignee.trim() !== initialValues.current.assignee ||
      JSON.stringify(currentLabelIds.sort()) !== JSON.stringify(initialLabelIds.sort()) ||
      highlightLabelId !== initialValues.current.highlight_label_id
    
    setHasUnsavedChanges(hasChanges)
  }, [title, description, assignee, labelIds, highlightLabelId])

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('Você tem alterações não salvas. Deseja descartá-las e fechar?')
      if (!confirmClose) return
    }
    onClose()
  }, [hasUnsavedChanges, onClose])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleClose])

  const handleSave = async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      await updateCard(boardId, columnId, card.id, {
        title: title.trim() || card.title,
        description: description.trim(),
        assignee: assignee.trim(),
        label_ids: labelIds,
        highlight_label_id: highlightLabelId
      })
      
      // Atualizar valores iniciais após salvar
      const savedLabelIds = Array.isArray(labelIds) ? labelIds : []
      const savedHighlightLabelId = highlightLabelId || null
      initialValues.current = {
        title: title.trim() || card.title,
        description: description.trim(),
        assignee: assignee.trim(),
        label_ids: [...savedLabelIds],
        highlight_label_id: savedHighlightLabelId
      }
      lastSavedLabelIds.current = [...savedLabelIds]
      lastSavedHighlightLabelId.current = savedHighlightLabelId
      setHasUnsavedChanges(false)
      
      if (showToast) {
        showToast('Tarefa atualizada', 'success')
      }
      
      // Fechar modal após salvar com sucesso
      onClose()
    } catch (error) {
      console.error('Erro ao salvar card:', error)
      if (showToast) {
        showToast('Erro ao salvar alterações', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCard(boardId, columnId, card.id)
      setShowDeleteConfirm(false)
      if (showToast) {
        showToast(`Tarefa "${card.title}" excluída`, 'success')
      }
      onClose()
    } catch (error) {
      console.error('Erro ao deletar card:', error)
      if (showToast) {
        showToast('Erro ao excluir tarefa', 'error')
      }
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content modal-content-with-comments" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-title-wrapper">
              <svg className="modal-title-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <input
                className="modal-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do card"
              />
            </div>
            <div className="modal-header-right">
              <div className="modal-header-divider"></div>
              <button
                className="modal-close-button"
                onClick={handleClose}
                aria-label="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          {isMobile && (
            <div className="modal-tabs">
              <button
                className={`modal-tab ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Card
              </button>
              <button
                className={`modal-tab ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Comentários
              </button>
            </div>
          )}
        </div>

        <div className="modal-body-wrapper">
          {(!isMobile || activeTab === 'card') && (
            <div className="modal-left-panel">
              <div className="modal-body">
                <div className="modal-main-content">
                  <div className="modal-section">
                    <div className="modal-section-header">
                      <svg className="modal-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      <label className="modal-label">Descrição</label>
                    </div>
                    <textarea
                      className="modal-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Adicione uma descrição detalhada..."
                      rows={6}
                    />
                  </div>

                  <div className="modal-details-grid">
                    <div className="modal-section">
                      <div className="modal-section-header">
                        <svg className="modal-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <label className="modal-label">Responsável</label>
                      </div>
                      <input
                        className="modal-input"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>

                    <div className="modal-section">
                      <div className="modal-section-header">
                        <svg className="modal-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 7h.01"></path>
                          <path d="M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"></path>
                        </svg>
                        <label className="modal-label">Legendas</label>
                      </div>
                      {labels.length === 0 ? (
                        <div className="modal-no-labels-wrapper">
                          <p className="modal-no-labels">Nenhuma legenda criada ainda. Crie legendas no menu do header.</p>
                        </div>
                      ) : (
                        <div className="modal-labels-list">
                          {labels.map((label) => {
                            const isSelected = labelIds.includes(label.id)
                            const isHighlight = highlightLabelId === label.id
                            return (
                              <div key={label.id} className={`modal-label-item-wrapper ${isSelected ? 'selected' : ''}`}>
                                <label className="modal-label-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      setLabelIds(prevIds => {
                                        const currentIds = Array.isArray(prevIds) ? prevIds : []
                                        if (e.target.checked) {
                                          // Adicionar se não estiver já na lista
                                          if (!currentIds.includes(label.id)) {
                                            return [...currentIds, label.id]
                                          }
                                          return currentIds
                                        } else {
                                          // Remover da lista e também remover como destaque se for o caso
                                          if (highlightLabelId === label.id) {
                                            setHighlightLabelId(null)
                                          }
                                          return currentIds.filter(id => id !== label.id)
                                        }
                                      })
                                    }}
                                    className="modal-label-checkbox"
                                  />
                                  <div 
                                    className="modal-label-checkbox-preview" 
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {isSelected && (
                                      <svg 
                                        className="modal-label-check-icon" 
                                        width="14" 
                                        height="14" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke={getContrastColor(label.color)} 
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                    <span 
                                      className="modal-label-checkbox-text" 
                                      style={{ color: getContrastColor(label.color) }}
                                    >
                                      {label.name}
                                    </span>
                                  </div>
                                </label>
                                {isSelected && (
                                  <button
                                    type="button"
                                    className={`modal-label-highlight-button ${isHighlight ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setHighlightLabelId(isHighlight ? null : label.id)
                                    }}
                                    title={isHighlight ? 'Remover destaque' : 'Marcar como destaque'}
                                    aria-label={isHighlight ? 'Remover destaque' : 'Marcar como destaque'}
                                  >
                                    <svg 
                                      width="16" 
                                      height="16" 
                                      viewBox="0 0 24 24" 
                                      fill={isHighlight ? 'currentColor' : 'none'} 
                                      stroke="currentColor" 
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {(currentCard.created_at || card.created_at) && (
                    <div className="modal-section">
                      <div className="modal-section-header">
                        <svg className="modal-section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <label className="modal-label">Data de abertura</label>
                      </div>
                      <div className="modal-date-display">
                        {formatDateForModal(currentCard.created_at || card.created_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-button modal-button-delete"
                  onClick={handleDelete}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Excluir
                </button>
                <button
                  className="modal-button modal-button-save"
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                >
                  {isSaving ? (
                    <>
                      <svg className="modal-button-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!isMobile && <div className="modal-divider"></div>}

          {(!isMobile || activeTab === 'comments') && (
            <CommentsSection 
              boardId={boardId} 
              cardId={card.id} 
              showToast={showToast}
            />
          )}
        </div>
      </div>
      {showDeleteConfirm && (
        <ModalConfirm
          title="Excluir Tarefa"
          message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      )}
    </div>,
    document.body
  )
}

// Função para determinar a cor do texto com melhor contraste
function getContrastColor(hexColor) {
  if (!hexColor || hexColor.length !== 7) return '#FFFFFF'
  
  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)
  
  // Calcular luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retornar preto para cores claras e branco para cores escuras
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Função para formatar a data no modal (relativo + data completa)
function formatDateForModal(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  
  // Normalizar para meia-noite para comparar apenas as datas (ignorar hora)
  const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Calcular diferença em dias
  const diffTime = nowNormalized - dateNormalized
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Formatar data completa em pt-BR
  const fullDate = date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
  
  // Texto relativo
  let relativeText = ''
  
  // Se for hoje
  if (diffDays === 0) {
    relativeText = 'Hoje'
  }
  // Se for ontem
  else if (diffDays === 1) {
    relativeText = 'Ontem'
  }
  // Se for há menos de 7 dias
  else if (diffDays < 7) {
    relativeText = `${diffDays} dias atrás`
  }
  // Se for há menos de 30 dias
  else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    relativeText = weeks === 1 ? '1 semana atrás' : `${weeks} semanas atrás`
  }
  // Se for há menos de 365 dias
  else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    relativeText = months === 1 ? '1 mês atrás' : `${months} meses atrás`
  }
  // Mais de 1 ano
  else {
    const years = Math.floor(diffDays / 365)
    relativeText = years === 1 ? '1 ano atrás' : `${years} anos atrás`
  }
  
  // Retornar relativo + data completa
  return `${relativeText} (${fullDate})`
}

export default ModalCard

