export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-pattern">
        <img src="/images/fundo.jpeg" alt="" />
      </div>
      <div className="hero-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <img src="/images/logo.png" alt="NOMA Own your path" className="hero-logo" />
        </div>
        <p className="hero-tagline">Escola virtual de inglês</p>
        <p className="hero-by">By Teacher Juli</p>
        <h1 className="hero-title">
          Own your<em>path.</em>
        </h1>
        <p className="hero-sub">Aprender inglês não é sobre memorizar regras. É sobre encontrar sua voz e levar ela para o mundo.</p>
        <div className="hero-buttons">
          <a href="#quiz" className="btn-primary">Descubra seu plano ideal</a>
          <a href="#turmas" className="btn-secondary">Conhecer as turmas</a>
        </div>
      </div>
    </section>
  )
}

