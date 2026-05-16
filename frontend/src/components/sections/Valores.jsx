import { useFadeIn } from '../../hooks/useFadeIn'
import SectionLabel from '../ui/SectionLabel'

const valores = [
  {
    icon: (
      <svg viewBox="0 0 44 44" fill="none" className="w-11 h-11 mb-5">
        <circle cx="22" cy="22" r="20" fill="rgba(74,94,58,0.1)"/>
        <path d="M22 12 L24 19H31L25.5 23.5L27.5 30.5L22 26L16.5 30.5L18.5 23.5L13 19H20Z" fill="#4A5E3A"/>
      </svg>
    ),
    title: 'Confiança',
    text: 'Criamos um ambiente onde você se sente seguro para experimentar, errar e crescer.',
  },
  {
    icon: (
      <svg viewBox="0 0 44 44" fill="none" className="w-11 h-11 mb-5">
        <circle cx="22" cy="22" r="20" fill="rgba(200,136,26,0.1)"/>
        <path d="M14 28 Q18 16 22 20 Q26 24 30 14" stroke="#C8881A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="30" cy="14" r="2.5" fill="#C8881A"/>
      </svg>
    ),
    title: 'Evolução',
    text: 'Acreditamos que toda pessoa tem potencial. Nosso papel é ajudar você a desbloqueá-lo.',
  },
  {
    icon: (
      <svg viewBox="0 0 44 44" fill="none" className="w-11 h-11 mb-5">
        <circle cx="22" cy="22" r="20" fill="rgba(74,94,58,0.1)"/>
        <path d="M16 22 Q22 14 28 22 Q22 30 16 22Z" fill="#4A5E3A" opacity="0.8"/>
      </svg>
    ),
    title: 'Curiosidade',
    text: 'A melhor forma de aprender é com vontade de descobrir. Mantemos a chama acesa.',
  },
  {
    icon: (
      <svg viewBox="0 0 44 44" fill="none" className="w-11 h-11 mb-5">
        <circle cx="22" cy="22" r="20" fill="rgba(200,136,26,0.1)"/>
        <circle cx="22" cy="18" r="5" fill="#C8881A" opacity="0.8"/>
        <path d="M12 32 Q14 26 22 26 Q30 26 32 32" stroke="#C8881A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Humanidade',
    text: 'Cada aluno é uma pessoa com uma história. Ensinamos para gente, não para números.',
  },
]

function ValorCard({ valor }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className="fade-in bg-white border border-[rgba(74,94,58,0.12)] rounded-[20px] p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(46,59,36,0.1)]">
      {valor.icon}
      <h3 className="font-serif text-[1.35rem] font-semibold text-green-dark mb-2">{valor.title}</h3>
      <p className="text-[0.875rem] text-muted leading-[1.6]">{valor.text}</p>
    </div>
  )
}

export default function Valores() {
  const headerRef = useFadeIn()

  return (
    <section id="valores" className="bg-cream py-24 px-10">
      <div className="max-w-[1200px] mx-auto">
        <div ref={headerRef} className="fade-in text-center mb-14">
          <SectionLabel>Nossa essência</SectionLabel>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-green-dark mb-5">
            O que nos<br /><em className="italic text-gold">move todo dia</em>
          </h2>
          <p className="text-base text-muted leading-[1.7] max-w-[560px] mx-auto">
            Cada escolha que fazemos, do material ao método, é guiada por esses princípios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valores.map(v => <ValorCard key={v.title} valor={v} />)}
        </div>
      </div>
    </section>
  )
}
