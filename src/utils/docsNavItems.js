// Estrutura dos itens de navegação da documentação
export const getDocTitleById = (id) => {
  const navItems = [
    { id: 'overview', title: 'Overview' },
    { id: 'getting-started', title: 'Começando' },
    { id: 'creating-projects', title: 'Criando Projetos' },
    { id: 'creating-projects-personal', title: 'Projeto Pessoal' },
    { id: 'creating-projects-managerial', title: 'Projeto Gerencial' },
    { id: 'creating-projects-linked', title: 'Projetos Vinculados' },
    { id: 'managing-cards', title: 'Gerenciando Cards' },
    { id: 'managing-cards-create', title: 'Criar Card' },
    { id: 'managing-cards-edit', title: 'Editar Card' },
    { id: 'managing-cards-move', title: 'Mover Card' },
    { id: 'managing-cards-delete', title: 'Excluir Card' },
    { id: 'columns', title: 'Colunas' },
    { id: 'columns-create', title: 'Criar Coluna' },
    { id: 'columns-reorder', title: 'Reordenar Colunas' },
    { id: 'columns-rename', title: 'Renomear Coluna' },
    { id: 'labels', title: 'Etiquetas' },
    { id: 'managerial-projects', title: 'Projetos Gerenciais' },
    { id: 'managerial-projects-overview', title: 'Visão Geral' },
    { id: 'managerial-projects-link', title: 'Vincular Projetos' },
    { id: 'managerial-projects-manage', title: 'Gerenciar Vinculados' },
    { id: 'sharing', title: 'Compartilhamento' },
  ]

  const item = navItems.find(item => item.id === id)
  return item ? item.title : 'Tópico'
}

