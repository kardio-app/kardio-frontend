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

// 11 depoimentos únicos, repetidos de forma igual até 18 (como antes: 6×3). O carrossel triplica para o loop.
const _base = [
  { avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEZ30wL4XsIaQ/profile-displayphoto-crop_800_800/B4DZu82PTKHYAI-/0/1768399898481?e=1770249600&v=beta&t=POXMJecZ2V9IRopBmRblo_Rlb6O9zI2Q9-ptTPGM3B4', name: 'Fernando Henrique', handle: '@fernandohenrique-dev', text: 'Muito bom, parabéns.', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7407684806362312704?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7407684806362312704%2C7408125002840956929%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287408125002840956929%2Curn%3Ali%3AugcPost%3A7407684806362312704%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQFY2pQtXF20xg/profile-displayphoto-crop_800_800/B4DZqE5bJKH4AI-/0/1763166237743?e=1770249600&v=beta&t=YDqchE_B0gs_buLtdvJNwzMeOzpf2Lw0f7e7RzxX46Q', name: 'Vinicius Kirsten Mendonça', handle: '@vinicius-kirsten-mendonça', text: 'Ficou muito bom, parabéns!', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7407684806362312704?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7407684806362312704%2C7408796842479558656%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287408796842479558656%2Curn%3Ali%3AugcPost%3A7407684806362312704%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQEKq2SKcAoB1A/profile-displayphoto-crop_800_800/B4EZm9GIu7HgAI-/0/1759814126979?e=1770249600&v=beta&t=dPqz9f38vVRJN1yEG2QUErg3iV2Gfp_WZx4wL64VpXE', name: 'Conrado Moraes', handle: '@conrado-moraes', text: 'Amei o projeto, principalmente sem login é top.', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7407684806362312704?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7407684806362312704%2C7408241858503630848%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287408241858503630848%2Curn%3Ali%3AugcPost%3A7407684806362312704%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQFuUiy4OgGw6A/profile-displayphoto-crop_800_800/B4DZooJdzfIEAI-/0/1761610161935?e=1770249600&v=beta&t=sBUAUE48nQqKOgCBhKIyXL4qv5Yz29k8T-T9Aelmq3I', name: 'Augusto Lemos Borges', handle: '@augusto-lemos-borges', text: 'Parabéns, Pedro!! 👏 👏', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7407684806362312704?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7407684806362312704%2C7407963235510902784%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287407963235510902784%2Curn%3Ali%3AugcPost%3A7407684806362312704%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D5603AQHI18uriZJ2aA/profile-displayphoto-crop_800_800/B56Zn._3x9I0AI-/0/1760919785075?e=1770249600&v=beta&t=E7I1WmB5QJMEodOXPD-B7r9yjmpdi0i0cLmh_ACkGvY', name: 'Cauã Rêgo', handle: '@caua-dev', text: 'Parabéns pelo projeto! A proposta de remover a fricção de login/cadastro é excelente para produtividade rápida, e a escolha de Zustand + dnd-kit deixa tudo muito fluido. Com sua permissão, adoraria fazer um fork do repositório para implementar um Dark Mode e utilizar no meu setup do dia a dia. Sucesso com o Kardio!', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7407684806362312704?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7407684806362312704%2C7408681852477140994%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287408681852477140994%2Curn%3Ali%3AugcPost%3A7407684806362312704%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQGZrIgB7Q36Ow/profile-displayphoto-crop_800_800/B4EZlOtr7LIIAI-/0/1757962229580?e=1770249600&v=beta&t=Ot2fXomzo2UMF4ZeerfaT06XbLeoNhROqAJJb3XK-co', name: 'Rafael Raizer', handle: '@raizer-rafael', text: 'Parabéns pirolito, ficou show!', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7409352166311620608?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7409352166311620608%2C7409372790493052928%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287409372790493052928%2Curn%3Ali%3AugcPost%3A7409352166311620608%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEaJO3i6Jjddg/profile-displayphoto-crop_800_800/B4DZuz6JuBGcAQ-/0/1768249925821?e=1770249600&v=beta&t=MqwwVRTwI5CYskfo2pgMRQawekWyHGgOaHJLsgPkWRA', name: 'Emmerson Oliveira SWE', handle: '@emmerson-oliveira-swe', text: 'Pedro ficou muito bom mesmo e bem melhor visualmente do que a versão anterior que havia testado, como é algo visualmente simples e prático acaba interferindo diretamenta na experiência do usuário, existe um pequeno delay entre 1 a 2s que normalmente é quando fazemos a request para api e mostrariamos um loading, mas ao invés de te recomenda a colar um loading recomendo dar uma olhada no Tanstack Query, você consegue manipular o state adicionando a tarefa diretamente no frontend e mandar a requisição de forma paralela e trazer mais reatividade e a sensação de está sendo em tempo real, dai você poderia fazer uma tratativa de desfazer/remover o item do array somente se der falha na request.', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7409352166311620608?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7409352166311620608%2C7409404042952593408%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287409404042952593408%2Curn%3Ali%3AugcPost%3A7409352166311620608%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQEtDfPCkLSV_Q/profile-displayphoto-crop_800_800/B4EZtNYFByIoAM-/0/1766529717063?e=1770249600&v=beta&t=JxguHS0aO1x_hv8ViG938Pvrti4GXT5EbS8aBLobMug', name: 'Michael Duarte', handle: '@michaeldu4rte', text: 'Curti muito a proposta de fugir do combo cadastro + anúncios + dor de cabeça. Dá pra sentir que o Kardio foi pensado pra resolver um problema real, não pra inflar métrica. Evolução bem consistente, especialmente o /board e os temas. Vou testar com mais calma.', date: 'Dez, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7409352166311620608?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7409352166311620608%2C7409430194794426368%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287409430194794426368%2Curn%3Ali%3AugcPost%3A7409352166311620608%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D5603AQGMN4I18FJJSA/profile-displayphoto-crop_800_800/B56Zp6.2KqIcAI-/0/1762999890198?e=1770249600&v=beta&t=nHQPcESryZKQ8jBA7CIqhORDMmaZCaSA7kSWUVC_AuE', name: 'Júlia Reis', handle: '@jjuliafreis', text: 'A cada dia que passa, esse projeto fica mais completo. Orgulho de acompanhar essa evolução! 💙🚀', date: 'Nov, 2025', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7411545097609052160?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7411545097609052160%2C7411546956268826625%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287411546956268826625%2Curn%3Ali%3AugcPost%3A7411545097609052160%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQGee-uL03pTGA/profile-displayphoto-crop_800_800/B4DZnUJeJIGwAI-/0/1760200877150?e=1770249600&v=beta&t=UWNfgFuzw3sw7Jfr3lyroIhsGWh5GZ9uSYxPmPPY0PE', name: 'Kayke Flausino de Oliveira', handle: '@kayke-flausino-de-oliveira', text: 'Que projeto legal! Estou fazendo um similar pra uso próprio e também para estudo ver outro projeto me deixa inspirado a continuar, vou acompanhar esse projeto achei muito interessante! Continue com o bom trabalho.', date: 'Jan, 2026', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7411545097609052160?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7411545097609052160%2C7411549471425253376%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287411549471425253376%2Curn%3Ali%3AugcPost%3A7411545097609052160%29' },
  { avatar: 'https://media.licdn.com/dms/image/v2/D5603AQGMN4I18FJJSA/profile-displayphoto-crop_800_800/B56Zp6.2KqIcAI-/0/1762999890198?e=1770249600&v=beta&t=nHQPcESryZKQ8jBA7CIqhORDMmaZCaSA7kSWUVC_AuE', name: 'Júlia Reis', handle: '@jjuliafreis', text: 'A cada post vejo a evolução desse projeto, incrível. Parabéns!', date: 'Jan, 2026', link: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7416729935798685696?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7416729935798685696%2C7416843562899845121%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287416843562899845121%2Curn%3Ali%3AugcPost%3A7416729935798685696%29' }
]
// Repete os 7 primeiros para chegar a 18 itens (mesma lógica que antes: 6×3 no carrossel)
const testimonialsData = [..._base, ..._base.slice(0, 7)]

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
  const hasLink = card.link && card.link.trim() !== ''

  const handleCardClick = () => {
    if (hasLink) window.open(card.link, '_blank', 'noopener,noreferrer')
  }

  const cardContent = (
    <>
      <div className="testimonial-content">
        <div className="testimonial-header">
          <div className="testimonial-avatar">
            {card.avatar && card.avatar.trim() ? (
              <img src={card.avatar} alt="" className="testimonial-avatar-img" />
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
          <div className="testimonial-user-info">
            <div className="testimonial-name-row">
              <p className="testimonial-name">{card.name || 'Nome'}</p>
              <svg className="testimonial-verified" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z" fill="#2196F3" />
              </svg>
            </div>
            <span className="testimonial-handle">{card.handle || ''}</span>
          </div>
        </div>
        <p className="testimonial-text">{card.text || ''}</p>
      </div>

      <div className="testimonial-footer">
        <div className="testimonial-posted">
          <span>Posted on</span>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="testimonial-linkedin-link" onClick={(e) => e.stopPropagation()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        <p className="testimonial-date">{card.date || ''}</p>
      </div>
    </>
  )

  return (
    <div
      className={`testimonial-card ${hasLink ? 'testimonial-card-clickable' : ''}`}
      onClick={hasLink ? handleCardClick : undefined}
      onKeyDown={hasLink ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() } } : undefined}
      role={hasLink ? 'button' : undefined}
      tabIndex={hasLink ? 0 : undefined}
    >
      {cardContent}
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
  // 6 cópias para demorar mais a dar a volta (era 3)
const tripledData = [...testimonialsData, ...testimonialsData, ...testimonialsData, ...testimonialsData, ...testimonialsData, ...testimonialsData]
  
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
