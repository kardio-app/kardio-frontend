import './Loading.css'

function Loading({ message = 'Criando novo projeto...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-boxes">
          <div className="loading-box loading-box-1"></div>
          <div className="loading-box loading-box-2"></div>
          <div className="loading-box loading-box-3"></div>
          <div className="loading-box loading-box-4"></div>
          <div className="loading-box loading-box-5"></div>
          <div className="loading-box loading-box-6"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

export default Loading

