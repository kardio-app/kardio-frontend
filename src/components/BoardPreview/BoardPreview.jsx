import './BoardPreview.css'

function BoardPreview() {
  return (
    <div className="board-preview-wrapper">
      <div className="board-preview-gradient"></div>
      <div className="board-preview-mockup">
        <div className="board-preview-header">
          <div className="board-preview-dots">
            <div className="board-preview-dot board-preview-dot-red"></div>
            <div className="board-preview-dot board-preview-dot-yellow"></div>
            <div className="board-preview-dot board-preview-dot-green"></div>
          </div>
        </div>
        <div className="board-preview-content">
          <div className="board-preview-video-container">
            <iframe
              src="https://drive.google.com/file/d/13830znP_wO3jnwO3sWXl2GxL5OsAW9Sy/preview"
              width="100%"
              height="100%"
              allow="autoplay; fullscreen"
              className="board-preview-video-iframe"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardPreview

