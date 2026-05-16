import { useFadeIn } from '../../hooks/useFadeIn'
import SectionLabel from '../ui/SectionLabel'

const lightRows = [
  { label: 'Light', sub: 'mensal' },
  { label: 'Light+', sub: 'trimestral' },
  { label: 'Light++', sub: 'semestral' },
  { label: 'Light ✦', sub: 'anual', highlight: true },
]

const fullRows = [
  { label: 'Full', sub: 'mensal' },
  { label: 'Full+', sub: 'trimestral' },
  { label: 'Full++', sub: 'semestral' },
  { label: 'Full ✦', sub: 'anual', highlight: true },
]

export default function Planos() {
  const headerRef = useFadeIn()
  const cardsRef = useFadeIn()

  return (
    <section id="pacotes" className="bg-[#f9f4ec] py-24 px-10">
      <div className="max-w-[1200px] mx-auto">
        <div ref={headerRef} className="fade-in text-center mb-12">
          <SectionLabel>Investimento</SectionLabel>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-green-dark mb-4">
            Escolha seu <em className="italic text-gold">plano</em>
          </h2>
          <div className="inline-flex items-center gap-2 bg-[rgba(74,94,58,0.12)] border border-[rgba(74,94,58,0.2)] rounded-full px-[1.1rem] py-[0.4rem] mb-4">
            <span className="text-[0.8rem] text-green-dark font-semibold">⏱ Nossas aulas têm 1h30 de duração</span>
          </div>
          <p className="text-base text-muted leading-[1.7] max-w-[560px] mx-auto">
            Você escolhe a frequência e o compromisso que cabe na sua vida. Conversamos sobre o investimento de forma personalizada.
          </p>
        </div>

        <div ref={cardsRef} className="fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Light */}
          <div className="bg-white rounded-[24px] p-10 border border-[rgba(74,94,58,0.12)]">
            <span className="inline-block bg-[rgba(74,94,58,0.1)] text-green-dark rounded-full px-4 py-[0.3rem] text-[0.75rem] font-semibold tracking-[0.1em] uppercase mb-5">
              ✈ Light
            </span>
            <h3 className="font-serif text-[1.6rem] font-semibold text-green-dark mb-2">1x por semana</h3>
            <p className="text-[0.9rem] text-muted mb-6 leading-[1.6]">
              Ideal para quem quer consistência sem pressão. Uma aula por semana para ir construindo com calma.
            </p>
            <div className="flex flex-col gap-0">
              {lightRows.map(row => (
                <div key={row.label} className={`flex justify-between items-center py-[0.6rem] ${row === lightRows[lightRows.length - 1] ? '' : 'border-b border-[rgba(74,94,58,0.08)]'}`}>
                  <span className={`text-[0.875rem] ${row.highlight ? 'text-gold' : 'text-muted'}`}>
                    {row.label} <span className="opacity-55 text-[0.78rem]">({row.sub})</span>
                  </span>
                  <span className={`text-[0.875rem] font-medium ${row.highlight ? 'text-gold' : 'text-green-dark'}`}>
                    {row.highlight ? 'melhor condição' : 'sob consulta'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full */}
          <div className="bg-green-dark rounded-[24px] p-10">
            <span className="inline-block bg-[rgba(245,239,228,0.15)] text-gold-light rounded-full px-4 py-[0.3rem] text-[0.75rem] font-semibold tracking-[0.1em] uppercase mb-5">
              ✦ Full
            </span>
            <h3 className="font-serif text-[1.6rem] font-semibold text-cream mb-2">2x por semana</h3>
            <p className="text-[0.9rem] text-[rgba(245,239,228,0.7)] mb-6 leading-[1.6]">
              Para quem quer acelerar com mais imersão. Duas aulas por semana para evoluir mais rápido.
            </p>
            <div className="flex flex-col gap-0">
              {fullRows.map(row => (
                <div key={row.label} className={`flex justify-between items-center py-[0.6rem] ${row === fullRows[fullRows.length - 1] ? '' : 'border-b border-[rgba(245,239,228,0.1)]'}`}>
                  <span className={`text-[0.875rem] ${row.highlight ? 'text-gold-light' : 'text-[rgba(245,239,228,0.6)]'}`}>
                    {row.label} <span className="opacity-55 text-[0.78rem]">({row.sub})</span>
                  </span>
                  <span className={`text-[0.875rem] font-medium ${row.highlight ? 'text-gold-light' : 'text-cream'}`}>
                    {row.highlight ? 'melhor condição' : 'sob consulta'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-[0.9rem] text-muted mb-5">
            Faça o quiz e descubra qual combinação faz mais sentido pra você. Depois é só a gente conversar.
          </p>
          <a href="#quiz" className="inline-block bg-green text-cream no-underline py-[0.9rem] px-[2.2rem] rounded-full text-[0.95rem] font-medium transition-all hover:bg-green-dark hover:-translate-y-0.5">
            Descobrir meu perfil
          </a>
        </div>
      </div>
    </section>
  )
}
