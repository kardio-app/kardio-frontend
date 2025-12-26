import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ModalCreateProject.css'

function ModalCreateProject({ onConfirm, onCancel }) {
  const [step, setStep] = useState(1) // 1: tipo, 2: nome
  const [projectType, setProjectType] = useState(null) // 'personal' ou 'managerial'
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  useEffect(() => {
    if (step === 2) {
      const input = document.querySelector('.modal-create-project-input')
      if (input) {
        input.focus()
      }
    }
  }, [step])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleTypeSelect = (type) => {
    setProjectType(type)
    if (type === 'personal') {
      setStep(2)
    } else {
      setStep(2)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (projectName.trim()) {
      onConfirm({
        type: projectType,
        name: projectName.trim()
      })
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setProjectName('')
    }
  }

  return createPortal(
    <div 
      className="modal-create-project-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className="modal-create-project-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-create-project-header">
          <h3 className="modal-create-project-title">
            {step === 1 ? 'Criar Novo Projeto' : 'Nome do Projeto'}
          </h3>
          <button
            className="modal-create-project-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-create-project-body">
          {step === 1 ? (
            <div className="modal-create-project-step">
              <p className="modal-create-project-question">
                O projeto será pessoal ou gerencial?
              </p>
              <div className="modal-create-project-options">
                <button
                  className="modal-create-project-option"
                  onClick={() => handleTypeSelect('personal')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <div className="modal-create-project-option-content">
                    <h4>Pessoal</h4>
                    <p>Para uso individual e projetos próprios</p>
                  </div>
                </button>
                <button
                  className="modal-create-project-option"
                  onClick={() => handleTypeSelect('managerial')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <div className="modal-create-project-option-content">
                    <h4>Gerencial</h4>
                    <p>Para gerenciar múltiplos projetos vinculados</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form className="modal-create-project-form" onSubmit={handleSubmit}>
              <div className="modal-create-project-step">
                <p className="modal-create-project-question">
                  {projectType === 'personal' 
                    ? 'Qual o nome do seu projeto pessoal?'
                    : 'Qual o nome do projeto profissional?'
                  }
                </p>
                <input
                  type="text"
                  className="modal-create-project-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={projectType === 'personal' ? 'Ex: Meu Projeto' : 'Ex: Projeto Empresa'}
                  maxLength={255}
                  required
                />
              </div>
              <div className="modal-create-project-actions">
                <button
                  type="button"
                  className="modal-create-project-button modal-create-project-button-cancel"
                  onClick={handleBack}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="modal-create-project-button modal-create-project-button-submit"
                  disabled={!projectName.trim()}
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalCreateProject

