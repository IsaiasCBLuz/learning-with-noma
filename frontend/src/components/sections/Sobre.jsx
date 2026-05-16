import { useFadeIn } from '../../hooks/useFadeIn'
import SectionLabel from '../ui/SectionLabel'

export default function Sobre() {
  const cardsRef = useFadeIn()

  const cards = [
    { title: '✦ Acolhimento', text: 'Um lugar onde errar faz parte do processo. Aqui você se sente seguro para tentar.' },
    { title: '✦ Leveza', text: 'Aprender pode ser divertido. Cada aula é uma nova aventura com propósito.' },
    { title: '✦ Autenticidade', text: 'Seu jeito de aprender é único. Respeitamos e valorizamos cada trajetória.' },
    { title: '✦ Progresso Real', text: 'Resultados concretos, na prática. Inglês que serve para a vida real.' },
  ]

  return (
    <section id="sobre" className="bg-green-dark text-cream relative overflow-hidden py-24 px-10">
      <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-10 pointer-events-none">
        <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start relative">
        <div>
          <SectionLabel className="text-gold-light">Quem somos</SectionLabel>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-cream mb-5">
            Uma escola que<br /><em className="italic text-gold-light">acredita</em> em você
          </h2>
          <p className="font-lora text-[1.1rem] italic leading-[1.8] text-[rgba(245,239,228,0.85)] mb-8">
            NOMA nasceu da crença de que todo mundo tem um caminho único para a fluência. Não existe o método certo, existe o método certo{' '}
            <em className="not-italic text-gold-light font-normal">para você.</em>
          </p>
          <p className="font-lora text-[1.05rem] mb-8 text-[rgba(245,239,228,0.85)]">
            <em className="text-gold-light not-italic font-medium">Missão</em>
            <span className="text-[rgba(245,239,228,0.4)] mx-2">·</span>
            Oferecer um ensino que valorize o ritmo individual, tornando-se acolhedor, leve e significativo.
          </p>
          <p className="font-lora text-[1.05rem] mb-8 text-[rgba(245,239,228,0.85)]">
            <em className="text-gold-light not-italic font-medium">Objetivo</em>
            <span className="text-[rgba(245,239,228,0.4)] mx-2">·</span>
            Inspirar novas formas de aprender, colocando o aluno como protagonista da sua jornada.
          </p>
          <p className="font-lora text-[1.05rem] text-[rgba(245,239,228,0.85)]">
            <em className="text-gold-light not-italic font-medium">Valores</em>
            <span className="text-[rgba(245,239,228,0.4)] mx-2">·</span>
            Acreditamos que o aprendizado não é linear, e que cada manobra é válida quando faz sentido para quem aprende.
          </p>
        </div>

        <div ref={cardsRef} className="fade-in flex flex-col gap-4">
          {cards.map(card => (
            <div key={card.title} className="bg-[rgba(245,239,228,0.07)] border border-[rgba(245,239,228,0.15)] rounded-2xl px-7 py-6">
              <h3 className="font-serif text-[1.25rem] font-semibold text-gold-light mb-2">{card.title}</h3>
              <p className="text-[0.875rem] text-[rgba(245,239,228,0.72)] leading-[1.65]">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
