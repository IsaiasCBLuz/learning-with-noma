import { useState } from 'react'
import SectionLabel from '../ui/SectionLabel'
import api from '../../api/client'

const WA_URL = 'https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental'

const PERGUNTAS = [
  {
    t: 'Eu tenho...',
    opts: [
      ['kids', 'Entre 8 e 11 anos'],
      ['teens', 'Entre 12 e 17 anos'],
      ['adults', 'Mais de 18 anos'],
    ],
  },
  {
    t: 'Como você se relaciona com o inglês hoje?',
    opts: [
      ['beginner', 'Estou começando do zero ou quase isso'],
      ['intermediate', 'Já entendo um pouco, mas travo na hora de falar'],
      ['advanced', 'Já me comunico, mas quero soar mais natural e profissional'],
      ['bee', 'Preciso de apoio com o conteúdo que já trabalho em outra escola'],
    ],
  },
  {
    t: 'Como você aprende melhor?',
    opts: [
      ['talking', 'Falando, errando e tentando de novo, na prática mesmo'],
      ['games', 'Com desafios, jogos e aquela sensação de próximo nível'],
      ['mixed', 'Gosto de variar'],
    ],
  },
  {
    t: 'Quanto ao compromisso, o que combina mais com você agora?',
    opts: [
      ['feather', 'Quero voltar com o inglês, mas de um jeito leve'],
      ['plus', 'Estou criando uma rotina e quero consistência'],
      ['plusplus', 'Quero ver resultado de verdade'],
      ['annual', 'Dessa vez eu quero ir até o fim'],
    ],
  },
  {
    t: 'Que temas te animam mais? Escolha entre 3 e 5.',
    topics: true,
    topicList: ['Cultura Pop', 'Futebol', 'Cultura Americana', 'Música', 'Séries e Filmes', 'Viagens', 'Tecnologia', 'Negócios e Carreira', 'Gastronomia', 'Esportes', 'Moda e Estilo', 'Games'],
  },
  { t: 'Quase lá! Como a gente te encontra?', contato: true },
]

function calcResult(resps, topics) {
  const [tu, level, me, co] = [resps[0], resps[1], resps[2], resps[3]]
  const isBee = level === 'bee'
  const turma = tu === 'kids' ? 'NOMA Sprouts' : tu === 'teens' ? 'NOMA Buds' : isBee ? 'NOMA Bee' : 'NOMA Bloom'
  const emoji = tu === 'kids' ? '🌱' : tu === 'teens' ? '🚀' : isBee ? '🐝' : '✈️'
  const style = (level === 'intermediate' || level === 'beginner') ? 'Roots' : 'Flow'
  const method = me === 'games' ? 'Level' : 'Quest'
  const plan = isBee ? 'Bee' : { feather: 'Light', plus: 'Light+', plusplus: 'Light++', annual: 'Light ✦' }[co] || co
  const desc = {
    kids: 'Seu filho vai aprender sem perceber que está estudando. O NOMA Sprouts transforma o inglês em aventura desde cedo.',
    teens: 'O NOMA Buds é pra quem quer aprender de um jeito que faz sentido com a sua vida.',
    adults: 'Com o NOMA Bloom, o inglês finalmente encaixa na sua rotina real, trabalho, viagens ou onde você quiser chegar.',
    bee: 'Com o NOMA Bee, o reforço escolar deixa de ser decoreba. Conteúdo do colégio com a leveza e o contexto que fazem a diferença.',
  }
  return { turma, emoji, style, method, plan, desc: isBee ? desc.bee : (desc[tu] || ''), level, me: me || 'quest', co, tu, topics }
}

