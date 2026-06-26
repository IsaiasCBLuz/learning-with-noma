import { useState, useEffect } from 'react'
import api from '../../api/client'
import { format, addDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HiChevronLeft, HiChevronRight, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi'

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

export default function MinhaAgenda() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [profile, setProfile] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadData() }, [weekOffset])

  async function loadData() {
    setLoading(true)
    try {
      const [slotsRes, bookingsRes, profileRes] = await Promise.all([
        api.get(`/bookings/slots?week_offset=${weekOffset}`),
        api.get('/bookings/mine'),
        api.get('/me/profile'),
      ])
      setSlots(slotsRes.data)
      setBookings(bookingsRes.data)
      setProfile(profileRes.data)
    } catch { }
    setLoading(false)
  }

  async function requestSlot(date, timeSlot) {
    setActionLoading(`${date}-${timeSlot}`)
    try {
      await api.post('/bookings', { date, time_slot: timeSlot })
      showToast('Aula solicitada! Aguarde a confirmação.', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao solicitar aula', 'error')
    }
    setActionLoading(null)
  }

  async function cancelBooking(bookingId) {
    if (!confirm('Cancelar esta aula?')) return
    try {
      await api.delete(`/bookings/${bookingId}`)
      showToast('Aula cancelada.', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao cancelar', 'error')
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Build week dates
  const today = new Date()
  const monday = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(monday, i))

  // Group slots by date
  const slotsByDate = {}
  slots.forEach(s => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = []
    slotsByDate[s.date].push(s)
  })

  // Unique time slots
  const timeSlots = [...new Set(slots.map(s => s.time_slot))].sort()

  return (
    <div className="page-agenda">
      {/* Credits card */}
      {profile && (
        <div className="credits-card">
          <div className="credits-info">
            <div className="credits-number">
              <span className="credits-big">{profile.credits_remaining}</span>
              <span className="credits-total">/ {profile.credits_remaining + profile.credits_used}</span>
            </div>
            <p className="credits-text">créditos restantes</p>
          </div>
          <div className="credits-progress">
            <div className="credits-progress-bar">
              <div className="credits-progress-fill" style={{
                width: `${Math.min(100, (profile.credits_remaining / (profile.credits_remaining + profile.credits_used || 1)) * 100)}%`
              }} />
            </div>
            <p className="credits-used">{profile.credits_used} usados</p>
          </div>
          {profile.plan && (
            <span className="credits-plan-name">{profile.plan.name} — {profile.plan.weekly_frequency}x/semana</span>
          )}
        </div>
      )}

      {/* Week navigation */}
      <div className="week-nav">
        <button onClick={() => setWeekOffset(w => w - 1)} className="week-nav-btn">
          <HiChevronLeft />
        </button>
        <span className="week-nav-label">
          {format(weekDates[0], "dd 'de' MMM", { locale: ptBR })} — {format(weekDates[4], "dd 'de' MMM", { locale: ptBR })}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)} className="week-nav-btn">
          <HiChevronRight />
        </button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)} className="week-today-btn">Hoje</button>
        )}
      </div>

      {/* Slot grid */}
      {loading ? (
        <div className="loading-container"><div className="loader-spinner" /></div>
      ) : (
        <div className="slot-grid">
          {/* Header */}
          <div className="slot-grid-header">
            <div className="slot-time-col" />
            {weekDates.map((d, i) => (
              <div key={i} className={`slot-day-col ${format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'today' : ''}`}>
                <span className="slot-day-name">{DAY_NAMES[i]}</span>
                <span className="slot-day-num">{format(d, 'dd')}</span>
              </div>
            ))}
          </div>

          {/* Slots */}
          {timeSlots.map(time => (
            <div key={time} className="slot-row">
              <div className="slot-time-col">{time}</div>
              {weekDates.map((d, i) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const slot = slotsByDate[dateStr]?.find(s => s.time_slot === time)
                const status = slot?.status || 'blocked'
                const isLoading = actionLoading === `${dateStr}-${time}`

                return (
                  <div key={i} className={`slot-cell slot-${status}`}
                    onClick={() => status === 'free' && !isLoading ? requestSlot(dateStr, time) : null}
                    title={
                      status === 'free' ? 'Clique para solicitar' :
                      status === 'mine' ? 'Sua aula confirmada' :
                      status === 'pending' ? 'Aguardando aprovação' :
                      status === 'limit' ? 'Limite atingido' :
                      status === 'occupied' ? 'Ocupado' :
                      status === 'blocked' ? 'Bloqueado' :
                      status === 'past' ? 'Passado' :
                      status === 'out_of_contract' ? 'Fora do contrato' : ''
                    }
                  >
                    {isLoading ? '...' :
                     status === 'mine' ? '✓ Minha' :
                     status === 'pending' ? '⏳ Pend.' :
                     status === 'free' ? 'Livre' :
                     status === 'limit' ? '—' :
                     status === 'occupied' ? '•' :
                     status === 'past' ? '' :
                     status === 'blocked' ? '' :
                     ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* My bookings */}
      <div className="my-bookings">
        <h3>Meus Agendamentos</h3>
        {bookings.filter(b => b.status !== 'cancelled').length === 0 ? (
          <p className="no-data">Nenhum agendamento</p>
        ) : (
          <div className="bookings-list">
            {bookings.filter(b => b.status !== 'cancelled').slice(0, 10).map(b => (
              <div key={b.id} className={`booking-item booking-${b.status}`}>
                <div className="booking-info">
                  <span className="booking-date">
                    {format(new Date(b.date + 'T12:00:00'), "dd/MM/yyyy (EEE)", { locale: ptBR })}
                  </span>
                  <span className="booking-time">{b.time_slot}</span>
                </div>
                <div className="booking-actions">
                  <span className={`status-badge status-${b.status}`}>
                    {b.status === 'pending' && <><HiOutlineClock /> Pendente</>}
                    {b.status === 'confirmed' && <><HiOutlineCheckCircle /> Confirmado</>}
                    {b.status === 'completed' && <><HiOutlineCheckCircle /> Concluído</>}
                  </span>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button className="booking-cancel-btn" onClick={() => cancelBooking(b.id)}>
                      <HiOutlineXCircle /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
