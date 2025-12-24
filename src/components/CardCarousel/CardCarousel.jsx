import { useState, useRef, useEffect } from 'react'
import Card from '../Card/Card'
import './CardCarousel.css'

function CardCarousel({ boardId, columnId, cards, showToast }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startX, setStartX] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const carouselRef = useRef(null)

  useEffect(() => {
    // Resetar para o primeiro card quando os cards mudarem
    setCurrentIndex(0)
  }, [cards.length])

  const handleTouchStart = (e) => {
    // Não iniciar swipe se tocar no handle de drag ou em elementos interativos
    if (e.target.closest('.card-drag-handle') || e.target.closest('button') || e.target.closest('input')) {
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
    const threshold = 50 // Mínimo de pixels para mudar de card

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < cards.length - 1) {
        // Swipe para a esquerda - próximo card
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe para a direita - card anterior
        setCurrentIndex(currentIndex - 1)
      }
    }

    setStartX(null)
    setIsDragging(false)
  }

  const handleMouseDown = (e) => {
    // Não iniciar swipe se clicar no handle de drag ou em elementos interativos
    if (e.target.closest('.card-drag-handle') || e.target.closest('button') || e.target.closest('input')) {
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
      if (diff > 0 && currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }

    setStartX(null)
    setIsDragging(false)
  }

  if (cards.length === 0) {
    return null
  }

  return (
    <div className="card-carousel-container">
      <div
        ref={carouselRef}
        className="card-carousel-wrapper"
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
          className="card-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {cards.map((card, index) => (
            <div key={card.id} className="card-carousel-slide">
              <Card
                boardId={boardId}
                columnId={columnId}
                card={card}
                showToast={showToast}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CardCarousel

