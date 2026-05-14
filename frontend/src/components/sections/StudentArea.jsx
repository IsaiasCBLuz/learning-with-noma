import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, TextField, Tab, Tabs, Grid,
  Chip, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

const TIME_SLOTS = [
  '07:30','08:00','09:00','10:00','11:00',
  '14:00','16:00','18:00','19:00','20:00','21:00','22:00',
]
const DAY_LABELS = ['Seg','Ter','Qua','Qui','Sex']

function getMonday(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  mon.setHours(0, 0, 0, 0)
  return mon
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toYMD(date) {
  return date.toISOString().split('T')[0]
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

const STATUS_STYLE = {
  available:    { bg: 'rgba(74,94,58,0.1)', border: '#4A5E3A', color: '#2E3B24', cursor: 'pointer', label: '' },
  booked_by_me: { bg: '#4A5E3A', border: '#2E3B24', color: '#F5EFE4', cursor: 'default', label: 'Minha aula' },
  occupied:     { bg: 'rgba(0,0,0,0.06)', border: 'rgba(0,0,0,0.1)', color: '#aaa', cursor: 'not-allowed', label: 'Ocupado' },
  booked:       { bg: 'rgba(200,136,26,0.15)', border: '#C8881A', color: '#2E3B24', cursor: 'pointer', label: 'Ver aluno' },
  past:         { bg: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.06)', color: '#bbb', cursor: 'not-allowed', label: '' },
  locked:       { bg: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.06)', color: '#ccc', cursor: 'not-allowed', label: '🔒' },
}

export default function StudentArea() {
  const { user, login, register, logout, isAdmin } = useAuth()
  const [tab, setTab] = useState('schedule')
  const [weekStart, setWeekStart] = useState(getMonday())
  const [slots, setSlots] = useState([])
  const [creditsRemaining, setCreditsRemaining] = useState(null)
  const [bookingsThisWeek, setBookingsThisWeek] = useState(0)
  const [myBookings, setMyBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmSlot, setConfirmSlot] = useState(null)
  const [loginMode, setLoginMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const fetchWeek = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await api.get('/bookings/week', {
        params: { week_start: toYMD(weekStart) },
      })
      setSlots(data.slots || [])
      setCreditsRemaining(data.credits_remaining)
      setBookingsThisWeek(data.bookings_this_week || 0)
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [user, weekStart])

  const fetchMyBookings = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get('/bookings/my')
      setMyBookings(data)
    } catch { setMyBookings([]) }
  }, [user])

  const fetchAllBookings = useCallback(async () => {
    if (!isAdmin) return
    try {
      const { data } = await api.get('/bookings/admin/all')
      setAllBookings(data)
    } catch { setAllBookings([]) }
  }, [isAdmin])

  useEffect(() => { fetchWeek() }, [fetchWeek])
  useEffect(() => { fetchMyBookings() }, [fetchMyBookings])
  useEffect(() => { if (isAdmin) fetchAllBookings() }, [fetchAllBookings, isAdmin])

  const handleAuth = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      if (loginMode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.phone)
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Erro ao autenticar')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleBook = async () => {
    if (!confirmSlot) return
    try {
      await api.post('/bookings/', {
        date: confirmSlot.date,
        time_slot: confirmSlot.time_slot,
      })
      setConfirmSlot(null)
      fetchWeek()
      fetchMyBookings()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao agendar')
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancelar esta aula?')) return
    try {
      await api.delete(`/bookings/${bookingId}`)
      fetchMyBookings()
      fetchWeek()
      if (isAdmin) fetchAllBookings()
    } catch {
      alert('Erro ao cancelar')
    }
  }

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  return (
    <Box id="aluno" sx={{ background: '#F5EFE4', py: { xs: 6, md: 10 }, px: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography variant="h2" sx={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#2E3B24', mb: 1 }}>
          Área do Aluno
        </Typography>

        {!user ? (
          <AuthForm
            mode={loginMode}
            form={form}
            onChange={setForm}
            onSubmit={handleAuth}
            onToggleMode={() => { setLoginMode(m => m === 'login' ? 'register' : 'login'); setAuthError('') }}
            error={authError}
            loading={authLoading}
          />
        ) : (
          <>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ color: '#4A5E3A', fontSize: '0.9rem', mb: 0.5 }}>
                  Olá, {user.name.split(' ')[0]}!
                </Typography>
                {user.profile && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip label={`Plano ${user.profile.plan.replace('_', ' ')}`} size="small" sx={{ background: '#4A5E3A', color: '#fff' }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: '#7A8A6A' }}>
                      {creditsRemaining ?? user.profile.credits_remaining} créditos restantes
                    </Typography>
                  </Box>
                )}
              </Box>
              <Button variant="outlined" size="small" onClick={logout}>Sair</Button>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
              <Tab label="Agendar" value="schedule" />
              <Tab label="Minhas aulas" value="my" />
              {isAdmin && <Tab label="Todos os agendamentos" value="admin" />}
            </Tabs>

            {tab === 'schedule' && (
              <ScheduleGrid
                weekDays={weekDays}
                weekStart={weekStart}
                slots={slots}
                loading={loading}
                onPrev={() => setWeekStart(d => addDays(d, -7))}
                onNext={() => setWeekStart(d => addDays(d, 7))}
                onSlotClick={setConfirmSlot}
                onCancel={handleCancel}
                bookingsThisWeek={bookingsThisWeek}
                profile={user.profile}
              />
            )}

            {tab === 'my' && (
              <MyBookings bookings={myBookings} onCancel={handleCancel} />
            )}

            {tab === 'admin' && isAdmin && (
              <AdminBookingsTable bookings={allBookings} onCancel={handleCancel} />
            )}
          </>
        )}
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmSlot} onClose={() => setConfirmSlot(null)}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>Confirmar agendamento</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmSlot && `${formatDate(confirmSlot.date)} às ${confirmSlot.time_slot}`}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#7A8A6A', mt: 1 }}>
            Esta aula usará 1 crédito do seu plano.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSlot(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleBook}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function AuthForm({ mode, form, onChange, onSubmit, onToggleMode, error, loading }) {
  return (
    <Box sx={{ maxWidth: 420, background: '#fff', borderRadius: 3, p: 4, mt: 3, boxShadow: '0 4px 24px rgba(46,59,36,0.07)' }}>
      <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', mb: 3 }}>
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mode === 'register' && (
          <TextField label="Seu nome" value={form.name} onChange={e => onChange(p => ({ ...p, name: e.target.value }))} fullWidth size="small" />
        )}
        <TextField label="Email" type="email" value={form.email} onChange={e => onChange(p => ({ ...p, email: e.target.value }))} fullWidth size="small" />
        <TextField label="Senha" type="password" value={form.password} onChange={e => onChange(p => ({ ...p, password: e.target.value }))} fullWidth size="small" />
        {mode === 'register' && (
          <TextField label="WhatsApp (opcional)" value={form.phone} onChange={e => onChange(p => ({ ...p, phone: e.target.value }))} fullWidth size="small" />
        )}
        {error && <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>{error}</Alert>}
        <Button variant="contained" onClick={onSubmit} disabled={loading}
          endIcon={loading && <CircularProgress size={14} color="inherit" />}>
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>
        <Button variant="text" size="small" onClick={onToggleMode} sx={{ color: '#7A8A6A' }}>
          {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </Button>
      </Box>
    </Box>
  )
}

