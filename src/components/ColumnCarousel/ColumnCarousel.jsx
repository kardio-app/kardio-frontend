import { useState, useRef, useEffect } from 'react'
import Column from '../Column/Column'
import './ColumnCarousel.css'

function ColumnCarousel({ boardId, columns, showToast, currentIndex, setCurrentIndex, onIndexChange }) {
  const [startX, setStartX] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const carouselRef = useRef(null)

  useEffect(() => {
    // Resetar para a primeira coluna quando as colunas mudarem
    if (setCurrentIndex) {
      setCurrentIndex(0)
    }
  }, [columns.length, setCurrentIndex])

  const handleTouchStart = (e) => {
    // Não iniciar swipe se tocar no handle de drag ou em elementos interativos
    if (e.target.closest('.column-drag-handle') || e.target.closest('button') || e.target.closest('input')) {
      return
    }
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || startX === null) return
    
    const currentX = e.touches[0].clientX
    const diff = startX - currentX
    
    // Só prevenir default se for um movimento horizontal significativo
    if (Math.abs(diff) > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (!isDragging || startX === null) {
      setIsDragging(false)
      return
    }

    const endX = e.changedTouches[0].clientX
    const diff = startX - endX
    const threshold = 50 // Mínimo de pixels para mudar de coluna

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < columns.length - 1) {
        // Swipe para a esquerda - próxima coluna
        const newIndex = currentIndex + 1
        if (setCurrentIndex) setCurrentIndex(newIndex)
        if (onIndexChange) onIndexChange(newIndex)
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe para a direita - coluna anterior
        const newIndex = currentIndex - 1
        if (setCurrentIndex) setCurrentIndex(newIndex)
        if (onIndexChange) onIndexChange(newIndex)
      }
    }

    setStartX(null)
    setIsDragging(false)
  }

  const handleMouseDown = (e) => {
    // Não iniciar swipe se clicar no handle de drag ou em elementos interativos
    if (e.target.closest('.column-drag-handle') || e.target.closest('button') || e.target.closest('input')) {
      return
    }
    setStartX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || startX === null) return
    
    const currentX = e.clientX
    const diff = startX - currentX
    
    // Só prevenir default se for um movimento horizontal significativo
    if (Math.abs(diff) > 10) {
      e.preventDefault()
    }
  }

  const handleMouseUp = (e) => {
    if (!isDragging || startX === null) {
      setIsDragging(false)
      return
    }

    const endX = e.clientX
    const diff = startX - endX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < columns.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }

    setStartX(null)
    setIsDragging(false)
  }

  if (columns.length === 0) {
    return null
  }

  return (
    <div className="column-carousel-container">
      <div
        ref={carouselRef}
        className="column-carousel-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setStartX(null)
          setIsDragging(false)
        }}
      >
        <div
          className="column-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {columns.map((column, index) => (
            <div key={column.id} className="column-carousel-slide">
              <Column
                boardId={boardId}
                column={column}
                showToast={showToast}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColumnCarousel

