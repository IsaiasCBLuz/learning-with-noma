import { useFadeIn } from '../../hooks/useFadeIn'

export default function Sobre() {
  const cardsRef = useFadeIn()

  return (
    <section className="about" id="sobre">
      <div className="about-pattern">
        <img src="/images/fundo.jpeg" alt="" />
      </div>
      <div className="about-inner">
        <div>
          <p className="section-label">Quem somos</p>
          <h2 className="section-title">
            Uma escola que<br /><em>acredita</em> em você
          </h2>
          <p className="section-sub" style={{ marginBottom: '2rem', fontFamily: "'Lora', serif", fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.8', color: 'rgba(245,239,228,0.85)' }}>
            NOMA nasceu da crença de que todo mundo tem um caminho único para a fluência. Não existe o método certo, existe o método certo{' '}
            <em style={{ color: 'var(--gold-light)', fontStyle: 'normal' }}>para você.</em>
          </p>
          <p className="section-sub" style={{ marginBottom: '2rem', fontFamily: "'Lora', serif", fontSize: '1.05rem' }}>
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic', fontWeight: 500 }}>Missão</em>
            <span style={{ color: 'rgba(245,239,228,0.4)', margin: '0 0.5rem' }}>·</span>
            Oferecer um ensino que valorize o ritmo individual, tornando-se acolhedor, leve e significativo.
          </p>
          <p className="section-sub" style={{ marginBottom: '2rem', fontFamily: "'Lora', serif", fontSize: '1.05rem' }}>
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic', fontWeight: 500 }}>Objetivo</em>
            <span style={{ color: 'rgba(245,239,228,0.4)', margin: '0 0.5rem' }}>·</span>
            Inspirar novas formas de aprender, colocando o aluno como protagonista da sua jornada.
          </p>
          <p className="section-sub" style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem' }}>
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic', fontWeight: 500 }}>Valores</em>
            <span style={{ color: 'rgba(245,239,228,0.4)', margin: '0 0.5rem' }}>·</span>
            Acreditamos que o aprendizado não é linear, e que cada manobra é válida quando faz sentido para quem aprende.
          </p>
        </div>
        <div ref={cardsRef} className="about-cards fade-in">
          <div className="about-card">
            <h3>✦ Acolhimento</h3>
            <p>Um lugar onde errar faz parte do processo. Aqui você se sente seguro para tentar.</p>
          </div>
          <div className="about-card">
            <h3>✦ Leveza</h3>
            <p>Aprender pode ser divertido. Cada aula é uma nova aventura com propósito.</p>
          </div>
          <div className="about-card">
            <h3>✦ Autenticidade</h3>
            <p>Seu jeito de aprender é único. Respeitamos e valorizamos cada trajetória.</p>
          </div>
          <div className="about-card">
            <h3>✦ Progresso Real</h3>
            <p>Resultados concretos, na prática. Inglês que serve para a vida real.</p>
          </div>
        </div>
      </div>
    </section>
  )
}


