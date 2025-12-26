const STORAGE_KEY = 'kardio-saved-managers'

// Estrutura de um gestor salvo:
// {
//   id: string (UUID gerado localmente),
//   name: string (nome do projeto gerencial),
//   code: string (código de acesso do projeto gerencial),
//   encryptedLink: string (encrypted_id do projeto gerencial),
//   createdAt: number (timestamp)
// }

export function getSavedManagers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    
    const managers = JSON.parse(saved)
    // Ordenar por data de criação (mais recentes primeiro)
    return managers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  } catch (error) {
    console.error('Erro ao carregar gestores salvos:', error)
    return []
  }
}

export function saveManager(manager) {
  try {
    const managers = getSavedManagers()
    
    // Verificar se já existe (por código ou encryptedLink)
    const exists = managers.some(
      m => m.code === manager.code || m.encryptedLink === manager.encryptedLink
    )
    
    if (exists) {
      // Atualizar existente
      const updated = managers.map(m => 
        (m.code === manager.code || m.encryptedLink === manager.encryptedLink)
          ? { ...m, ...manager, createdAt: m.createdAt || Date.now() }
          : m
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return true
    }
    
    // Adicionar novo
    const newManager = {
      id: crypto.randomUUID(),
      name: manager.name || 'Gestor sem nome',
      code: manager.code,
      encryptedLink: manager.encryptedLink,
      createdAt: Date.now()
    }
    
    managers.unshift(newManager)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(managers))
    return true
  } catch (error) {
    console.error('Erro ao salvar gestor:', error)
    return false
  }
}

export function deleteSavedManager(managerId) {
  try {
    const managers = getSavedManagers()
    const filtered = managers.filter(m => m.id !== managerId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Erro ao deletar gestor:', error)
    return false
  }
}

export function updateSavedManagerName(managerId, newName) {
  try {
    const managers = getSavedManagers()
    const updated = managers.map(m =>
      m.id === managerId ? { ...m, name: newName.trim() } : m
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Erro ao atualizar nome do gestor:', error)
    return false
  }
}