export default function Quiz() {
  const [step, setStep] = useState(0)
  const [resps, setResps] = useState({})
  const [topics, setTopics] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [lgpd, setLgpd] = useState(false)
  const [nameErr, setNameErr] = useState(false)
  const [lgpdErr, setLgpdErr] = useState(false)
  const [topicErr, setTopicErr] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const q = PERGUNTAS[step]
  const total = PERGUNTAS.length

  function toggleTopic(t) {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 5 ? [...prev, t] : prev)
    setTopicErr(false)
  }

  function selectOpt(val) {
    setResps(prev => ({ ...prev, [step]: val }))
  }

  async function next() {
    if (q.contato) {
      const parts = name.trim().split(' ').filter(Boolean)
      if (parts.length < 2) { setNameErr(true); return }
      if (!lgpd) { setLgpdErr(true); return }
      const r = calcResult(resps, topics)
      setSubmitting(true)
      try {
        await api.post('/quiz/submit', {
          name: name.trim(), email: email.trim(), phone: phone.trim(),
          turma: r.turma, level: resps[1], style: r.style, method: r.method,
          commitment: resps[3] || 'feather', topics,
        })
      } catch { /* silently fail — don't block user */ }
      setSubmitting(false)
      setResult({ ...r, firstName: name.trim().split(' ')[0] })
      return
    }
    if (q.topics) {
      if (topics.length < 3) { setTopicErr(true); return }
      setStep(s => s + 1)
      return
    }
    if (!resps[step]) return
    setStep(s => s + 1)
  }

  function back() { if (step > 0) setStep(s => s - 1) }

  function restart() {
    setStep(0); setResps({}); setTopics([]); setName(''); setEmail(''); setPhone('')
    setLgpd(false); setNameErr(false); setLgpdErr(false); setTopicErr(false); setResult(null)
  }

  if (result) {
    return (
      <section id="quiz" className="bg-green-dark text-cream relative overflow-hidden py-24 px-10">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-[720px] mx-auto relative text-center">
          <div className="bg-[rgba(245,239,228,0.09)] border-[1.5px] border-[rgba(245,239,228,0.2)] rounded-[20px] px-8 py-10">
            <div className="text-[2.5rem] mb-4">{result.emoji}</div>
            <p className="text-[0.7rem] tracking-[0.15em] text-gold-light uppercase font-semibold mb-2">
              Olá, {result.firstName}! Esse é seu perfil NOMA
            </p>
            <h2 className="font-serif text-[2.2rem] font-semibold text-cream mb-3">{result.turma}</h2>
            <p className="text-[0.95rem] text-[rgba(245,239,228,0.75)] leading-[1.7] max-w-[440px] mx-auto mb-6">{result.desc}</p>

            <div className="flex gap-2 justify-center flex-wrap mb-6">
              {[`Plano ${result.style}`, `Método ${result.method}`, result.plan].map(tag => (
                <span key={tag} className="inline-block bg-[rgba(200,136,26,0.2)] text-gold-light rounded-full px-5 py-[0.4rem] text-[0.8rem] font-medium border-[1.5px] border-[rgba(229,168,42,0.4)]">
                  ✦ {tag}
                </span>
              ))}
            </div>

            <p className="text-[0.85rem] text-[rgba(245,239,228,0.6)] leading-[1.6] mb-6">
              Essas são nossas sugestões com base no que você nos contou. A gente conversa os detalhes juntos, sem compromisso.
            </p>

            <a href={WA_URL} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 bg-green text-cream no-underline py-[0.85rem] px-8 rounded-full text-[0.95rem] font-medium transition-all hover:bg-[#3a4d2e]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z"/>
              </svg>
              Agende sua aula experimental
            </a>
          </div>
          <button onClick={restart} className="mt-6 bg-transparent border-[1.5px] border-[rgba(245,239,228,0.3)] text-[rgba(245,239,228,0.7)] px-8 py-[0.7rem] rounded-full cursor-pointer text-[0.875rem] font-sans hover:border-[rgba(245,239,228,0.6)] hover:text-cream transition-all">
            Refazer o quiz
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="bg-green-dark text-cream relative overflow-hidden py-24 px-10">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-[720px] mx-auto relative">
        <SectionLabel className="text-gold-light text-center block">Queremos te conhecer melhor</SectionLabel>
        <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold text-cream text-center leading-[1.1] mb-2">
          Vamos descobrir seu<br /><em className="italic text-gold-light">caminho ideal?</em>
        </h2>
        <p className="text-center text-base text-[rgba(245,239,228,0.65)] leading-[1.7] mb-10">Sem respostas certas ou erradas.</p>

        {/* Progress dots */}
        <div className="flex gap-[6px] mb-8">
          {PERGUNTAS.map((_, i) => (
            <div key={i} className={`h-1 rounded-sm flex-1 transition-all duration-300 ${i < step ? 'bg-gold-light' : i === step ? 'bg-[rgba(229,168,42,0.5)]' : 'bg-[rgba(245,239,228,0.2)]'}`} />
          ))}
        </div>

        <h3 className="font-serif text-[1.5rem] font-semibold text-cream mb-6 leading-[1.3] min-h-[3rem]">{q.t}</h3>

        {/* Options */}
        {!q.topics && !q.contato && (
          <div className="flex flex-col gap-3">
            {q.opts.map(([val, label]) => (
              <button key={val} onClick={() => selectOpt(val)}
                className={`text-left px-6 py-4 rounded-[14px] text-[0.93rem] cursor-pointer transition-all duration-150 font-sans border-[1.5px] w-full
                  ${resps[step] === val
                    ? 'bg-[rgba(200,136,26,0.2)] border-gold-light text-cream'
                    : 'bg-[rgba(245,239,228,0.07)] border-[rgba(245,239,228,0.2)] text-cream hover:bg-[rgba(245,239,228,0.15)] hover:border-gold-light'}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Topics */}
        {q.topics && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {q.topicList.map(t => (
                <button key={t} onClick={() => toggleTopic(t)}
                  className={`text-left px-6 py-4 rounded-[14px] text-[0.93rem] cursor-pointer transition-all duration-150 font-sans border-[1.5px] w-full
                    ${topics.includes(t)
                      ? 'bg-[rgba(200,136,26,0.2)] border-gold-light text-cream'
                      : 'bg-[rgba(245,239,228,0.07)] border-[rgba(245,239,228,0.2)] text-cream hover:bg-[rgba(245,239,228,0.15)] hover:border-gold-light'}`}>
                  {t}
                </button>
              ))}
            </div>
            {topicErr && <p className="text-[0.8rem] text-gold-light mt-3 text-center">{topics.length} selecionados (mínimo 3)</p>}
            {!topicErr && topics.length > 0 && (
              <p className="text-[0.8rem] text-[rgba(245,239,228,0.5)] mt-3 text-center">
                {topics.length === 5 ? '5 selecionados (máximo)' : `${topics.length} selecionados`}
              </p>
            )}
          </>
        )}

        {/* Contact */}
        {q.contato && (
          <div className="flex flex-col gap-[0.85rem]">
            <div>
              <input value={name} onChange={e => { setName(e.target.value); setNameErr(false) }}
                placeholder="Seu nome completo (mínimo dois nomes)"
                className="w-full bg-[rgba(245,239,228,0.08)] border-[1.5px] border-[rgba(245,239,228,0.2)] rounded-[14px] px-5 py-4 text-cream text-[0.95rem] outline-none font-sans placeholder:text-[rgba(245,239,228,0.4)]" />
              {nameErr && <p className="text-[0.75rem] text-gold-light mt-1">Informe nome e sobrenome.</p>}
            </div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Seu e-mail (opcional)"
              className="w-full bg-[rgba(245,239,228,0.08)] border-[1.5px] border-[rgba(245,239,228,0.2)] rounded-[14px] px-5 py-4 text-cream text-[0.95rem] outline-none font-sans placeholder:text-[rgba(245,239,228,0.4)]" />
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="WhatsApp (opcional)"
              className="w-full bg-[rgba(245,239,228,0.08)] border-[1.5px] border-[rgba(245,239,228,0.2)] rounded-[14px] px-5 py-4 text-cream text-[0.95rem] outline-none font-sans placeholder:text-[rgba(245,239,228,0.4)]" />
            <label className={`flex items-start gap-3 cursor-pointer pt-2 ${lgpdErr ? 'outline outline-[rgba(229,168,42,0.8)] outline-1 rounded-lg p-2' : ''}`}>
              <input type="checkbox" checked={lgpd} onChange={e => { setLgpd(e.target.checked); setLgpdErr(false) }}
                className="mt-1 w-4 h-4 accent-gold flex-shrink-0" />
              <span className="text-[0.76rem] text-[rgba(245,239,228,0.55)] leading-[1.6]">
                Concordo que a NOMA armazene meu nome, e-mail e respostas para entrar em contato e personalizar minha experiência.{' '}
                <a href="#politica-privacidade" className="text-gold">Ver política de privacidade.</a>
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-7">
          <button onClick={back} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
            className="bg-transparent border-[1.5px] border-[rgba(245,239,228,0.3)] text-[rgba(245,239,228,0.6)] px-6 py-[0.7rem] rounded-full cursor-pointer text-[0.875rem] font-sans hover:border-[rgba(245,239,228,0.7)] hover:text-cream transition-all">
            ← Voltar
          </button>
          <button onClick={next} disabled={submitting}
            className={`bg-gold text-white border-none px-8 py-3 rounded-full cursor-pointer text-[0.93rem] font-medium font-sans transition-all hover:bg-gold-light hover:-translate-y-px ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {submitting ? 'Enviando...' : step >= total - 1 ? 'Ver meu resultado ✦' : 'Próxima →'}
          </button>
        </div>
      </div>
    </section>
  )
}
