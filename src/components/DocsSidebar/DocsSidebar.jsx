import { useState } from 'react'
import './DocsSidebar.css'

// Ícones SVG inline
const HomeIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const BookIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
)

const FileTextIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const LayersIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
)

const TagIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
)

const UsersIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const ShareIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
)

const OverviewIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

function DocsSidebar({ 
  selectedTopic, 
  setSelectedTopic, 
  showOverview, 
  setShowOverview,
  expandedItems,
  setExpandedItems,
  onItemClick,
  isMobile = false
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    {
      label: 'Overview',
      id: 'overview',
      icon: OverviewIcon,
    },
    { divider: true },
    {
      label: 'Começando',
      id: 'getting-started',
      icon: HomeIcon,
    },
    {
      label: 'Criando Projetos',
      id: 'creating-projects',
      icon: BookIcon,
      items: [
        { label: 'Projeto Pessoal', id: 'creating-projects-personal' },
        { label: 'Projeto Gerencial', id: 'creating-projects-managerial' },
        { label: 'Projetos Vinculados', id: 'creating-projects-linked' },
      ],
    },
    { divider: true },
    {
      label: 'Gerenciando Cards',
      id: 'managing-cards',
      icon: FileTextIcon,
      items: [
        { label: 'Criar Card', id: 'managing-cards-create' },
        { label: 'Editar Card', id: 'managing-cards-edit' },
        { label: 'Mover Card', id: 'managing-cards-move' },
        { label: 'Excluir Card', id: 'managing-cards-delete' },
      ],
    },
    {
      label: 'Colunas',
      id: 'columns',
      icon: LayersIcon,
      items: [
        { label: 'Criar Coluna', id: 'columns-create' },
        { label: 'Reordenar Colunas', id: 'columns-reorder' },
        { label: 'Renomear Coluna', id: 'columns-rename' },
      ],
    },
    {
      label: 'Etiquetas',
      id: 'labels',
      icon: TagIcon,
    },
    { divider: true },
    {
      label: 'Projetos Gerenciais',
      id: 'managerial-projects',
      icon: UsersIcon,
      items: [
        { label: 'Visão Geral', id: 'managerial-projects-overview' },
        { label: 'Vincular Projetos', id: 'managerial-projects-link' },
        { label: 'Gerenciar Vinculados', id: 'managerial-projects-manage' },
      ],
    },
    {
      label: 'Compartilhamento',
      id: 'sharing',
      icon: ShareIcon,
    },
  ]

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleItemClick = (item) => {
    if (item.id === 'overview') {
      setShowOverview(true)
      setSelectedTopic(null)
    } else if (item.items) {
      toggleExpanded(item.id)
      setShowOverview(false)
    } else {
      setSelectedTopic(item.id)
      setShowOverview(false)
    }
    
    if (onItemClick) {
      onItemClick()
    }
  }

  const handleSubItemClick = (subItem) => {
    setSelectedTopic(subItem.id)
    setShowOverview(false) // Garantir que o Overview seja desativado ao selecionar um tópico
    if (onItemClick) {
      onItemClick()
    }
  }

  // Filtrar itens da sidebar baseado na busca
  const filterNavItems = (items) => {
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase().trim()
    const filtered = []

    items.forEach(item => {
      if (item.divider) {
        if (filtered.length > 0) {
          filtered.push(item)
        }
        return
      }

      const itemMatches = item.label.toLowerCase().includes(query)
      const subItemsMatches = item.items?.some(subItem => 
        subItem.label.toLowerCase().includes(query)
      )

      if (itemMatches || subItemsMatches) {
        if (itemMatches) {
          filtered.push(item)
        } else {
          filtered.push({
            ...item,
            items: item.items.filter(subItem => 
              subItem.label.toLowerCase().includes(query)
            )
          })
        }
      }
    })

    return filtered
  }

  const filteredNavItems = filterNavItems(navItems)

  // Debug
  if (isMobile) {
    console.log('DocsSidebar filteredNavItems:', filteredNavItems.length, filteredNavItems)
  }

  return (
    <div className={`docs-sidebar-wrapper ${isMobile ? 'docs-sidebar-mobile' : ''}`} data-mobile={isMobile}>
      {!isMobile && <h2 className="docs-sidebar-title">Documentação</h2>}
      {isMobile && (
        <h2 className="docs-sidebar-title" style={{ 
          display: 'block', 
          padding: '0 1rem 1rem 1rem', 
          marginBottom: '1rem',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-white)'
        }}>
          Documentação
        </h2>
      )}
      <div className="docs-sidebar-search">
        <svg
          className="docs-sidebar-search-icon"
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
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className="docs-sidebar-search-input"
          placeholder="Buscar na documentação..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="docs-sidebar-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Limpar busca"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      <nav className="docs-sidebar-nav">
        {filteredNavItems.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-white)' }}>
            Nenhum item encontrado
          </div>
        ) : (
          filteredNavItems.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="docs-sidebar-divider"></div>
            }

            const Icon = item.icon
            const isExpanded = expandedItems && expandedItems[item.id]
            const isActive = (item.id === 'overview' && showOverview) || selectedTopic === item.id || (item.items && item.items.some(sub => sub.id === selectedTopic))

            return (
              <div key={item.id}>
                <button
                  className={`docs-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                  style={{ 
                    display: 'flex',
                    visibility: 'visible',
                    opacity: 1,
                    color: 'var(--text-white)'
                  }}
                >
                  {Icon && <Icon className="docs-sidebar-item-icon" />}
                  <span className="docs-sidebar-item-label">{item.label}</span>
                  {item.items && (
                    <svg
                      className={`docs-sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </button>
                {item.items && isExpanded && (
                  <div className="docs-sidebar-subitems">
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={`docs-sidebar-subitem ${selectedTopic === subItem.id ? 'active' : ''}`}
                        onClick={() => handleSubItemClick(subItem)}
                        style={{
                          display: 'block',
                          visibility: 'visible',
                          opacity: 1
                        }}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </nav>
    </div>
  )
}

export default DocsSidebar

