import { useFadeIn } from '../../hooks/useFadeIn'
import SectionLabel from '../ui/SectionLabel'

const steps = [
  { title: 'Nos conhecemos', desc: 'A gente entende seu ritmo, seus objetivos e o que faz sentido pra você nesse momento.' },
  { title: 'Descobrimos seus temas', desc: 'Futebol, séries, negócios, viagens? A aula já começa com o que te move de verdade.' },
  { title: 'Você decide sem pressão', desc: 'Depois da aula, se fizer sentido pra você, a gente combina o pacote ideal.' },
]

const WA_URL = 'https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental'

export default function AulaExperimental() {
  const leftRef = useFadeIn()
  const rightRef = useFadeIn()

  return (
    <section id="experimental" className="bg-green-dark py-20 px-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-[900px] mx-auto relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div ref={leftRef} className="fade-in">
          <SectionLabel className="text-gold-light">Antes de qualquer compromisso</SectionLabel>
          <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-semibold text-cream leading-[1.15] mb-5">
            A primeira aula<br />
            <em className="italic text-gold-light">é por nossa conta.</em>
          </h2>
          <p className="text-base text-[rgba(245,239,228,0.75)] leading-[1.75] mb-8">
            A gente acredita que a conexão vem antes do contrato. Por isso, antes de qualquer pacote, fazemos uma aula experimental juntos, sem custo e sem pressão.
          </p>
          <a href={WA_URL} target="_blank" rel="noopener"
            className="inline-block bg-green text-cream no-underline py-[0.9rem] px-[2.2rem] rounded-full text-[0.95rem] font-medium transition-all hover:bg-[#3a4d2e] hover:-translate-y-0.5">
            Agendar aula experimental
          </a>
        </div>

        <div ref={rightRef} className="fade-in">
          <div className="bg-[rgba(245,239,228,0.07)] border border-[rgba(245,239,228,0.15)] rounded-[20px] p-8">
            <div className="flex flex-col gap-5">
              {steps.map(step => (
                <div key={step.title} className="flex gap-4 items-start">
                  <span className="text-[1.4rem] text-gold-light mt-0.5">✦</span>
                  <div>
                    <p className="font-semibold text-cream mb-1 text-[0.95rem]">{step.title}</p>
                    <p className="text-[0.85rem] text-[rgba(245,239,228,0.6)] leading-[1.6]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
