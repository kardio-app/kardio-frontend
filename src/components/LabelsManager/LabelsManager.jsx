import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useBoardStore from '../../store/useBoardStore'
import { getLabels, createLabel, updateLabel, deleteLabel } from '../../services/api'
import ModalLabel from '../ModalLabel/ModalLabel'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import './LabelsManager.css'

function LabelsManager({ boardId, showToast, onClose }) {
  const boards = useBoardStore((state) => state.boards)
  const getBoard = useBoardStore((state) => state.getBoard)
  const updateBoard = useBoardStore((state) => state.updateBoard)
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [editingLabel, setEditingLabel] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const board = boards[boardId] || getBoard(boardId)

  useEffect(() => {
    loadLabels()
  }, [boardId])

  const loadLabels = async () => {
    try {
      setLoading(true)
      const labelsData = board.labels || await getLabels(boardId)
      setLabels(labelsData)
      
      // Atualizar store se necessário
      if (!board.labels) {
        updateBoard(boardId, { labels: labelsData })
      }
    } catch (error) {
      console.error('Erro ao carregar legendas:', error)
      if (showToast) {
        showToast('Erro ao carregar legendas', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLabel = () => {
    setEditingLabel(null)
    setShowLabelModal(true)
  }

  const handleEditLabel = (label) => {
    setEditingLabel(label)
    setShowLabelModal(true)
  }

  const handleSaveLabel = async (labelData) => {
    try {
      if (editingLabel) {
        // Atualizar legenda existente
        const updatedLabel = await updateLabel(boardId, editingLabel.id, labelData)
        const newLabels = labels.map(l => l.id === editingLabel.id ? updatedLabel : l)
        setLabels(newLabels)
        updateBoard(boardId, { labels: newLabels })
        if (showToast) {
          showToast('Legenda atualizada', 'success')
        }
      } else {
        // Criar nova legenda
        const newLabel = await createLabel(boardId, labelData)
        const newLabels = [...labels, newLabel]
        setLabels(newLabels)
        updateBoard(boardId, { labels: newLabels })
        if (showToast) {
          showToast('Legenda criada', 'success')
        }
      }
      setShowLabelModal(false)
      setEditingLabel(null)
    } catch (error) {
      console.error('Erro ao salvar legenda:', error)
      if (showToast) {
        showToast('Erro ao salvar legenda', 'error')
      }
      throw error
    }
  }

  const handleDeleteLabel = async () => {
    if (!showDeleteConfirm) return

    try {
      await deleteLabel(boardId, showDeleteConfirm.id)
      const newLabels = labels.filter(l => l.id !== showDeleteConfirm.id)
      setLabels(newLabels)
      updateBoard(boardId, { labels: newLabels })
      setShowDeleteConfirm(null)
      if (showToast) {
        showToast('Legenda excluída', 'success')
      }
    } catch (error) {
      console.error('Erro ao deletar legenda:', error)
      if (showToast) {
        showToast('Erro ao excluir legenda', 'error')
      }
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return createPortal(
    <div 
      className="labels-manager-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="labels-manager-content" onClick={(e) => e.stopPropagation()}>
        <div className="labels-manager-header">
          <h2 className="labels-manager-title">Gerenciar Legendas</h2>
          <button
            className="labels-manager-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="labels-manager-body">
          {loading ? (
            <div className="labels-manager-loading">Carregando...</div>
          ) : (
            <>
              <div className="labels-manager-list">
                {labels.length === 0 ? (
                  <div className="labels-manager-empty">
                    Nenhuma legenda criada ainda
                  </div>
                ) : (
                  labels.map((label) => (
                    <div key={label.id} className="labels-manager-item">
                      <div className="labels-manager-item-preview" style={{ backgroundColor: label.color }}>
                        <span className="labels-manager-item-name" style={{ color: getContrastColor(label.color) }}>
                          {label.name}
                        </span>
                      </div>
                      <div className="labels-manager-item-actions">
                        <button
                          className="labels-manager-button labels-manager-button-edit"
                          onClick={() => handleEditLabel(label)}
                          title="Editar legenda"
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
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="labels-manager-button labels-manager-button-delete"
                          onClick={() => setShowDeleteConfirm(label)}
                          title="Excluir legenda"
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
                  ))
                )}
              </div>
              <div className="labels-manager-footer">
                <button
                  className="labels-manager-button labels-manager-button-add"
                  onClick={handleCreateLabel}
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
                  Nova Legenda
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showLabelModal && (
        <ModalLabel
          label={editingLabel}
          onConfirm={handleSaveLabel}
          onCancel={() => {
            setShowLabelModal(false)
            setEditingLabel(null)
          }}
          showToast={showToast}
        />
      )}

      {showDeleteConfirm && (
        <ModalConfirm
          title="Excluir Legenda"
          message={`Tem certeza que deseja excluir a legenda "${showDeleteConfirm.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDeleteLabel}
          onCancel={() => setShowDeleteConfirm(null)}
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

export default LabelsManager

