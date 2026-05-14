import { useState, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, Chip, LinearProgress,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText,
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

const QUESTIONS = [
  {
    id: 'age_group',
    question: 'Qual a sua faixa etária?',
    options: [
      { value: 'kids', label: '8 a 11 anos', sub: 'NOMA Sprouts' },
      { value: 'teens', label: '12 a 17 anos', sub: 'NOMA Buds' },
      { value: 'adults', label: '18 anos ou mais', sub: 'NOMA Bloom' },
      { value: 'bee', label: 'Preciso de suporte escolar', sub: 'NOMA Bee' },
    ],
  },
  {
    id: 'level',
    question: 'Como está seu inglês hoje?',
    options: [
      { value: 'beginner', label: 'Iniciante', sub: 'Sei quase nada' },
      { value: 'intermediate', label: 'Intermediário', sub: 'Me viro, mas tô longe do fluente' },
      { value: 'advanced', label: 'Avançado', sub: 'Falo bem, quero refinar' },
    ],
  },
  {
    id: 'style',
    question: 'Como você aprende melhor?',
    options: [
      { value: 'talking', label: 'Conversando', sub: 'Quero falar desde a primeira aula' },
      { value: 'games', label: 'Jogando', sub: 'Desafios e conquistas me motivam' },
      { value: 'mixed', label: 'Misturado', sub: 'Gosto de variedade' },
    ],
  },
  {
    id: 'commitment',
    question: 'Com que frequência quer estudar?',
    options: [
      { value: 'feather', label: '1x por semana', sub: 'Levinho, mas consistente' },
      { value: 'plus', label: '2x por semana', sub: 'Quero acelerar' },
    ],
  },
  {
    id: 'topics',
    question: 'Quais temas te interessam? (escolha de 3 a 5)',
    multi: true,
    options: [
      { value: 'viagens', label: '✈ Viagens' },
      { value: 'trabalho', label: '💼 Trabalho' },
      { value: 'series', label: '📺 Séries & Filmes' },
      { value: 'musica', label: '🎵 Música' },
      { value: 'games', label: '🎮 Games' },
      { value: 'tecnologia', label: '💻 Tecnologia' },
      { value: 'cultura', label: '🌍 Cultura geral' },
      { value: 'intercambio', label: '🎓 Intercâmbio' },
      { value: 'negocios', label: '📊 Negócios' },
      { value: 'saude', label: '🏥 Saúde' },
      { value: 'esportes', label: '⚽ Esportes' },
      { value: 'arte', label: '🎨 Arte & Design' },
    ],
  },
]

const TURMA_MAP = {
  kids: 'NOMA Sprouts',
  teens: 'NOMA Buds',
  adults: 'NOMA Bloom',
  bee: 'NOMA Bee',
}
const ESTILO_MAP = {
  talking: 'Flow',
  games: 'Level',
  mixed: 'Flow',
}
const METODO_MAP = {
  talking: 'Quest',
  games: 'Level',
  mixed: 'Quest',
}
const PLANO_MAP = {
  feather: 'Light',
  plus: 'Full',
}

const TURMA_DESC = {
  'NOMA Sprouts': 'Turma para crianças de 8 a 11 anos. Inglês como aventura, com histórias, jogos e descobertas que tornam o aprendizado natural e divertido.',
  'NOMA Buds': 'Turma para jovens de 12 a 17 anos. Conectamos o inglês com séries, música, cultura e o futuro que eles vão construir.',
  'NOMA Bloom': 'Turma para adultos (18+). Conversas reais, vocabulário prático e confiança para trabalho, viagens e relacionamentos.',
  'NOMA Bee': 'Suporte escolar contextualizado. Inglês da escola com significado, sem decoreba.',
}
const ESTILO_DESC = {
  Flow: 'Comunicação em primeiro lugar. Prática oral intensa com situações reais do dia a dia.',
  Roots: 'Base gramatical sólida. Estrutura para quem quer ler, escrever e falar com precisão.',
}
const METODO_DESC = {
  Quest: 'Novo tema a cada aula. Vocabulário construído por contexto e descoberta — nunca decoreba.',
  Level: 'Gamificado. Desafios, conquistas e progressão que tornam o aprendizado viciante.',
}

export default function Quiz() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [topics, setTopics] = useState([])
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [descDialog, setDescDialog] = useState(null)

  const totalSteps = QUESTIONS.length + 1

  const handleOption = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleTopicToggle = (value) => {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : prev.length < 5 ? [...prev, value] : prev
    )
  }

  const canProceed = () => {
    const q = QUESTIONS[step]
    if (!q) return contact.name && contact.email
    if (q.multi) return topics.length >= 3
    return !!answers[q.id]
  }

  const checkEmail = async (email) => {
    try {
      const { data } = await api.get(`/users/email-exists?email=${encodeURIComponent(email)}`)
      return data.exists
    } catch {
      return false
    }
  }

  const handleNext = async () => {
    if (step < QUESTIONS.length) {
      setStep((s) => s + 1)
      return
    }

    // Contact step — validate email
    if (!contact.name || !contact.email) return
    setLoading(true)
    setEmailError('')
    try {
      const exists = await checkEmail(contact.email)
      if (exists) {
        setEmailError('Ei ei ei, você já é meu aluno(a), faça login e solicite uma aula.')
        setLoading(false)
        return
      }

      const turma = TURMA_MAP[answers.age_group] || 'NOMA Bloom'
      const estilo = answers.level === 'beginner' ? 'Roots' : ESTILO_MAP[answers.style] || 'Flow'
      const metodo = METODO_MAP[answers.style] || 'Quest'
      const plano = PLANO_MAP[answers.commitment] || 'Light'

      await api.post('/quiz/', {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        age_group: answers.age_group,
        level: answers.level,
        style: answers.style,
        commitment: answers.commitment,
        topics,
        result_turma: turma,
        result_estilo: estilo,
        result_metodo: metodo,
        result_plano: plano,
      })

      setResult({ turma, estilo, metodo, plano })
    } catch (err) {
      setEmailError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(0)
    setAnswers({})
    setTopics([])
    setContact({ name: '', email: '', phone: '' })
    setResult(null)
    setEmailError('')
  }

  // Don't show quiz if logged in
  if (user) return null

  return (
    <Box
      id="quiz"
      sx={{ background: '#F5EFE4', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}
    >
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h2" sx={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#2E3B24', mb: 1 }}>
          Descubra seu plano
        </Typography>
        <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 5 }}>
          6 perguntas. Menos de 2 minutos.
        </Typography>

        {!result ? (
          <Box sx={{ background: '#fff', borderRadius: 3, p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(46,59,36,0.07)' }}>
            {/* Progress */}
            <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i <= step ? '#4A5E3A' : 'rgba(74,94,58,0.15)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </Box>

            {step < QUESTIONS.length ? (
              <QuizQuestion
                question={QUESTIONS[step]}
                answers={answers}
                topics={topics}
                onOption={handleOption}
                onTopicToggle={handleTopicToggle}
              />
            ) : (
              <ContactStep
                contact={contact}
                onChange={setContact}
                emailError={emailError}
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep((s) => s - 1)} disabled={loading}>
                  Voltar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed() || loading}
                sx={{ ml: 'auto' }}
                endIcon={loading && <CircularProgress size={14} color="inherit" />}
              >
                {step < QUESTIONS.length ? 'Próximo' : 'Ver meu resultado'}
              </Button>
            </Box>
          </Box>
        ) : (
          <QuizResult result={result} onReset={reset} onDescClick={setDescDialog} />
        )}
      </Box>

      {/* Description Dialog */}
      <Dialog open={!!descDialog} onClose={() => setDescDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem' }}>
          {descDialog?.label}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{descDialog?.desc}</DialogContentText>
        </DialogContent>
        <Box sx={{ px: 3, pb: 3 }}>
          <Button variant="contained" onClick={() => setDescDialog(null)}>Fechar</Button>
        </Box>
      </Dialog>
    </Box>
  )
}

function QuizQuestion({ question, answers, topics, onOption, onTopicToggle }) {
  if (question.multi) {
    return (
      <>
        <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 3 }}>
          {question.question}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {question.options.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => onTopicToggle(opt.value)}
              sx={{
                cursor: 'pointer',
                border: '1.5px solid',
                borderColor: topics.includes(opt.value) ? '#4A5E3A' : 'rgba(74,94,58,0.25)',
                background: topics.includes(opt.value) ? 'rgba(74,94,58,0.1)' : 'transparent',
                color: '#2E3B24',
                fontSize: '0.875rem',
                py: 2.5,
                '&:hover': { borderColor: '#4A5E3A' },
              }}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 2, fontSize: '0.8rem', color: '#7A8A6A' }}>
          {topics.length}/5 selecionados (mín. 3)
        </Typography>
      </>
    )
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 3 }}>
        {question.question}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {question.options.map((opt) => (
          <Box
            key={opt.value}
            onClick={() => onOption(question.id, opt.value)}
            sx={{
              border: '1.5px solid',
              borderColor: answers[question.id] === opt.value ? '#4A5E3A' : 'rgba(74,94,58,0.2)',
              borderRadius: 2,
              p: 2,
              cursor: 'pointer',
              background: answers[question.id] === opt.value ? 'rgba(74,94,58,0.06)' : 'transparent',
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#4A5E3A', background: 'rgba(74,94,58,0.04)' },
            }}
          >
            <Typography sx={{ fontWeight: 500, color: '#2E3B24', fontSize: '0.9375rem' }}>
              {opt.label}
            </Typography>
            {opt.sub && (
              <Typography sx={{ fontSize: '0.8rem', color: '#7A8A6A', mt: 0.25 }}>{opt.sub}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </>
  )
}

function ContactStep({ contact, onChange, emailError }) {
  return (
    <>
      <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 1 }}>
        Quase lá! Como posso te chamar?
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: '#7A8A6A', mb: 3 }}>
        Seus dados são usados só para te enviar o resultado. LGPD garantida.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Seu nome"
          value={contact.name}
          onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))}
          fullWidth
          size="small"
        />
        <TextField
          label="Seu email"
          type="email"
          value={contact.email}
          onChange={(e) => onChange((p) => ({ ...p, email: e.target.value }))}
          fullWidth
          size="small"
          error={!!emailError}
          helperText={emailError}
        />
        <TextField
          label="WhatsApp (opcional)"
          value={contact.phone}
          onChange={(e) => onChange((p) => ({ ...p, phone: e.target.value }))}
          fullWidth
          size="small"
        />
      </Box>
    </>
  )
}

