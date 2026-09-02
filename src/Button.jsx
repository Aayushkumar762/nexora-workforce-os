function Button({ text, onClick, disabled = false }) {
  return (
    <button
      className={`premium-button ${
        text === 'Reset' ? 'reset-button' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="button-glow"></span>
      <span className="button-content">{text}</span>
    </button>
  )
}

export default Button