import API_URL from '../config/api.js'

// Helper para tratar erros de response
async function handleResponseError(response) {
  let errorMessage = `Erro ${response.status}: ${response.statusText}`
  
  // Tratar rate limiting (429)
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    let waitTime = 'alguns minutos'
    
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10)
      if (seconds < 60) {
        waitTime = `${seconds} segundos`
      } else {
        const minutes = Math.ceil(seconds / 60)
        waitTime = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
      }
    } else {
      // Se não tiver Retry-After, assumir 5 minutos (janela padrão do rate limit)
      waitTime = '5 minutos'
    }
    
    return `Muitas ações: aguarde ${waitTime} antes de tentar novamente`
  }
  
  try {
    // Clonar response antes de ler para evitar "body stream already read"
    const clonedResponse = response.clone()
    const errorData = await clonedResponse.json()
    errorMessage = errorData.error || errorMessage
    
    // Se for rate limiting mas não detectado pelo status, verificar na mensagem
    if (errorMessage.includes('Muitas requisições') || errorMessage.includes('rate limit')) {
      const retryAfter = response.headers.get('Retry-After')
      let waitTime = 'alguns minutos'
      
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10)
        if (seconds < 60) {
          waitTime = `${seconds} segundos`
        } else {
          const minutes = Math.ceil(seconds / 60)
          waitTime = `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
        }
      } else {
        waitTime = '5 minutos'
      }
      
      return `Muitas ações: aguarde ${waitTime} antes de tentar novamente`
    }
  } catch (e) {
    // Se não conseguir fazer parse do JSON, tentar ler como texto
    try {
      const clonedResponse = response.clone()
      const text = await clonedResponse.text()
      errorMessage = text || errorMessage
    } catch (textError) {
      // Se falhar, usar apenas status e statusText
      errorMessage = `Erro ${response.status}: ${response.statusText}`
    }
  }
  return errorMessage
}

// Criar novo projeto
export async function createProject(name, type = 'personal', linkedProjects = []) {
  try {
    const url = `${API_URL}/projects/create`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, type, linkedProjects }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    const result = await response.json()
    return { ...result, type }
  } catch (error) {
    console.error('Erro na API createProject:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
      throw new Error('Servidor não encontrado. Verifique se o backend está rodando em ' + API_URL)
    }
    throw error
  }
}

// Acessar projeto por código
export async function accessProject(code) {
  try {
    const response = await fetch(`${API_URL}/projects/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API accessProject:', error)
    throw error
  }
}

// Obter projeto por link criptografado
export async function getProject(encryptedId) {
  try {
    const response = await fetch(`${API_URL}/projects/${encryptedId}`)

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getProject:', error)
    throw error
  }
}

// Obter board completo
export async function getBoard(encryptedId) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}`)

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const clonedResponse = response.clone()
        const errorData = await clonedResponse.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          console.error('Detalhes do erro:', errorData.details)
        }
      } catch (e) {
        try {
          const clonedResponse = response.clone()
          const text = await clonedResponse.text()
          errorMessage = text || errorMessage
        } catch (textError) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getBoard:', error)
    throw error
  }
}

// Atualizar nome do projeto (e do board)
export async function updateProjectName(encryptedId, name) {
  try {
    const response = await fetch(`${API_URL}/projects/${encryptedId}/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API updateProjectName:', error)
    throw error
  }
}

// Atualizar nome do board (mantido para compatibilidade)
export async function updateBoardName(encryptedId, name) {
  return updateProjectName(encryptedId, name)
}

