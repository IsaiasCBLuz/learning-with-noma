import { useFadeIn } from '../../hooks/useFadeIn'

export default function AulaExperimental() {
  const leftRef = useFadeIn()
  const rightRef = useFadeIn()

  return (
    <section id="experimental" style={{ background: 'var(--green-dark)', padding: '5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}>
        <img src="/images/fundo.jpeg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="exp-grid">
        <div ref={leftRef} className="fade-in">
          <p className="section-label" style={{ color: 'var(--gold-light)' }}>Antes de qualquer compromisso</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            A primeira aula<br />
            <em style={{ color: 'var(--gold-light)' }}>é por nossa conta.</em>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(245,239,228,0.75)', lineHeight: 1.75, marginBottom: '2rem' }}>
            A gente acredita que a conexão vem antes do contrato. Por isso, antes de qualquer pacote, fazemos uma aula experimental juntos, sem custo e sem pressão.
          </p>
          <a href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental" target="_blank" rel="noopener" className="btn-primary">
            Agendar aula experimental
          </a>
        </div>
        <div ref={rightRef} className="fade-in">
          <div style={{ background: 'rgba(245,239,228,0.07)', border: '1px solid rgba(245,239,228,0.15)', borderRadius: '20px', padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', color: 'var(--gold-light)' }}>✦</span>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>Nos conhecemos</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(245,239,228,0.6)', lineHeight: 1.6 }}>A gente entende seu ritmo, seus objetivos e o que faz sentido pra você nesse momento.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', color: 'var(--gold-light)' }}>✦</span>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>Descobrimos seus temas</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(245,239,228,0.6)', lineHeight: 1.6 }}>Futebol, séries, negócios, viagens? A aula já começa com o que te move de verdade.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', color: 'var(--gold-light)' }}>✦</span>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>Você decide sem pressão</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(245,239,228,0.6)', lineHeight: 1.6 }}>Depois da aula, se fizer sentido pra você, a gente combina o pacote ideal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


