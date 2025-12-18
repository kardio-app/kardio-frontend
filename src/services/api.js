import API_URL from '../config/api.js'

// Criar novo projeto
export async function createProject(name) {
  try {
    const url = `${API_URL}/projects/create`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // Se não conseguir fazer parse do JSON, usar o texto da resposta
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    return await response.json()
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
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
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
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
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
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          console.error('Detalhes do erro:', errorData.details)
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
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
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
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
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar coluna')
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
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar coluna')
  }

  return response.json()
}

// Deletar coluna
export async function deleteColumn(encryptedId, columnId) {
  const response = await fetch(`${API_URL}/boards/${encryptedId}/columns/${columnId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar coluna')
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
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
        if (errorData.details) {
          console.error('Detalhes do erro:', errorData.details)
          console.error('Código do erro:', errorData.code)
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
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
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
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
      columnId: result.columnId || result.column_id
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
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
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
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar card')
  }

  return response.json()
}

