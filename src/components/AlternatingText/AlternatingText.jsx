import { useState, useEffect, useRef } from 'react'
import './AlternatingText.css'

const apps = ['Jira', 'Trello', 'Asana', 'Notion', 'Monday', 'ClickUp', 'Linear']

function AlternatingText() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState(apps[0])
  const [isTyping, setIsTyping] = useState(false)
  const timeoutRef = useRef(null)
  const typingIntervalRef = useRef(null)

  useEffect(() => {
    // Limpar timeouts anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)

    const currentApp = apps[currentIndex]
    setDisplayText('')
    setIsTyping(true)

    // Efeito de digitação
    let charIndex = 0
    typingIntervalRef.current = setInterval(() => {
      if (charIndex < currentApp.length) {
        setDisplayText(currentApp.substring(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingIntervalRef.current)
        setIsTyping(false)
        
        // Aguardar 2 segundos antes de mudar para o próximo
        timeoutRef.current = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % apps.length)
        }, 2000)
      }
    }, 100)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    }
  }, [currentIndex])

  return (
    <div className="alternating-text-container">
      <p className="alternating-text-prefix">Uma alternativa minimalista e completa a</p>
      <div className="alternating-text-app">
        {displayText.split('').map((char, index) => (
          <span 
            key={`${currentIndex}-${index}`}
            className="alternating-text-char"
            style={{
              opacity: 1,
              filter: 'blur(0px)'
            }}
          >
            {char}
          </span>
        ))}
        {isTyping && <span className="alternating-text-cursor">|</span>}
      </div>
    </div>
  )
}

export default AlternatingText
