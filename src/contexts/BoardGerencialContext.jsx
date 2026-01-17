import { createContext, useContext, useState } from 'react'

const BoardGerencialContext = createContext(undefined)

export const useBoardGerencialContext = () => {
  const context = useContext(BoardGerencialContext)
  if (context === undefined) {
    return null
  }
  return context
}

export const BoardGerencialProvider = ({ children, boardId, projectName, onNameUpdate, showToast }) => {
  const [projectNameState, setProjectNameState] = useState(projectName || 'Projeto Gerencial')
  const [isEditingName, setIsEditingName] = useState(false)

  const handleNameUpdate = (newName) => {
    setProjectNameState(newName)
    if (onNameUpdate) {
      onNameUpdate(newName)
    }
  }

  return (
    <BoardGerencialContext.Provider
      value={{
        boardId,
        projectName: projectNameState,
        setProjectName: handleNameUpdate,
        isEditingName,
        setIsEditingName,
        showToast,
      }}
    >
      {children}
    </BoardGerencialContext.Provider>
  )
}
