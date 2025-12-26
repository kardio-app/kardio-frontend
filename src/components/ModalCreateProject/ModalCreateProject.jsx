import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ModalCreateProject.css'

function ModalCreateProject({ onConfirm, onCancel }) {
  const [step, setStep] = useState(1) // 1: tipo, 2: nome, 3: configuração (apenas gerencial)
  const [projectType, setProjectType] = useState(null) // 'personal' ou 'managerial'
  const [projectName, setProjectName] = useState('')
  const [createMode, setCreateMode] = useState(null) // 'empty' ou 'with-linked'
  const [linkedProjects, setLinkedProjects] = useState(['']) // Array de nomes de projetos pessoais

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
    } else if (step === 3 && linkedProjects.length > 0) {
      const firstInput = document.querySelector('.linked-project-input')
      if (firstInput) {
        firstInput.focus()
      }
    }
  }, [step, linkedProjects.length])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleTypeSelect = (type) => {
    setProjectType(type)
    setStep(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (step === 2) {
      // Se for gerencial, vai para step 3 (configuração)
      if (projectType === 'managerial') {
        setStep(3)
        return
      }
      // Se for pessoal, cria direto
      if (projectName.trim()) {
        onConfirm({
          type: projectType,
          name: projectName.trim()
        })
      }
    } else if (step === 3) {
      // Step 3: Criar projeto gerencial
      if (projectName.trim()) {
        const linkedProjectsNames = createMode === 'with-linked' 
          ? linkedProjects.filter(name => name.trim()).map(name => name.trim())
          : []
        
        onConfirm({
          type: projectType,
          name: projectName.trim(),
          linkedProjects: linkedProjectsNames
        })
      }
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setCreateMode(null)
      setLinkedProjects([''])
    } else if (step === 2) {
      setStep(1)
      setProjectName('')
      setCreateMode(null)
      setLinkedProjects([''])
    }
  }

  const handleCreateModeSelect = (mode) => {
    setCreateMode(mode)
    if (mode === 'with-linked') {
      setLinkedProjects([''])
    } else {
      setLinkedProjects([])
    }
  }

  const handleAddLinkedProject = () => {
    setLinkedProjects([...linkedProjects, ''])
  }

  const handleRemoveLinkedProject = (index) => {
    if (linkedProjects.length > 1) {
      setLinkedProjects(linkedProjects.filter((_, i) => i !== index))
    }
  }

  const handleLinkedProjectChange = (index, value) => {
    const updated = [...linkedProjects]
    updated[index] = value
    setLinkedProjects(updated)
  }

  // Definir steps baseado no tipo de projeto
  const getSteps = () => {
    // Não mostra steps no primeiro modal (seleção de tipo)
    if (step === 1) {
      return []
    }

    // Se ainda não selecionou o tipo, não mostra steps
    if (!projectType) {
      return []
    }

    // Projeto pessoal: Tipo → Nome → Criar Projeto
    if (projectType === 'personal') {
      return [
        { id: 1, title: 'Tipo' },
        { id: 2, title: 'Nome' }
      ]
    }
    
    // Projeto gerencial: Tipo → Nome → Configurações → Criar Projeto
    return [
      { id: 1, title: 'Tipo' },
      { id: 2, title: 'Nome' },
      { id: 3, title: 'Configurações' }
    ]
  }

  const steps = getSteps()
  const currentStepIndex = step

  return createPortal(
    <div 
      className="modal-create-project-backdrop" 
      onClick={handleBackdropClick}
    >
      <div className="modal-create-project-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-create-project-header">
          <h3 className="modal-create-project-title">
            {step === 1 ? 'Criar Novo Projeto' : step === 2 ? 'Nome do Projeto' : 'Configurações'}
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
          ) : step === 2 ? (
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
                  {projectType === 'personal' ? 'Criar Projeto' : 'Avançar'}
                </button>
              </div>
            </form>
          ) : (
            <form className="modal-create-project-form" onSubmit={handleSubmit}>
              <div className="modal-create-project-step">
                <p className="modal-create-project-question">
                  Como deseja criar o projeto gerencial?
                </p>
                <div className="modal-create-project-options">
                  <button
                    type="button"
                    className={`modal-create-project-option ${createMode === 'empty' ? 'selected' : ''}`}
                    onClick={() => handleCreateModeSelect('empty')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    <div className="modal-create-project-option-content">
                      <h4>Criar do zero</h4>
                      <p>Projeto gerencial vazio, sem projetos vinculados</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`modal-create-project-option ${createMode === 'with-linked' ? 'selected' : ''}`}
                    onClick={() => handleCreateModeSelect('with-linked')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      <line x1="17" y1="11" x2="23" y2="11"></line>
                    </svg>
                    <div className="modal-create-project-option-content">
                      <h4>Com projetos vinculados</h4>
                      <p>Criar projetos pessoais já vinculados ao gerencial</p>
                    </div>
                  </button>
                </div>

                {createMode === 'with-linked' && (
                  <div className="linked-projects-container">
                    <p className="linked-projects-label">Projetos pessoais a serem criados:</p>
                    {linkedProjects.map((projectName, index) => (
                      <div key={index} className="linked-project-row">
                        <input
                          type="text"
                          className="linked-project-input modal-create-project-input"
                          value={projectName}
                          onChange={(e) => handleLinkedProjectChange(index, e.target.value)}
                          placeholder={`Nome do projeto pessoal ${index + 1}`}
                          maxLength={255}
                        />
                        {linkedProjects.length > 1 && (
                          <button
                            type="button"
                            className="linked-project-remove"
                            onClick={() => handleRemoveLinkedProject(index)}
                            aria-label="Remover projeto"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="linked-project-add"
                      onClick={handleAddLinkedProject}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Adicionar projeto
                    </button>
                  </div>
                )}
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
                  disabled={!createMode || (createMode === 'with-linked' && linkedProjects.every(p => !p.trim()))}
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Steps Indicator */}
        {steps.length > 0 && (
          <div className="modal-create-project-steps-container">
            {/* Desktop Version */}
            <div className="modal-create-project-steps-desktop">
              {steps.map((stepItem, index) => {
                const isCompleted = stepItem.id < currentStepIndex
                const isCurrent = stepItem.id === currentStepIndex
                const isLast = index === steps.length - 1

                return (
                  <div key={stepItem.id} className="modal-create-project-step-item">
                    <div className="modal-create-project-step-indicator-wrapper">
                      <span 
                        className={`modal-create-project-step-indicator ${
                          isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
                        }`}
                      >
                        {isCompleted ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="step-check-icon">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        ) : (
                          <span className={`step-dot ${isCurrent ? 'current-dot' : ''}`}></span>
                        )}
                      </span>
                      {!isLast && (
                        <span 
                          className={`modal-create-project-step-connector ${
                            isCompleted ? 'completed' : ''
                          }`}
                        ></span>
                      )}
                    </div>
                    <div className="modal-create-project-step-content">
                      <p className={`step-title ${isCurrent ? 'current-title' : ''}`}>
                        {stepItem.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Version */}
            <div className="modal-create-project-steps-mobile">
              {steps.map((stepItem, index) => {
                const isCompleted = stepItem.id < currentStepIndex
                const isCurrent = stepItem.id === currentStepIndex
                const isLast = index === steps.length - 1

                return (
                  <div key={stepItem.id} className="modal-create-project-step-item-mobile">
                    <div className="modal-create-project-step-indicator-wrapper-mobile">
                      <span 
                        className={`modal-create-project-step-indicator-mobile ${
                          isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
                        }`}
                      >
                        {isCompleted ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="step-check-icon">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        ) : (
                          <span className={`step-dot ${isCurrent ? 'current-dot' : ''}`}></span>
                        )}
                      </span>
                      {!isLast && (
                        <span 
                          className={`modal-create-project-step-connector-mobile ${
                            isCompleted ? 'completed' : ''
                          }`}
                        ></span>
                      )}
                    </div>
                    <div className="modal-create-project-step-content-mobile">
                      <p className={`step-title ${isCurrent ? 'current-title' : ''}`}>
                        {stepItem.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default ModalCreateProject

