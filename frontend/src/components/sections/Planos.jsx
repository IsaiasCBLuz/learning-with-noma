import { useFadeIn } from '../../hooks/useFadeIn'

export default function Planos() {
  const headerRef = useFadeIn()
  const cardsRef = useFadeIn()

  return (
    <section className="valores" id="pacotes" style={{ background: '#f9f4ec' }}>
      <div className="valores-inner">
        <div ref={headerRef} className="valores-header fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label">Investimento</p>
          <h2 className="section-title">Escolha seu <em>plano</em></h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,94,58,0.12)', border: '1px solid rgba(74,94,58,0.2)', borderRadius: '100px', padding: '0.4rem 1.1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)', fontWeight: 600 }}>⏱ Nossas aulas têm 1h30 de duração</span>
          </div>
          <p className="section-sub" style={{ margin: '0 auto' }}>Você escolhe a frequência e o compromisso que cabe na sua vida. Conversamos sobre o investimento de forma personalizada.</p>
        </div>
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="fade-in pacotes-grid">
          {/* LIGHT */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem 2rem', border: '1px solid rgba(74,94,58,0.12)' }}>
            <div style={{ display: 'inline-block', background: 'rgba(74,94,58,0.1)', color: 'var(--green-dark)', borderRadius: '100px', padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              ✈ Light
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>1x por semana</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Ideal para quem quer consistência sem pressão. Uma aula por semana para ir construindo com calma.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(74,94,58,0.08)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Light <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(mensal)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--green-dark)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(74,94,58,0.08)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Light+ <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(trimestral)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--green-dark)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(74,94,58,0.08)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Light++ <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(semestral)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--green-dark)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gold)' }}>Light ✦ <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>(anual)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gold)' }}>melhor condição</span>
              </div>
            </div>
          </div>
          {/* FULL */}
          <div style={{ background: 'var(--green-dark)', borderRadius: '24px', padding: '2.5rem 2rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,239,228,0.15)', color: 'var(--gold-light)', borderRadius: '100px', padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              ✦ Full
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.5rem' }}>2x por semana</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(245,239,228,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Para quem quer acelerar com mais imersão. Duas aulas por semana para evoluir mais rápido.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(245,239,228,.1)' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(245,239,228,.6)' }}>Full <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(mensal)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cream)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(245,239,228,.1)' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(245,239,228,.6)' }}>Full+ <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(trimestral)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cream)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(245,239,228,.1)' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(245,239,228,.6)' }}>Full++ <span style={{ opacity: 0.55, fontSize: '0.78rem' }}>(semestral)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cream)' }}>sob consulta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--gold-light)' }}>Full ✦ <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>(anual)</span></span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gold-light)' }}>melhor condição</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }} className="fade-in">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Faça o quiz e descubra qual combinação faz mais sentido pra você. Depois é só a gente conversar.</p>
          <a href="#quiz" className="btn-primary">Descobrir meu perfil</a>
        </div>
      </div>
    </section>
  )
}
