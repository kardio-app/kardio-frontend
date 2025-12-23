const STORAGE_KEY = 'kardio-saved-projects';

export function getSavedProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Erro ao ler projetos salvos:', error);
    return [];
  }
}

export function saveProject(projectData) {
  try {
    const projects = getSavedProjects();
    
    // Verificar se já existe um projeto com o mesmo código
    const existingIndex = projects.findIndex(
      p => p.code === projectData.code || p.encryptedLink === projectData.encryptedLink
    );
    
    const projectToSave = {
      id: existingIndex >= 0 ? projects[existingIndex].id : Date.now().toString(),
      name: projectData.name || 'Projeto sem nome',
      code: projectData.code,
      encryptedLink: projectData.encryptedLink,
      savedAt: existingIndex >= 0 ? projects[existingIndex].savedAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      projects[existingIndex] = projectToSave;
    } else {
      projects.push(projectToSave);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projectToSave;
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    throw error;
  }
}

export function deleteSavedProject(projectId) {
  try {
    const projects = getSavedProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return false;
  }
}

export function updateSavedProjectName(projectId, newName) {
  try {
    const projects = getSavedProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index >= 0) {
      projects[index].name = newName;
      projects[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao atualizar nome do projeto:', error);
    return false;
  }
}

