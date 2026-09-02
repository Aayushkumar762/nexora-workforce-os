function Header({ title, icon }) {
  return (
    <header className="premium-header">
      <div className="header-icon">
        <span>{icon}</span>
      </div>

      <div className="header-content">
        <div className="header-badge">
          <span className="status-dot"></span>
          PREMIUM EXPERIENCE
        </div>

        <h1>{title}</h1>

        <p>
          Modern React experience with a beautiful premium interface.
        </p>
      </div>

      <div className="header-line"></div>
    </header>
  )
}

export default Header