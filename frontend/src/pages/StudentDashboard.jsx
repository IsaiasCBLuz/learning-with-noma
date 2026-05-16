import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

// ── Tela de troca de senha obrigatória ───────────────────────────────────────

function ForceChangePassword() {
  const { refreshUser } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/users/change-password', { new_password: password })
      await refreshUser()
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao salvar senha.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="px-8 py-5 border-b border-[rgba(74,94,58,0.12)]">
        <img src="/images/logo.jpeg" alt="NOMA" className="h-10 object-contain" />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[0.72rem] tracking-[0.22em] text-gold uppercase font-medium text-center mb-3">
            Primeiro acesso
          </p>
          <h1 className="font-serif text-[2.2rem] font-semibold text-green-dark text-center leading-[1.1] mb-2">
            Crie sua senha
          </h1>
          <p className="text-[0.88rem] text-muted text-center mb-8">
            Por segurança, defina uma senha pessoal antes de continuar.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nova senha (mín. 8 caracteres)"
              autoComplete="new-password"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(74,94,58,0.3)] text-[0.9rem] bg-white text-green-dark outline-none focus:border-green font-sans placeholder:text-muted transition-colors"
            />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirmar senha"
              autoComplete="new-password"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(74,94,58,0.3)] text-[0.9rem] bg-white text-green-dark outline-none focus:border-green font-sans placeholder:text-muted transition-colors"
            />
            {error && <p className="text-[0.8rem] text-[#c0392b]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 bg-green text-cream rounded-full text-[0.95rem] font-medium border-none cursor-pointer font-sans transition-colors hover:bg-green-dark disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar senha e continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const ALL_SLOTS = ["07:30","09:00","10:30","12:00","14:30","16:00","17:30","19:00","20:30","22:00"]
const DAYS_PT = ['Seg','Ter','Qua','Qui','Sex']
const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

const PLAN_LABELS = {
  light: 'Light', 'light+': 'Light+', 'light++': 'Light++', light_annual: 'Light Anual',
  full: 'Full', 'full+': 'Full+', 'full++': 'Full++', full_annual: 'Full Anual', bee: 'Bee',
}

const STATUS_STYLE = {
  free:             'bg-[rgba(74,94,58,0.08)] text-green-dark cursor-pointer hover:bg-[rgba(74,94,58,0.18)] transition-colors',
  mine:             'bg-[rgba(200,136,26,0.18)] text-[#7a5500] cursor-default',
  occupied:         'bg-[rgba(0,0,0,0.04)] text-muted cursor-not-allowed',
  blocked:          'bg-[rgba(0,0,0,0.03)] text-[rgba(122,138,106,0.4)] cursor-not-allowed',
  past:             'bg-transparent text-[rgba(122,138,106,0.25)] cursor-not-allowed',
  out_of_contract:  'bg-[rgba(220,100,100,0.05)] text-[rgba(122,138,106,0.45)] cursor-not-allowed',
  limit:            'bg-[rgba(200,136,26,0.07)] text-gold cursor-not-allowed',
}

const STATUS_DISPLAY = {
  free: 'Livre', mine: '✓', occupied: 'Ocupado',
  blocked: '—', past: '—', out_of_contract: '—', limit: 'Limite',
}

function weekDates(offset) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function dateToISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtShort(d) {
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`
}

function fmtFull(isoStr) {
  const [y, m, day] = isoStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  return `${DAYS_PT[d.getDay() - 1]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${y}`
}

function fmtDateBR(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}


// ── Tab: Agendar ──────────────────────────────────────────────────────────────

function TabAgendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(null)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const days = weekDates(weekOffset)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.get(`/bookings/slots?week_offset=${weekOffset}`)
      .then(({ data }) => { if (active) setSlots(data) })
      .catch(() => { if (active) setError('Erro ao carregar horários.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [weekOffset])

  const slotMap = {}
  slots.forEach(s => { slotMap[`${s.date}|${s.time_slot}`] = s.status })

  async function handleBook() {
    if (!confirming) return
    setBooking(true)
    setError('')
    try {
      await api.post('/bookings', { date: confirming.date, time_slot: confirming.time_slot })
      setSuccess('Aula agendada com sucesso!')
      setConfirming(null)
      // trigger refetch by bumping weekOffset briefly then restoring
      setSlots([])
      setLoading(true)
      api.get(`/bookings/slots?week_offset=${weekOffset}`)
        .then(({ data }) => setSlots(data))
        .finally(() => setLoading(false))
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao agendar.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          disabled={weekOffset <= 0}
          className="px-4 py-2 rounded-full border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark text-[0.82rem] font-sans disabled:opacity-30 disabled:cursor-not-allowed hover:border-green transition-colors"
        >
          ← Anterior
        </button>
        <span className="font-serif text-[0.95rem] text-green-dark whitespace-nowrap">
          {fmtShort(days[0])} – {fmtShort(days[4])}
        </span>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          className="px-4 py-2 rounded-full border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark text-[0.82rem] font-sans hover:border-green transition-colors"
        >
          Próxima →
        </button>
      </div>

      {success && <p className="text-[0.85rem] text-green mb-4">{success}</p>}
      {error && !confirming && <p className="text-[0.85rem] text-[#c0392b] mb-4">{error}</p>}

      {loading ? (
        <p className="text-muted text-[0.9rem]">Carregando horários...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.8rem]">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-3 text-muted font-normal w-14"></th>
                  {days.map((d, i) => (
                    <th key={i} className="text-center py-2 px-1 text-green-dark font-medium min-w-[80px]">
                      <div className="text-[0.82rem]">{DAYS_PT[i]}</div>
                      <div className="text-[0.72rem] text-muted font-normal">{fmtShort(d)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_SLOTS.map(slot => (
                  <tr key={slot} className="border-t border-[rgba(74,94,58,0.07)]">
                    <td className="py-1.5 pr-3 text-muted font-medium text-[0.78rem]">{slot}</td>
                    {days.map((d, i) => {
                      const iso = dateToISO(d)
                      const status = slotMap[`${iso}|${slot}`] || 'blocked'
                      return (
                        <td key={i} className="py-1 px-1 text-center">
                          <div
                            onClick={status === 'free' ? () => setConfirming({ date: iso, time_slot: slot }) : undefined}
                            className={`rounded-[7px] py-[5px] px-1 text-[0.72rem] select-none ${STATUS_STYLE[status] || STATUS_STYLE.blocked}`}
                          >
                            {STATUS_DISPLAY[status] ?? '—'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 text-[0.72rem] text-muted">
            {[
              ['free', 'Livre'],
              ['mine', 'Minha aula'],
              ['occupied', 'Ocupado'],
              ['blocked', 'Bloqueado'],
              ['limit', 'Limite atingido'],
            ].map(([st, label]) => (
              <span key={st} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded-sm ${STATUS_STYLE[st].split(' ')[0]}`} />
                {label}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 bg-[rgba(46,59,36,0.4)] flex items-center justify-center z-50 px-4">
          <div className="bg-[#fdfaf5] rounded-[22px] px-8 py-8 max-w-sm w-full shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <p className="text-[0.68rem] tracking-[0.22em] uppercase text-gold font-semibold mb-2">Confirmar aula</p>
            <h3 className="font-serif text-[2rem] font-semibold text-green-dark mb-1">
              {confirming.time_slot}
            </h3>
            <p className="text-[0.88rem] text-muted mb-6 capitalize">{fmtFull(confirming.date)}</p>
            {error && <p className="text-[0.8rem] text-[#c0392b] mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleBook}
                disabled={booking}
                className="flex-1 py-3 bg-green text-cream rounded-full text-[0.9rem] font-medium border-none cursor-pointer font-sans transition-colors hover:bg-green-dark disabled:opacity-60"
              >
                {booking ? 'Agendando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => { setConfirming(null); setError('') }}
                className="flex-1 py-3 border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark rounded-full text-[0.9rem] font-medium bg-transparent cursor-pointer font-sans hover:border-green transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Tab: Minhas Aulas ─────────────────────────────────────────────────────────

function BookingRow({ booking, onCancel, cancelling }) {
  const [y, m, d] = booking.date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dayIdx = dateObj.getDay()
  const label = dayIdx >= 1 && dayIdx <= 5
    ? `${DAYS_PT[dayIdx - 1]}, ${dateObj.getDate()} de ${MONTHS_PT[dateObj.getMonth()]}`
    : fmtDateBR(booking.date)

  const today = new Date().toISOString().split('T')[0]
  const isFuture = booking.date > today

  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(74,94,58,0.08)] last:border-0">
      <div>
        <p className="text-[0.9rem] text-green-dark font-medium">{label}</p>
        <p className="text-[0.78rem] text-muted">{booking.time_slot}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[0.68rem] px-3 py-1 rounded-full font-semibold tracking-wide ${
          booking.status === 'confirmed'
            ? 'bg-[rgba(74,94,58,0.1)] text-green'
            : 'bg-[rgba(0,0,0,0.05)] text-muted'
        }`}>
          {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
        </span>
        {isFuture && booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking.id)}
            disabled={cancelling === booking.id}
            className="text-[0.75rem] text-muted underline bg-transparent border-none cursor-pointer font-sans hover:text-[#c0392b] transition-colors disabled:opacity-50"
          >
            {cancelling === booking.id ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  )
}

function TabMinhasAulas() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    api.get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch(() => setError('Erro ao carregar aulas.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id) {
    setCancelling(id)
    try {
      await api.delete(`/bookings/${id}`)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao cancelar aula.')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <p className="text-muted text-[0.9rem]">Carregando aulas...</p>
  if (error) return <p className="text-[0.85rem] text-[#c0392b]">{error}</p>

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.date >= today)
  const past = bookings.filter(b => b.status === 'confirmed' && b.date < today)
  const cancelled = bookings.filter(b => b.status === 'cancelled')

  if (bookings.length === 0) {
    return (
      <p className="text-muted text-[0.9rem]">Você ainda não tem aulas agendadas. Use a aba "Agendar aula" para começar.</p>
    )
  }

  const rowProps = { onCancel: handleCancel, cancelling }

  return (
    <div>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <p className="text-[0.68rem] tracking-[0.18em] uppercase text-green font-semibold mb-3">Próximas aulas</p>
          {upcoming.map(b => <BookingRow key={b.id} booking={b} {...rowProps} />)}
        </div>
      )}
      {past.length > 0 && (
        <div className="mb-8">
          <p className="text-[0.68rem] tracking-[0.18em] uppercase text-muted font-semibold mb-3">Aulas realizadas</p>
          {past.map(b => <BookingRow key={b.id} booking={b} {...rowProps} />)}
        </div>
      )}
      {cancelled.length > 0 && (
        <div>
          <p className="text-[0.68rem] tracking-[0.18em] uppercase text-muted font-semibold mb-3">Canceladas</p>
          {cancelled.map(b => <BookingRow key={b.id} booking={b} {...rowProps} />)}
        </div>
      )}
    </div>
  )
}


// ── Tab: Meu Perfil ───────────────────────────────────────────────────────────

function TabPerfil({ user }) {
  const fields = [
    { label: 'Usuário', value: user.username },
    { label: 'E-mail', value: user.email || '—' },
    { label: 'WhatsApp', value: user.phone || '—' },
    { label: 'Turma', value: user.turma || '—' },
    { label: 'Plano', value: PLAN_LABELS[user.plan] || user.plan || '—' },
    { label: 'Estilo de aprendizado', value: user.style || '—' },
    { label: 'Método', value: user.method || '—' },
    { label: 'Início do contrato', value: fmtDateBR(user.contract_start) },
    { label: 'Fim do contrato', value: fmtDateBR(user.contract_end) },
    { label: 'Créditos totais', value: user.credits_total != null ? String(user.credits_total) : '—' },
  ]

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-[16px] px-5 py-4 border border-[rgba(74,94,58,0.08)]">
            <p className="text-[0.65rem] tracking-[0.16em] uppercase text-muted font-semibold mb-1">{label}</p>
            <p className="text-[0.92rem] text-green-dark font-medium">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-[0.75rem] text-muted mt-6 leading-[1.7]">
        Para atualizar seus dados ou tirar dúvidas sobre seu plano, fale com a Teacher Juli via WhatsApp.
      </p>
    </div>
  )
}


// ── Dashboard ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'schedule', label: 'Agendar aula' },
  { id: 'bookings', label: 'Minhas aulas' },
  { id: 'profile',  label: 'Meu perfil'  },
]

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('schedule')

  if (user?.must_change_password) return <ForceChangePassword />

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-6 md:px-10 py-4 border-b border-[rgba(74,94,58,0.12)] flex items-center justify-between">
        <a href="/">
          <img src="/images/logo.jpeg" alt="NOMA" className="h-9 object-contain" />
        </a>
        <div className="flex items-center gap-4">
          <span className="text-[0.82rem] text-muted hidden sm:block">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-[0.8rem] text-muted border-[1.5px] border-[rgba(74,94,58,0.25)] px-4 py-[6px] rounded-full font-sans bg-transparent cursor-pointer hover:border-green hover:text-green-dark transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-[920px] mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <p className="text-[0.68rem] tracking-[0.22em] uppercase text-gold font-semibold mb-1">Área do Aluno</p>
          <h1 className="font-serif text-[2rem] font-semibold text-green-dark leading-[1.1]">
            Olá, {user?.username}
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-[rgba(74,94,58,0.06)] rounded-full p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-full text-[0.83rem] font-medium font-sans border-none cursor-pointer transition-all ${
                tab === t.id
                  ? 'bg-green text-cream shadow-sm'
                  : 'bg-transparent text-muted hover:text-green-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'schedule' && <TabAgendar />}
        {tab === 'bookings' && <TabMinhasAulas />}
        {tab === 'profile'  && <TabPerfil user={user} />}
      </main>
    </div>
  )
}
