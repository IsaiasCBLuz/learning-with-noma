import { useFadeIn } from '../../hooks/useFadeIn'
import SectionLabel from '../ui/SectionLabel'

const turmas = [
  {
    cls: 'sprouts',
    badge: 'NOMA Sprouts',
    badgeCls: 'bg-[rgba(200,136,26,0.15)] text-[#7A5008]',
    cardBg: 'bg-[#FBF3E2]',
    title: 'Pequenos exploradores',
    age: 'Para crianças de 8 a 11 anos',
    text: 'Aprendizado lúdico com brincadeiras, músicas e histórias. As crianças aprendem sem perceber e adoram cada momento.',
  },
  {
    cls: 'buds',
    badge: 'NOMA Buds',
    badgeCls: 'bg-[rgba(74,94,58,0.15)] text-green-dark',
    cardBg: 'bg-[#E8F2E0]',
    title: 'Cultura, tecnologia e mundo',
    age: 'Para jovens de 12 a 17 anos',
    text: 'Inglês conectado com cultura, tecnologia e tudo que move essa geração. Para quem está descobrindo o mundo.',
  },
  {
    cls: 'bloom',
    badge: 'NOMA Bloom',
    badgeCls: 'bg-[rgba(200,120,60,0.15)] text-[#7A3A10]',
    cardBg: 'bg-[#FAEADE]',
    title: 'Trabalho, viagens e relacionamentos',
    age: 'Para adultos a partir de 18 anos',
    text: 'Inglês para quem vive intensamente: trabalho, viagens, relacionamentos. Com a seriedade que você precisa e a leveza que merece.',
  },
]

const estilos = [
  {
    id: 'flow',
    emoji: '✈',
    color: 'border-t-gold',
    badgeBg: 'bg-[rgba(200,136,26,0.1)] text-[#8B5E0A]',
    title: 'Comunicação em primeiro lugar',
    desc: 'No Flow, a conversa não espera. Cada aula tem um tema novo, vocabulário em contexto real e muita prática oral. O objetivo é você ganhar confiança para se comunicar de verdade, sem travar.',
    items: ['Temas do seu mundo', 'Vocabulário por contexto', 'Conversação desde o primeiro dia'],
  },
  {
    id: 'roots',
    emoji: '🌱',
    color: 'border-t-green',
    badgeBg: 'bg-[rgba(74,94,58,0.1)] text-green-dark',
    title: 'Estrutura que sustenta tudo',
    desc: 'No Roots, você entende o inglês por dentro. A gramática deixa de ser decoreba e vira ferramenta. Cada aula constrói uma base sólida para que você leia, escreva e fale com precisão.',
    items: ['Gramática aplicada, não decorada', 'Estrutura para ler e escrever melhor', 'Base para fluência duradoura'],
  },
]

const bee = {
  id: 'bee',
  emoji: '🐝',
  title: 'Reforço escolar com propósito',
  desc: 'O Bee é para quem precisa de apoio com o inglês do colégio, mas sem a pressão de decorar regra. A gente pega o conteúdo da escola e transforma em algo que faz sentido de verdade, com conversação, contexto e leveza.',
  items: ['Conteúdo escolar com contexto real', 'Gramática sem decoreba', 'Preparação para provas e vestibular'],
}

const metodos = [
  {
    id: 'quest',
    label: '✦ Quest',
    color: 'border-t-gold',
    badgeBg: 'bg-[rgba(200,136,26,0.1)] text-[#8B5E0A]',
    title: 'Um tema novo a cada aula',
    desc: 'No Quest, cada aula começa com um tema do seu universo. A conversa acontece desde o primeiro minuto, o vocabulário entra pelo contexto e a fluência vem pela prática constante.',
    items: ['Conversação ao vivo', 'Vocabulário por contexto', 'Temas que você escolhe'],
  },
  {
    id: 'level',
    label: '✦ Level',
    color: 'border-t-green',
    badgeBg: 'bg-[rgba(74,94,58,0.1)] text-green-dark',
    title: 'Aprenda como num jogo',
    desc: 'No Level, cada aula tem desafios, pontuações e metas. A sensação de avançar de fase mantém a motivação alta. O conteúdo tem temas mas o formato é gamificado do começo ao fim.',
    items: ['Desafios e conquistas', 'Motivação constante', 'Aprender sem parecer aula'],
  },
]

