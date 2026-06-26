import { useState } from 'react'
import api from '../../api/client'

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
    o: ['Cultura Pop', 'Futebol', 'Cultura Americana', 'Música', 'Séries e Filmes', 'Viagens', 'Tecnologia', 'Negócios e Carreira', 'Gastronomia', 'Esportes', 'Moda e Estilo', 'Games'],
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
    if (topics.includes(t)) {
      setTopics(prev => prev.filter(x => x !== t))
    } else if (topics.length < 5) {
      setTopics(prev => [...prev, t])
    }
    setTopicErr(false)
  }

  function selectOpt(val) {
    setResps(prev => ({ ...prev, [step]: val }))
  }

  async function handleNext() {
    if (q.contato) {
      const parts = name.trim().split(' ').filter(Boolean)
      if (parts.length < 2) {
        setNameErr(true)
        return
      }
      setNameErr(false)
      if (!lgpd) {
        setLgpdErr(true)
        return
      }
      setLgpdErr(false)

      const r = calcResult(resps, topics)
      setSubmitting(true)
      try {
        await api.post('/quiz/submit', {
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          turma: r.turma,
          level: resps[1],
          style: r.style,
          method: r.method,
          commitment: resps[3] || 'feather',
          topics,
        })
      } catch (err) {
        // fail silently to keep user flow
      } finally {
        setSubmitting(false)
      }
      setResult({ ...r, firstName: name.trim().split(' ')[0] })
      return
    }

    if (q.topics) {
      if (topics.length < 3) {
        setTopicErr(true)
        return
      }
      setStep(s => s + 1)
      return
    }

    if (!resps[step]) {
      return // Don't advance if no option selected
    }
    setStep(s => s + 1)
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  function handleRestart() {
    setStep(0)
    setResps({})
    setTopics([])
    setName('')
    setEmail('')
    setPhone('')
    setLgpd(false)
    setNameErr(false)
    setLgpdErr(false)
    setTopicErr(false)
    setResult(null)
  }

  return (
    <section className="quiz-section" id="quiz">
      <div className="quiz-section-pattern">
        <img src="/images/fundo.jpeg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="quiz-inner">
        <p className="section-label">Queremos te conhecer melhor</p>
        <h2 className="section-title" style={{ color: 'var(--cream)' }}>
          Vamos descobrir seu<br />
          <em>caminho ideal?</em>
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(245,239,228,0.65)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
          Sem respostas certas ou erradas.
        </p>

        {!result ? (
          <div id="quiz-container">
            {/* Progress dots */}
            <div className="quiz-progress" id="quiz-progress">
              {PERGUNTAS.map((_, i) => (
                <div
                  key={i}
                  className={`quiz-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}
                />
              ))}
            </div>

            <h3 id="quiz-titulo" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '1.5rem', lineHeight: 1.3, minHeight: '3rem' }}>
              {q.t}
            </h3>

            {/* Options */}
            {!q.topics && !q.contato && (
              <div id="quiz-opcoes" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '50px' }}>
                {q.opts.map(([val, label]) => (
                  <button
                    key={val}
                    className={`quiz-opt ${resps[step] === val ? 'selected' : ''}`}
                    onClick={() => selectOpt(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Topics */}
            {q.topics && (
              <div id="quiz-opcoes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', minHeight: '50px' }}>
                {q.o.map(t => (
                  <button
                    key={t}
                    className={`quiz-opt ${topics.includes(t) ? 'selected' : ''}`}
                    onClick={() => toggleTopic(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <p id="topics-hint" style={{ fontSize: '0.8rem', color: topicErr ? '#E5A82A' : 'rgba(245,239,228,0.5)', margin: '0.75rem 0 0', textAlign: 'center', minHeight: '1.2em' }}>
              {q.topics && (
                topics.length === 0
                  ? ''
                  : topics.length < 3
                    ? `${topics.length} selecionados (mínimo 3)`
                    : topics.length === 5
                      ? '5 selecionados (máximo)'
                      : `${topics.length} selecionados`
              )}
            </p>

            {/* Contact */}
            {q.contato && (
              <div id="quiz-contato" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <input
                  id="quiz-name"
                  type="text"
                  placeholder="Seu nome completo (mínimo dois nomes)"
                  autoComplete="name"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameErr(false) }}
                  style={{
                    background: 'rgba(245,239,228,0.08)',
                    border: '1.5px solid rgba(245,239,228,0.2)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    color: 'var(--cream)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                {nameErr && (
                  <p id="name-hint" style={{ fontSize: '0.75rem', color: 'rgba(229,168,42,0.8)', marginTop: '-0.5rem', display: 'block' }}>
                    Informe nome e sobrenome.
                  </p>
                )}
                <input
                  id="quiz-email"
                  type="email"
                  placeholder="Seu e-mail (opcional)"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    background: 'rgba(245,239,228,0.08)',
                    border: '1.5px solid rgba(245,239,228,0.2)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    color: 'var(--cream)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <input
                  id="quiz-phone"
                  type="tel"
                  placeholder="WhatsApp (opcional)"
                  autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    background: 'rgba(245,239,228,0.08)',
                    border: '1.5px solid rgba(245,239,228,0.2)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    color: 'var(--cream)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <label
                  id="quiz-lgpd-label"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    outline: lgpdErr ? '2px solid rgba(229,168,42,0.8)' : 'none',
                    borderRadius: lgpdErr ? '8px' : 'none',
                  }}
                >
                  <input
                    id="quiz-lgpd"
                    type="checkbox"
                    checked={lgpd}
                    onChange={e => { setLgpd(e.target.checked); setLgpdErr(false) }}
                    style={{ marginTop: '3px', accentColor: '#C8881A', width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.76rem', color: lgpdErr ? 'rgba(229,168,42,0.9)' : 'rgba(245,239,228,0.55)', lineHeight: 1.6 }}>
                    Concordo que a NOMA armazene meu nome, e-mail e respostas para entrar em contato e personalizar minha experiência.{' '}
                    <a href="#politica-privacidade" style={{ color: '#C8881A' }}>
                      Ver política de privacidade.
                    </a>
                  </span>
                </label>
              </div>
            )}

            <div className="quiz-nav">
              <button
                className="quiz-btn-back"
                id="quiz-back"
                onClick={handleBack}
                style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
              >
                ← Voltar
              </button>
              <button className="quiz-btn-next" id="quiz-next" onClick={handleNext} disabled={submitting}>
                {submitting ? '...' : step >= total - 1 ? 'Ver meu resultado ✦' : 'Próxima →'}
              </button>
            </div>
          </div>
        ) : (
          <div id="quiz-result" style={{ display: 'block', textAlign: 'center' }}>
            <div className="result-card" id="result-content">
              <div className="result-emoji">
                {result.emoji}
              </div>
              <div className="result-label">
                Olá, {result.firstName}! Esse é seu perfil NOMA
              </div>
              <div className="result-title">
                {result.turma}
              </div>
              <p className="result-desc">
                {result.desc}
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href={`#${result.style.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                  <span className="result-plan" style={{ cursor: 'pointer', border: '1.5px solid rgba(229,168,42,0.4)' }}>
                    ✦ Plano {result.style} ↗
                  </span>
                </a>
                <a href={`#${result.method.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                  <span className="result-plan" style={{ cursor: 'pointer', border: '1.5px solid rgba(229,168,42,0.4)' }}>
                    ✦ Método {result.method} ↗
                  </span>
                </a>
                <a href={`#${result.plan.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ textDecoration: 'none' }}>
                  <span className="result-plan" style={{ cursor: 'pointer', border: '1.5px solid rgba(229,168,42,0.4)' }}>
                    ✦ {result.plan} ↗
                  </span>
                </a>
              </div>
              <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(245,239,228,0.6)', lineHeight: 1.6 }}>
                Essas são nossas sugestões com base no que você nos contou. A gente conversa os detalhes juntos, sem compromisso.
              </p>
              <a
                href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental"
                target="_blank"
                rel="noopener"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', background: 'var(--green)', color: 'var(--cream)', textDecoration: 'none', padding: '0.85rem 2rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 500 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
                </svg>
                Agende sua aula experimental
              </a>
            </div>
            <button
              onClick={handleRestart}
              style={{ marginTop: '1.5rem', background: 'transparent', border: '1.5px solid rgba(245,239,228,0.3)', color: 'rgba(245,239,228,0.7)', padding: '0.7rem 2rem', borderRadius: '100px', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif" }}
            >
              Refazer o quiz
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
