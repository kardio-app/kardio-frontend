import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading/Loading'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    document.title = 'Página não encontrada - kardio'
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/home')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="not-found-page">
      <Loading message={`Essa tela não existe ou você não tem permissão para acessar. Você será redirecionado em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`} />
    </div>
  )
}

export default NotFound

