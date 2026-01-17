import React, { useRef, useLayoutEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react'
import './Testimonials.css'

const testimonialsData = [
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 01, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 02, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 03, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 04, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 05, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 06, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 07, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 08, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 09, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 10, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 11, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 12, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 13, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 14, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 15, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 16, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 17, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  },
  {
    name: 'Fulano',
    handle: '@fulano',
    date: 'Jan 18, 2026',
    text: 'Seu comentário do post do linkedin estará aqui!'
  }
]

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [ref])

  return width
}

function TestimonialCard({ card }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-content">
        <div className="testimonial-header">
          <div className="testimonial-avatar">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="testimonial-user-info">
            <div className="testimonial-name-row">
              <p className="testimonial-name">{card.name}</p>
              <svg className="testimonial-verified" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z" fill="#2196F3" />
              </svg>
            </div>
            <span className="testimonial-handle">{card.handle}</span>
          </div>
        </div>
        <p className="testimonial-text">{card.text}</p>
      </div>
      
      <div className="testimonial-footer">
        <div className="testimonial-posted">
          <span>Posted on</span>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="testimonial-linkedin-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        <p className="testimonial-date">{card.date}</p>
      </div>
    </div>
  )
}

function TestimonialsMarquee({ cards, baseVelocity = 50, reverse = false }) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  })
  const velocityFactor = useTransform(
    smoothVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false }
  )

  const innerRef = useRef(null)
  const innerWidth = useElementWidth(innerRef)

  function wrap(min, max, v) {
    const range = max - min
    const mod = (((v - min) % range) + range) % range
    return mod + min
  }

  const x = useTransform(baseX, v => {
    if (innerWidth === 0) return '0px'
    // Como temos dados triplicados, fazemos wrap na metade para criar loop infinito
    const actualWidth = innerWidth / 2
    return `${wrap(-actualWidth, 0, v)}px`
  })

  const directionFactor = useRef(reverse ? -1 : 1)
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)

    if (velocityFactor.get() < 0) {
      directionFactor.current = reverse ? 1 : -1
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = reverse ? -1 : 1
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get()
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className="testimonials-marquee">
      <div className="testimonials-gradient-left"></div>
      <motion.div 
        ref={innerRef}
        className={`testimonials-inner ${reverse ? 'testimonials-reverse' : ''}`}
        style={{ x }}
      >
        {cards.map((card, index) => (
          <TestimonialCard key={index} card={card} />
        ))}
      </motion.div>
      <div className="testimonials-gradient-right"></div>
    </div>
  )
}

function Testimonials() {
  // Triplicar os dados para garantir que ocupe 100% da largura
  const tripledData = [...testimonialsData, ...testimonialsData, ...testimonialsData]
  
  return (
    <motion.section 
      className="home-testimonials"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="testimonials-container">
        <TestimonialsMarquee cards={tripledData} baseVelocity={50} reverse={false} />
        <TestimonialsMarquee cards={tripledData} baseVelocity={50} reverse={true} />
      </div>
    </motion.section>
  )
}

export default Testimonials
