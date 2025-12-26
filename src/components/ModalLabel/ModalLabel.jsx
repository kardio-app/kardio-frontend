import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ModalLabel.css'

// Cores pré-definidas para facilitar a seleção
const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
  '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#F39C12',
  '#E67E22', '#95A5A6', '#34495E', '#16A085', '#27AE60'
]

function ModalLabel({ label, onConfirm, onCancel, showToast }) {
  const [name, setName] = useState(label?.name || '')
  const [color, setColor] = useState(label?.color || '#FF6B6B')
  const [customColor, setCustomColor] = useState(label?.color || '#FF6B6B')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Focar no input quando o modal abrir
    const input = document.querySelector('.modal-label-input')
    if (input) {
      input.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      if (showToast) {
        showToast('Nome da legenda é obrigatório', 'error')
      }
      return
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      if (showToast) {
        showToast('Cor inválida', 'error')
      }
      return
    }

    setIsSaving(true)
    try {
      await onConfirm({
        name: name.trim(),
        color: color.toUpperCase()
      })
      setName('')
      setColor('#FF6B6B')
      setCustomColor('#FF6B6B')
    } catch (error) {
      console.error('Erro ao salvar legenda:', error)
      if (showToast) {
        showToast('Erro ao salvar legenda', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handlePresetColorClick = (presetColor) => {
    setColor(presetColor)
    setCustomColor(presetColor)
  }

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    setColor(newColor)
  }

  return createPortal(
    <div 
      className="modal-label-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="modal-label-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-label-header">
          <h3 className="modal-label-title">
            {label ? 'Editar Legenda' : 'Nova Legenda'}
          </h3>
          <button
            className="modal-label-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form className="modal-label-form" onSubmit={handleSubmit}>
          <div className="modal-label-field">
            <label className="modal-label-label">Nome da Legenda</label>
            <input
              className="modal-label-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da legenda"
              autoFocus
              maxLength={255}
            />
          </div>

          <div className="modal-label-field">
            <label className="modal-label-label">Cor</label>
            <div className="modal-label-color-picker">
              <div className="modal-label-preset-colors">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`modal-label-color-button ${color.toUpperCase() === presetColor.toUpperCase() ? 'active' : ''}`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetColorClick(presetColor)}
                    title={presetColor}
                    aria-label={`Selecionar cor ${presetColor}`}
                  />
                ))}
              </div>
              <div className="modal-label-custom-color">
                <label className="modal-label-custom-label">Cor personalizada:</label>
                <div className="modal-label-custom-input-wrapper">
                  <input
                    type="color"
                    className="modal-label-color-input"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    title="Selecionar cor personalizada"
                  />
                  <input
                    type="text"
                    className="modal-label-color-text"
                    value={color}
                    onChange={(e) => {
                      const newColor = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor)) {
                        setColor(newColor)
                        setCustomColor(newColor.length === 7 ? newColor : customColor)
                      }
                    }}
                    placeholder="#RRGGBB"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="modal-label-color-preview" style={{ backgroundColor: color }}>
                <span className="modal-label-color-preview-text" style={{ color: getContrastColor(color) }}>
                  {name || 'Preview'}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-label-actions">
            <button
              type="button"
              className="modal-label-button modal-label-button-cancel"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-label-button modal-label-button-submit"
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? 'Salvando...' : (label ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
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

export default ModalLabel