function QuizResult({ result, onReset, onDescClick }) {
  const capsules = [
    { label: result.turma, desc: TURMA_DESC[result.turma], color: '#4A5E3A' },
    { label: result.estilo, desc: ESTILO_DESC[result.estilo], color: '#6B7E59' },
    { label: result.metodo, desc: METODO_DESC[result.metodo], color: '#2E3B24' },
  ]

  return (
    <Box sx={{ background: '#fff', borderRadius: 3, p: { xs: 3, md: 5 }, boxShadow: '0 4px 24px rgba(46,59,36,0.07)', border: '1.5px solid rgba(74,94,58,0.15)' }}>
      <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 1 }}>
        Seu resultado
      </Typography>
      <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic', color: '#7A8A6A', mb: 3, fontSize: '0.9rem' }}>
        Clique nas cápsulas para entender cada recomendação.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        {capsules.map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            onClick={() => onDescClick(c)}
            sx={{
              background: c.color,
              color: '#F5EFE4',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              py: 2.5,
              '&:hover': { opacity: 0.85 },
            }}
          />
        ))}
        {/* Plan chip — no link */}
        <Chip
          label={`Plano ${result.plano}`}
          sx={{
            background: '#C8881A',
            color: '#F5EFE4',
            fontWeight: 500,
            fontSize: '0.875rem',
            py: 2.5,
          }}
        />
      </Box>

      <Typography sx={{ fontSize: '0.875rem', color: '#7A8A6A', mb: 3 }}>
        Gostou? Fale com a Teacher Juli para começar a sua jornada.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          href={`https://wa.me/5515988137161?text=Oi%20Teacher%20Juli!%20Fiz%20o%20quiz%20e%20meu%20resultado%20foi%20${result.turma}%20%7C%20${result.estilo}%20%7C%20Plano%20${result.plano}`}
          target="_blank"
          sx={{ background: '#4A5E3A' }}
        >
          Falar com a Teacher Juli
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Refazer o quiz
        </Button>
      </Box>
    </Box>
  )
}