function StyleCard({ item, full = false }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} id={item.id}
      className={`fade-in bg-white rounded-[20px] p-8 border border-[rgba(74,94,58,0.12)] border-t-4 ${item.color} ${full ? 'mt-6' : ''}`}>
      <span className={`inline-block ${item.badgeBg || 'bg-[rgba(200,160,20,0.1)] text-[#7A5C00]'} rounded-full px-[0.9rem] py-[0.25rem] text-[0.7rem] font-bold tracking-[0.12em] uppercase mb-4`}>
        {item.emoji || item.label}
      </span>
      <h4 className="font-serif text-[1.4rem] font-semibold text-green-dark mb-3">{item.title}</h4>
      <p className="text-[0.875rem] text-muted leading-[1.7] mb-4">{item.desc}</p>
      <div className="flex flex-col gap-1">
        {item.items.map(i => <span key={i} className="text-[0.8rem] text-green">✦ {i}</span>)}
      </div>
    </div>
  )
}

function TurmaCard({ turma }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className={`fade-in ${turma.cardBg} rounded-[24px] p-9 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(46,59,36,0.1)]`}>
      <span className={`inline-block text-[0.68rem] tracking-[0.15em] uppercase font-semibold px-[0.85rem] py-[0.28rem] rounded-full mb-5 ${turma.badgeCls}`}>
        {turma.badge}
      </span>
      <h3 className="font-serif text-[1.9rem] font-semibold text-green-dark mb-1 leading-[1.15]">{turma.title}</h3>
      <span className="text-[0.78rem] text-muted mb-4 block">{turma.age}</span>
      <p className="text-[0.88rem] text-muted leading-[1.65]">{turma.text}</p>
    </div>
  )
}

export default function Turmas() {
  const headerRef = useFadeIn()

  return (
    <section id="turmas" className="bg-cream relative overflow-hidden py-24 px-10">
      <div className="absolute left-[-80px] bottom-[-60px] w-[360px] h-[360px] opacity-[0.07] pointer-events-none rounded-full overflow-hidden">
        <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-[1200px] mx-auto relative">
        <div ref={headerRef} className="fade-in text-center mb-14">
          <SectionLabel>Para cada momento da vida</SectionLabel>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-green-dark mb-5">
            Encontre sua <em className="italic text-gold">turma</em>
          </h2>
          <p className="text-base text-muted leading-[1.7] max-w-[560px] mx-auto">
            Cada faixa etária tem seu próprio ritmo, vocabulário e forma de aprender. Por isso, criamos experiências feitas para cada fase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {turmas.map(t => <TurmaCard key={t.badge} turma={t} />)}
        </div>

        {/* Estilos */}
        <div id="estilos" className="max-w-[900px] mx-auto mt-16">
          <div className="text-center mb-8">
            <SectionLabel>Estilos de ensino</SectionLabel>
            <h3 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-semibold text-green-dark">
              Como a gente <em className="italic text-gold">ensina</em>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {estilos.map(e => <StyleCard key={e.id} item={e} />)}
          </div>
          <StyleCard item={{ ...bee, color: 'border-t-[#C8881A]', badgeBg: 'bg-[rgba(200,160,20,0.1)] text-[#7A5C00]', label: '🐝 Bee' }} full />
        </div>

        {/* Métodos */}
        <div className="max-w-[900px] mx-auto mt-12">
          <div className="text-center mb-6">
            <SectionLabel>Métodos</SectionLabel>
            <h3 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-semibold text-green-dark">
              Como cada aula <em className="italic text-gold">acontece</em>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metodos.map(m => <StyleCard key={m.id} item={m} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
