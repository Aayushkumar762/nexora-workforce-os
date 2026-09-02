function Card({ title, children }) {
  return (
    <section className="premium-card">

      <div className="card-shine"></div>

      <div className="card-top-line"></div>

      {title && (
        <div className="card-header">
          <h2>{title}</h2>
          <span className="card-indicator"></span>
        </div>
      )}

      <div className="card-content">
        {children}
      </div>

    </section>
  )
}

export default Card