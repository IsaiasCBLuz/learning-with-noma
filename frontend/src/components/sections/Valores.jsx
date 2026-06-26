import { useFadeIn } from '../../hooks/useFadeIn'

function Card({ title, text, icon, refHook }) {
  return (
    <div ref={refHook} className="valor-card fade-in">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export default function Valores() {
  const headerRef = useFadeIn()
  const ref1 = useFadeIn()
  const ref2 = useFadeIn()
  const ref3 = useFadeIn()
  const ref4 = useFadeIn()

  return (
    <section className="valores" id="valores">
      <div className="valores-inner">
        <div ref={headerRef} className="valores-header fade-in">
          <p className="section-label">Nossa essência</p>
          <h2 className="section-title">
            O que nos<br /><em>move todo dia</em>
          </h2>
          <p className="section-sub">Cada escolha que fazemos, do material ao método, é guiada por esses princípios.</p>
        </div>
        <div className="valores-grid">
          <Card
            refHook={ref1}
            title="Confiança"
            text="Criamos um ambiente onde você se sente seguro para experimentar, errar e crescer."
            icon={
              <svg className="valor-icon" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="rgba(74,94,58,0.1)" />
                <path d="M22 12 L24 19H31L25.5 23.5L27.5 30.5L22 26L16.5 30.5L18.5 23.5L13 19H20Z" fill="#4A5E3A" />
              </svg>
            }
          />
          <Card
            refHook={ref2}
            title="Evolução"
            text="Acreditamos que toda pessoa tem potencial. Nosso papel é ajudar você a desbloqueá-lo."
            icon={
              <svg className="valor-icon" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="rgba(200,136,26,0.1)" />
                <path d="M14 28 Q18 16 22 20 Q26 24 30 14" stroke="#C8881A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="30" cy="14" r="2.5" fill="#C8881A" />
              </svg>
            }
          />
          <Card
            refHook={ref3}
            title="Curiosidade"
            text="A melhor forma de aprender é com vontade de descobrir. Mantemos a chama acesa."
            icon={
              <svg className="valor-icon" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="rgba(74,94,58,0.1)" />
                <path d="M16 22 Q22 14 28 22 Q22 30 16 22Z" fill="#4A5E3A" opacity="0.8" />
              </svg>
            }
          />
          <Card
            refHook={ref4}
            title="Humanidade"
            text="Cada aluno é uma pessoa com uma história. Ensinamos para gente, não para números."
            icon={
              <svg className="valor-icon" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="rgba(200,136,26,0.1)" />
                <circle cx="22" cy="18" r="5" fill="#C8881A" opacity="0.8" />
                <path d="M12 32 Q14 26 22 26 Q30 26 32 32" stroke="#C8881A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  )
}

