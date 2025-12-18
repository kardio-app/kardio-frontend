const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Log apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔗 API URL configurada:', API_URL)
}

export default API_URL