// Criar coluna
export async function createColumn(encryptedId, title) {
  const response = await fetch(`${API_URL}/boards/${encryptedId}/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    try {
      const clonedResponse = response.clone()
      const error = await clonedResponse.json()
      throw new Error(error.error || 'Erro ao criar coluna')
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
  }

  return response.json()
}

// Atualizar coluna
export async function updateColumn(encryptedId, columnId, data) {
  const response = await fetch(`${API_URL}/boards/${encryptedId}/columns/${columnId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    try {
      const clonedResponse = response.clone()
      const error = await clonedResponse.json()
      throw new Error(error.error || 'Erro ao atualizar coluna')
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
  }

  return response.json()
}

// Deletar coluna
export async function deleteColumn(encryptedId, columnId) {
  const response = await fetch(`${API_URL}/boards/${encryptedId}/columns/${columnId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    try {
      const clonedResponse = response.clone()
      const error = await clonedResponse.json()
      throw new Error(error.error || 'Erro ao deletar coluna')
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
  }

  return response.json()
}

// Criar card
export async function createCard(encryptedId, columnId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/columns/${columnId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const clonedResponse = response.clone()
        const errorData = await clonedResponse.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          console.error('Detalhes do erro:', errorData.details)
          console.error('Código do erro:', errorData.code)
        }
      } catch (e) {
        try {
          const clonedResponse = response.clone()
          const text = await clonedResponse.text()
          errorMessage = text || errorMessage
        } catch (textError) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API createCard:', error)
    throw error
  }
}

// Atualizar card
export async function updateCard(encryptedId, cardId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    const result = await response.json()
    // Retornar no formato esperado pelo frontend
    return {
      id: result.id || cardId,
      title: result.title,
      description: result.description,
      assignee: result.assignee,
      position: result.position,
      columnId: result.columnId || result.column_id,
      label_ids: result.label_ids || [],
      highlight_label_id: result.highlight_label_id || null,
      is_completed: result.is_completed || false
    }
  } catch (error) {
    console.error('Erro na API updateCard:', error)
    throw error
  }
}

// Reordenar cards em uma coluna
export async function reorderCards(encryptedId, columnId, cards) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/columns/${columnId}/cards/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API reorderCards:', error)
    throw error
  }
}

// Deletar card
export async function deleteCard(encryptedId, cardId) {
  const response = await fetch(`${API_URL}/boards/${encryptedId}/cards/${cardId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    try {
      const clonedResponse = response.clone()
      const error = await clonedResponse.json()
      throw new Error(error.error || 'Erro ao deletar card')
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`)
    }
  }

  return response.json()
}

// ============================================
// Funções de API para Legendas
// ============================================

// Listar todas as legendas do projeto
export async function getLabels(encryptedId) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/labels`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getLabels:', error)
    throw error
  }
}

// Criar legenda
export async function createLabel(encryptedId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API createLabel:', error)
    throw error
  }
}

// Atualizar legenda
export async function updateLabel(encryptedId, labelId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/labels/${labelId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API updateLabel:', error)
    throw error
  }
}

// Deletar legenda
export async function deleteLabel(encryptedId, labelId) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/labels/${labelId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API deleteLabel:', error)
    throw error
  }
}

// ============================================
// Funções de API para Comentários
// ============================================

// Listar comentários de um card
export async function getComments(encryptedId, cardId) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/cards/${cardId}/comments`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getComments:', error)
    throw error
  }
}

// Criar comentário
export async function createComment(encryptedId, cardId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/cards/${cardId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API createComment:', error)
    throw error
  }
}

// Atualizar comentário
export async function updateComment(encryptedId, commentId, data) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API updateComment:', error)
    throw error
  }
}

// Deletar comentário
export async function deleteComment(encryptedId, commentId) {
  try {
    const response = await fetch(`${API_URL}/boards/${encryptedId}/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API deleteComment:', error)
    throw error
  }
}

// ============================================
// Funções de API para Projetos Gerenciais
// ============================================

// Vincular projeto pessoal a um projeto gerencial
// personalEncryptedId: encrypted_id do projeto pessoal atual
// managerialCode: código de acesso do projeto gerencial (gestor)
export async function linkProjectToManager(personalEncryptedId, managerialCode) {
  try {
    const response = await fetch(`${API_URL}/projects/managerial/${managerialCode}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ personalEncryptedId }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API linkProjectToManager:', error)
    throw error
  }
}

// Vincular projeto pessoal a um projeto gerencial usando código de acesso
export async function linkPersonalProjectToManager(managerialEncryptedId, personalAccessCode) {
  try {
    const response = await fetch(`${API_URL}/projects/managerial/${managerialEncryptedId}/link-by-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ personalAccessCode }),
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API linkPersonalProjectToManager:', error)
    throw error
  }
}

// Obter projetos vinculados a um projeto gerencial
export async function getLinkedProjects(managerialEncryptedId) {
  try {
    const response = await fetch(`${API_URL}/projects/managerial/${managerialEncryptedId}/linked`)

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getLinkedProjects:', error)
    throw error
  }
}

// Obter gestores vinculados a um projeto pessoal (relação inversa)
export async function getManagersForPersonalProject(personalEncryptedId) {
  try {
    const response = await fetch(`${API_URL}/projects/personal/${personalEncryptedId}/managers`)

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API getManagersForPersonalProject:', error)
    throw error
  }
}

// Desvincular gestor de um projeto pessoal
export async function unlinkManagerFromPersonalProject(personalEncryptedId, managerialEncryptedId) {
  try {
    const response = await fetch(`${API_URL}/projects/personal/${personalEncryptedId}/managers/${managerialEncryptedId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorMessage = await handleResponseError(response)
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro na API unlinkManagerFromPersonalProject:', error)
    throw error
  }
}
