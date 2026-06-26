import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/client'
import { format, addDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HiChevronLeft, HiChevronRight, HiOutlineCheck, HiOutlineX, HiOutlineBan, HiOutlinePlus, HiOutlineLockClosed } from 'react-icons/hi'

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
const ALL_SLOTS = ["07:30", "09:00", "10:30", "12:00", "14:30", "16:00", "17:30", "19:00", "20:30", "22:00"]

export default function Agenda() {
  const location = useLocation()
  const [weekOffset, setWeekOffset] = useState(0)
  const [bookings, setBookings] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [submittingBook, setSubmittingBook] = useState(false)
  const [submittingBlock, setSubmittingBlock] = useState(false)
  const [pendingActionsLoading, setPendingActionsLoading] = useState({})

  const [showPendingModal, setShowPendingModal] = useState(false)

  useEffect(() => {
    const handleOpenPending = () => {
      setShowPendingModal(true)
    }
    window.addEventListener('openPendingModal', handleOpenPending)

    if (location.state?.openPendingModal) {
      setShowPendingModal(true)
      window.history.replaceState({}, document.title)
    }

    return () => {
      window.removeEventListener('openPendingModal', handleOpenPending)
    }
  }, [location])

  // Modals
  const [showBookModal, setShowBookModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [bookForm, setBookForm] = useState({ student_id: '', date: '', time_slot: '' })
  const [blockForm, setBlockForm] = useState({ start_date: '', end_date: '', time_slots: [], reason: '' })

  useEffect(() => { loadData() }, [weekOffset])

  async function loadData() {
    setLoading(true)
    const today = new Date()
    const monday = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
    const friday = addDays(monday, 4)

    try {
      const [bRes, blRes, sRes] = await Promise.all([
        api.get(`/admin/bookings?date_from=${format(monday, 'yyyy-MM-dd')}&date_to=${format(friday, 'yyyy-MM-dd')}`),
        api.get('/admin/blocked-slots'),
        api.get('/admin/students'),
      ])
      setBookings(bRes.data)
      setBlockedSlots(blRes.data)
      setStudents(sRes.data)
      window.dispatchEvent(new Event('reloadAdminData'))
    } catch { }
    setLoading(false)
  }

  const today = new Date()
  const monday = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(monday, i))

  const pendingBookings = bookings.filter(b => b.status === 'pending')

  async function approveBooking(id) {
    setPendingActionsLoading(prev => ({ ...prev, [id]: 'approving' }))
    try {
      await api.patch(`/admin/bookings/${id}/approve`)
      showToast('Aula aprovada!', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro', 'error')
    } finally {
      setPendingActionsLoading(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    }
  }

  async function rejectBooking(id) {
    const reason = prompt('Motivo da recusa (opcional):')
    if (reason === null) return
    setPendingActionsLoading(prev => ({ ...prev, [id]: 'rejecting' }))
    try {
      await api.patch(`/admin/bookings/${id}/reject`, { reason })
      showToast('Agendamento recusado.', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro', 'error')
    } finally {
      setPendingActionsLoading(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    }
  }

  async function cancelBooking(id) {
    const reason = prompt('Motivo do cancelamento (opcional):')
    if (reason === null) return
    setPendingActionsLoading(prev => ({ ...prev, [id]: 'cancelling' }))
    try {
      await api.delete(`/admin/bookings/${id}?reason=${encodeURIComponent(reason || '')}`)
      showToast('Aula cancelada.', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro', 'error')
    } finally {
      setPendingActionsLoading(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    }
  }

  async function createBooking(e) {
    e.preventDefault()
    setSubmittingBook(true)
    try {
      await api.post('/admin/bookings', {
        student_id: parseInt(bookForm.student_id),
        date: bookForm.date,
        time_slot: bookForm.time_slot,
      })
      showToast('Aula agendada!', 'success')
      setShowBookModal(false)
      setBookForm({ student_id: '', date: '', time_slot: '' })
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro', 'error')
    } finally {
      setSubmittingBook(false)
    }
  }

  async function batchBlock(e) {
    e.preventDefault()
    setSubmittingBlock(true)
    try {
      await api.post('/admin/blocked-slots/batch', {
        start_date: blockForm.start_date,
        end_date: blockForm.end_date,
        time_slots: blockForm.time_slots.length > 0 ? blockForm.time_slots : [],
        reason: blockForm.reason,
      })
      showToast('Horários bloqueados!', 'success')
      setShowBlockModal(false)
      setBlockForm({ start_date: '', end_date: '', time_slots: [], reason: '' })
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro', 'error')
    } finally {
      setSubmittingBlock(false)
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function getSlotContent(dateStr, time) {
    const booking = bookings.find(b => b.date === dateStr && b.time_slot === time && b.status !== 'cancelled')
    const blocked = blockedSlots.find(b => b.date === dateStr && b.time_slot === time)

    if (booking) {
      return {
        type: booking.status,
        label: booking.student_name?.split(' ')[0] || 'Aluno',
        booking,
      }
    }
    if (blocked) {
      return { type: 'blocked', label: '🔒', blocked }
    }
    return { type: 'free', label: '' }
  }

  const sortedPending = [...pendingBookings].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date)
    if (dateDiff !== 0) return dateDiff
    const slotDiff = a.time_slot.localeCompare(b.time_slot)
    if (slotDiff !== 0) return slotDiff
    return new Date(a.created_at) - new Date(b.created_at)
  })

  return (
    <div className="page-admin-agenda">
      {/* Week nav */}
      <div className="week-nav">
        <button onClick={() => setWeekOffset(w => w - 1)} className="week-nav-btn"><HiChevronLeft /></button>
        <span className="week-nav-label">
          {format(weekDates[0], "dd 'de' MMM", { locale: ptBR })} — {format(weekDates[4], "dd 'de' MMM", { locale: ptBR })}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)} className="week-nav-btn"><HiChevronRight /></button>
        {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} className="week-today-btn">Hoje</button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-container"><div className="loader-spinner" /></div>
      ) : (
        <div className="slot-grid admin-grid">
          <div className="slot-grid-header">
            <div className="slot-time-col" />
            {weekDates.map((d, i) => (
              <div key={i} className={`slot-day-col ${format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'today' : ''}`}>
                <span className="slot-day-name">{DAY_NAMES[i]}</span>
                <span className="slot-day-num">{format(d, 'dd')}</span>
              </div>
            ))}
          </div>

          {ALL_SLOTS.map(time => (
            <div key={time} className="slot-row">
              <div className="slot-time-col">{time}</div>
              {weekDates.map((d, i) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const cell = getSlotContent(dateStr, time)
                return (
                  <div key={i} className={`slot-cell admin-cell slot-${cell.type}`}
                    title={cell.booking ? `${cell.booking.student_name} — ${cell.type}` : cell.type}>
                    <span className="cell-label">{cell.label}</span>
                    {cell.booking && cell.type === 'confirmed' && (
                      <button className="cell-cancel" onClick={(e) => { e.stopPropagation(); cancelBooking(cell.booking.id) }}
                        disabled={pendingActionsLoading[cell.booking.id] === 'cancelling'}
                        title="Cancelar">
                        {pendingActionsLoading[cell.booking.id] === 'cancelling' ? '...' : '✕'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="agenda-actions">
        <button className="btn-action" onClick={() => setShowBookModal(true)}>
          <HiOutlinePlus /> Agendar Aula
        </button>
        <button className="btn-action secondary" onClick={() => setShowBlockModal(true)}>
          <HiOutlineLockClosed /> Bloquear Horários
        </button>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Agendar Aula</h3>
            <form onSubmit={createBooking}>
              <div className="form-field">
                <label>Aluno</label>
                <select value={bookForm.student_id} onChange={e => setBookForm(f => ({ ...f, student_id: e.target.value }))} required>
                  <option value="">Selecionar aluno...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Data</label>
                <input type="date" value={bookForm.date} onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Horário</label>
                <select value={bookForm.time_slot} onChange={e => setBookForm(f => ({ ...f, time_slot: e.target.value }))} required>
                  <option value="">Selecionar horário...</option>
                  {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBookModal(false)} disabled={submittingBook}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={submittingBook}>
                  {submittingBook ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Bloquear Horários em Lote</h3>
            <form onSubmit={batchBlock}>
              <div className="form-row">
                <div className="form-field">
                  <label>Data início</label>
                  <input type="date" value={blockForm.start_date} onChange={e => setBlockForm(f => ({ ...f, start_date: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label>Data fim</label>
                  <input type="date" value={blockForm.end_date} onChange={e => setBlockForm(f => ({ ...f, end_date: e.target.value }))} required />
                </div>
              </div>
              <div className="form-field">
                <label>Horários (vazio = todos)</label>
                <div className="slot-checkboxes">
                  {ALL_SLOTS.map(s => {
                    const isChecked = blockForm.time_slots.includes(s);
                    return (
                      <label key={s} className={`slot-checkbox ${isChecked ? 'checked' : ''}`}>
                        <input type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            setBlockForm(f => ({
                              ...f,
                              time_slots: e.target.checked
                                ? [...f.time_slots, s]
                                : f.time_slots.filter(t => t !== s)
                            }))
                          }}
                        />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="form-field">
                <label>Motivo (opcional)</label>
                <input type="text" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Ex: Recesso, viagem..." disabled={submittingBlock} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBlockModal(false)} disabled={submittingBlock}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={submittingBlock}>
                  {submittingBlock ? 'Bloqueando...' : 'Bloquear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Approvals Modal */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal-card pending-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-preview">
              <h3>⏳ Solicitações Pendentes</h3>
              <button className="btn-close-modal" onClick={() => setShowPendingModal(false)}>✕</button>
            </div>
            
            {pendingBookings.length === 0 ? (
              <div className="empty-state-modal" style={{ padding: '2rem 0', textAlign: 'center' }}>
                <p>Nenhuma solicitação pendente no momento.</p>
              </div>
            ) : (
              <div className="pending-modal-list">
                {sortedPending.map(b => {
                  const siblings = sortedPending.filter(x => x.date === b.date && x.time_slot === b.time_slot)
                  const isConflict = siblings.length > 1
                  const sortedSiblings = [...siblings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  const rank = sortedSiblings.findIndex(x => x.id === b.id)
                  
                  return (
                    <div key={b.id} className={`pending-modal-item ${isConflict ? 'has-conflict' : ''}`}>
                      <div className="pending-item-main">
                        <div className="pending-item-user-info">
                          <span className="pending-name">{b.student_name}</span>
                          {isConflict && (
                            rank === 0 ? (
                              <span className="badge-conflict earliest">🏆 Solicitou Primeiro</span>
                            ) : (
                              <span className="badge-conflict later">⚠️ Solicitou Depois ({rank + 1}º)</span>
                            )
                          )}
                        </div>
                        <span className="pending-date">
                          {format(new Date(b.date + 'T12:00:00'), 'dd/MM (EEE)', { locale: ptBR })} às {b.time_slot}
                        </span>
                        <div className="pending-created-at">
                          Solicitado em: {format(new Date(b.created_at), 'dd/MM/yyyy HH:mm:ss')}
                        </div>
                      </div>
                      
                      <div className="pending-actions">
                        <button className="btn-approve" onClick={() => approveBooking(b.id)} disabled={!!pendingActionsLoading[b.id]}>
                          {pendingActionsLoading[b.id] === 'approving' ? 'Aprovando...' : (
                            <>
                              <HiOutlineCheck /> Aprovar
                            </>
                          )}
                        </button>
                        <button className="btn-reject" onClick={() => rejectBooking(b.id)} disabled={!!pendingActionsLoading[b.id]}>
                          {pendingActionsLoading[b.id] === 'rejecting' ? 'Recusando...' : (
                            <>
                              <HiOutlineX /> Recusar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
