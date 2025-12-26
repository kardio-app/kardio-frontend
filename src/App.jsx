import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import CookieBanner from './components/CookieBanner/CookieBanner'
import Home from './pages/Home'
import Board from './pages/Board'
import BoardGerencial from './pages/BoardGerencial'
import Privacidade from './pages/Privacidade'
import Termos from './pages/Termos'
import Cookies from './pages/Cookies'
import NotFound from './pages/NotFound'

function App() {
  // Inicializar tema
  useTheme()

  return (
    <Router>
      <CookieBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/board/:boardId" element={<Board />} />
        <Route path="/board-gerencial/:boardId" element={<BoardGerencial />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

