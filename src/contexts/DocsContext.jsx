import { createContext, useContext, useState } from 'react'

const DocsContext = createContext(undefined)

export const useDocsContext = () => {
  const context = useContext(DocsContext)
  if (context === undefined) {
    // Retornar um objeto vazio ao invés de lançar erro
    return null
  }
  return context
}

export const DocsProvider = ({ children }) => {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})
  const [showOverview, setShowOverview] = useState(false)

  return (
    <DocsContext.Provider
      value={{
        selectedTopic,
        setSelectedTopic,
        expandedItems,
        setExpandedItems,
        showOverview,
        setShowOverview,
      }}
    >
      {children}
    </DocsContext.Provider>
  )
}