function ScheduleGrid({ weekDays, weekStart, slots, loading, onPrev, onNext, onSlotClick, onCancel, bookingsThisWeek, profile }) {
  const getSlot = (date, ts) =>
    slots.find(s => s.date === toYMD(date) && s.time_slot === ts)

  const maxPerWeek = profile?.max_per_week || 1
  const canBook = (creditsRemaining) => {
    if (creditsRemaining !== null && creditsRemaining <= 0) return false
    if (bookingsThisWeek >= maxPerWeek) return false
    return true
  }

  return (
    <Box>
      {/* Week nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={onPrev} size="small"><ChevronLeftIcon /></IconButton>
        <Typography sx={{ fontSize: '0.875rem', color: '#4A5E3A', fontWeight: 500 }}>
          {formatDate(toYMD(weekDays[0]))} – {formatDate(toYMD(weekDays[4]))}
        </Typography>
        <IconButton onClick={onNext} size="small"><ChevronRightIcon /></IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 500 }}>
            {/* Header */}
            <Grid container sx={{ mb: 1 }}>
              <Grid item xs={1.5} />
              {weekDays.map((d, i) => (
                <Grid item key={i} xs={2.1}>
                  <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: '#7A8A6A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {DAY_LABELS[i]}<br />{formatDate(toYMD(d))}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Slots */}
            {TIME_SLOTS.map((ts) => (
              <Grid container key={ts} sx={{ mb: 0.75 }} alignItems="center">
                <Grid item xs={1.5}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#7A8A6A', textAlign: 'right', pr: 1 }}>{ts}</Typography>
                </Grid>
                {weekDays.map((d, di) => {
                  const slot = getSlot(d, ts)
                  const status = slot?.status || 'available'
                  const style = STATUS_STYLE[status] || STATUS_STYLE.available
                  const clickable = status === 'available' && canBook(null)
                  const cancelable = status === 'booked_by_me' && slot?.booking_id

                  return (
                    <Grid item key={di} xs={2.1} sx={{ px: 0.5 }}>
                      <Tooltip title={style.label || (status === 'available' ? 'Disponível' : '')} arrow>
                        <Box
                          onClick={() => {
                            if (status === 'available') onSlotClick({ date: toYMD(d), time_slot: ts })
                            if (cancelable) onCancel(slot.booking_id)
                          }}
                          sx={{
                            height: 32,
                            borderRadius: 1,
                            border: `1px solid ${style.border}`,
                            background: style.bg,
                            cursor: style.cursor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.15s',
                            '&:hover': status === 'available' ? { opacity: 0.75 } : {},
                          }}
                        >
                          <Typography sx={{ fontSize: '0.6rem', color: style.color }}>
                            {style.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  )
                })}
              </Grid>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function MyBookings({ bookings, onCancel }) {
  if (!bookings.length) return (
    <Typography sx={{ color: '#7A8A6A', mt: 2, fontWeight: 300 }}>Você ainda não tem aulas agendadas.</Typography>
  )
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {bookings.map((b) => (
        <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 6px rgba(46,59,36,0.06)' }}>
          <Box>
            <Typography sx={{ fontWeight: 500, color: '#2E3B24', fontSize: '0.9375rem' }}>
              {formatDate(b.date)} às {b.time_slot}
            </Typography>
            <Chip label={b.status} size="small" sx={{ mt: 0.5, background: '#4A5E3A', color: '#fff', fontSize: '0.7rem' }} />
          </Box>
          <Button size="small" color="error" variant="outlined" onClick={() => onCancel(b.id)}>Cancelar</Button>
        </Box>
      ))}
    </Box>
  )
}

function AdminBookingsTable({ bookings, onCancel }) {
  if (!bookings.length) return (
    <Typography sx={{ color: '#7A8A6A', mt: 2 }}>Nenhum agendamento encontrado.</Typography>
  )
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ minWidth: 600 }}>
        <Grid container sx={{ mb: 1, px: 2 }}>
          {['Aluno', 'Data', 'Horário', 'Status', ''].map((h) => (
            <Grid item xs={h === '' ? 2 : 2.5} key={h}>
              <Typography sx={{ fontSize: '0.75rem', color: '#7A8A6A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Typography>
            </Grid>
          ))}
        </Grid>
        {bookings.map((b) => (
          <Grid container key={b.id} alignItems="center" sx={{ background: '#fff', borderRadius: 1.5, mb: 0.75, px: 2, py: 1.25, boxShadow: '0 1px 4px rgba(46,59,36,0.05)' }}>
            <Grid item xs={2.5}><Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{b.student_name || '—'}</Typography></Grid>
            <Grid item xs={2.5}><Typography sx={{ fontSize: '0.875rem' }}>{formatDate(b.date)}</Typography></Grid>
            <Grid item xs={2.5}><Typography sx={{ fontSize: '0.875rem' }}>{b.time_slot}</Typography></Grid>
            <Grid item xs={2.5}><Chip label={b.status} size="small" sx={{ background: '#4A5E3A', color: '#fff', fontSize: '0.7rem' }} /></Grid>
            <Grid item xs={2}><Button size="small" color="error" onClick={() => onCancel(b.id)}>Cancelar</Button></Grid>
          </Grid>
        ))}
      </Box>
    </Box>
  )
}
