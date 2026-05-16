import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

const ALL_SLOTS = ["07:30","09:00","10:30","12:00","14:30","16:00","17:30","19:00","20:30","22:00"]
const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

const PLAN_OPTIONS = [
  'light','light+','light++','light_annual',
  'full','full+','full++','full_annual','bee',
]

function fmtDateBR(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtDateTime(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-semibold">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-[10px] border-[1.5px] border-[rgba(74,94,58,0.25)] text-[0.88rem] text-green-dark font-sans outline-none focus:border-green bg-white transition-colors"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-semibold">{label}</label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 rounded-[10px] border-[1.5px] border-[rgba(74,94,58,0.25)] text-[0.88rem] text-green-dark font-sans outline-none focus:border-green bg-white transition-colors"
      >
        <option value="">— nenhum —</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Modal: Invite Student ─────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError('Nome e e-mail são obrigatórios.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/students/invite', form)
      setSuccess(`Convite enviado para ${form.email}. Usuário criado: ${data.username}`)
      onInvited(data)
      setTimeout(onClose, 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao enviar convite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(46,59,36,0.4)] flex items-center justify-center z-50 px-4">
      <div className="bg-[#fdfaf5] rounded-[22px] px-8 py-8 w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <p className="text-[0.68rem] tracking-[0.22em] uppercase text-gold font-semibold mb-1">Cadastro de aluno</p>
        <h3 className="font-serif text-[1.7rem] font-semibold text-green-dark mb-2">Convidar aluno</h3>
        <p className="text-[0.85rem] text-muted mb-6 leading-[1.6]">
          Um e-mail com senha temporária será enviado automaticamente. O aluno deverá criar uma senha própria no primeiro acesso.
        </p>

        {success ? (
          <div className="bg-[rgba(74,94,58,0.08)] rounded-[14px] px-5 py-4">
            <p className="text-[0.88rem] text-green font-medium">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField label="Nome completo *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="ex: Maria Silva" />
            <InputField label="E-mail *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="ex: maria@email.com" />
            {error && <p className="text-[0.8rem] text-[#c0392b]">{error}</p>}
            <div className="flex gap-3 mt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green text-cream rounded-full text-[0.9rem] font-medium border-none cursor-pointer font-sans hover:bg-green-dark disabled:opacity-60 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar convite'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark rounded-full text-[0.9rem] font-medium bg-transparent cursor-pointer font-sans hover:border-green transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


// ── Modal: Create/Edit Student ────────────────────────────────────────────────

const EMPTY_FORM = {
  username: '', password: '', email: '', phone: '',
  turma: '', plan: '', style: '', method: '',
  contract_start: '', contract_end: '', credits_total: '',
}

function StudentModal({ initial, onClose, onSave }) {
  const isEdit = !!initial
  const [form, setForm] = useState(
    isEdit ? { ...initial, password: '', credits_total: initial.credits_total ?? '' } : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field) {
    return val => setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (!payload.credits_total) delete payload.credits_total
      else payload.credits_total = Number(payload.credits_total)
      if (!payload.contract_start) delete payload.contract_start
      if (!payload.contract_end) delete payload.contract_end

      if (isEdit) {
        const { data } = await api.patch(`/admin/students/${initial.id}`, payload)
        onSave(data)
      } else {
        const { data } = await api.post('/admin/students', payload)
        onSave(data)
      }
      onClose()
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(46,59,36,0.4)] flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-[#fdfaf5] rounded-[22px] px-8 py-8 w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <p className="text-[0.68rem] tracking-[0.22em] uppercase text-gold font-semibold mb-1">
          {isEdit ? 'Editar aluno' : 'Novo aluno'}
        </p>
        <h3 className="font-serif text-[1.6rem] font-semibold text-green-dark mb-6">
          {isEdit ? initial.username : 'Cadastrar aluno'}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Usuário *" value={form.username} onChange={set('username')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField
              label={isEdit ? 'Nova senha (deixe vazio para não alterar)' : 'Senha *'}
              value={form.password} onChange={set('password')} type="password"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="E-mail" value={form.email} onChange={set('email')} type="email" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="WhatsApp" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Turma" value={form.turma} onChange={set('turma')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <SelectField label="Plano" value={form.plan} onChange={set('plan')} options={PLAN_OPTIONS} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Estilo" value={form.style} onChange={set('style')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Método" value={form.method} onChange={set('method')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Início do contrato" value={form.contract_start} onChange={set('contract_start')} type="date" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Fim do contrato" value={form.contract_end} onChange={set('contract_end')} type="date" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <InputField label="Créditos totais" value={form.credits_total} onChange={set('credits_total')} type="number" />
          </div>

          {error && <p className="col-span-2 text-[0.8rem] text-[#c0392b]">{error}</p>}

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-green text-cream rounded-full text-[0.9rem] font-medium border-none cursor-pointer font-sans hover:bg-green-dark disabled:opacity-60 transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark rounded-full text-[0.9rem] font-medium bg-transparent cursor-pointer font-sans hover:border-green transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// ── Tab: Alunos ───────────────────────────────────────────────────────────────

function TabAlunos() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | student object
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/students')
      .then(({ data }) => setStudents(data))
      .catch(() => setError('Erro ao carregar alunos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Excluir este aluno e todos os seus agendamentos?')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/students/${id}`)
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch {
      setError('Erro ao excluir aluno.')
    } finally {
      setDeleting(null)
    }
  }

  function onSave(saved) {
    setStudents(prev => {
      const idx = prev.findIndex(s => s.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  if (loading) return <p className="text-muted text-[0.9rem]">Carregando alunos...</p>

  return (
    <div>
      {error && <p className="text-[0.82rem] text-[#c0392b] mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-5">
        <p className="text-[0.82rem] text-muted">{students.length} aluno(s)</p>
        <div className="flex gap-2">
          <button
            onClick={() => setInviteOpen(true)}
            className="px-5 py-2 bg-green text-cream rounded-full text-[0.85rem] font-medium border-none cursor-pointer font-sans hover:bg-green-dark transition-colors"
          >
            Convidar aluno
          </button>
          <button
            onClick={() => setModal('new')}
            className="px-5 py-2 border-[1.5px] border-[rgba(74,94,58,0.35)] text-green-dark rounded-full text-[0.85rem] font-medium bg-transparent cursor-pointer font-sans hover:border-green transition-colors"
          >
            + Cadastro manual
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem] border-collapse">
          <thead>
            <tr className="border-b-2 border-[rgba(74,94,58,0.12)]">
              {['Usuário','E-mail','Plano','Turma','Contrato','Créditos',''].map(h => (
                <th key={h} className="text-left py-2 px-3 text-muted font-semibold text-[0.68rem] tracking-[0.12em] uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-[rgba(74,94,58,0.07)] hover:bg-[rgba(74,94,58,0.03)] transition-colors">
                <td className="py-2.5 px-3 text-green-dark font-medium">{s.username}</td>
                <td className="py-2.5 px-3 text-muted">{s.email || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{s.plan || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{s.turma || '—'}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                  {fmtDateBR(s.contract_start)} – {fmtDateBR(s.contract_end)}
                </td>
                <td className="py-2.5 px-3 text-muted">{s.credits_total ?? '—'}</td>
                <td className="py-2.5 px-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModal(s)}
                      className="text-green underline bg-transparent border-none cursor-pointer font-sans text-[0.78rem] hover:text-green-dark transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting === s.id}
                      className="text-[#c0392b] underline bg-transparent border-none cursor-pointer font-sans text-[0.78rem] hover:opacity-70 transition-opacity disabled:opacity-40"
                    >
                      {deleting === s.id ? '...' : 'Excluir'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="text-muted text-[0.88rem] mt-4">Nenhum aluno cadastrado.</p>
        )}
      </div>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onInvited={onSave}
        />
      )}

      {modal && (
        <StudentModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={onSave}
        />
      )}
    </div>
  )
}


// ── Tab: Agendamentos ─────────────────────────────────────────────────────────

function TabAgendamentos() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    api.get('/admin/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => setError('Erro ao carregar agendamentos.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id) {
    if (!window.confirm('Cancelar este agendamento?')) return
    setCancelling(id)
    try {
      await api.delete(`/admin/bookings/${id}`)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch {
      setError('Erro ao cancelar agendamento.')
    } finally {
      setCancelling(null)
    }
  }

  function handleExport() {
    const token = localStorage.getItem('access_token')
    const a = document.createElement('a')
    a.href = `/api/admin/export/bookings.csv`
    a.setAttribute('download', 'agendamentos.csv')
    // fetch with auth, then trigger download
    fetch('/api/admin/export/bookings.csv', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        a.href = url
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  if (loading) return <p className="text-muted text-[0.9rem]">Carregando agendamentos...</p>

  return (
    <div>
      {error && <p className="text-[0.82rem] text-[#c0392b] mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-5">
        <p className="text-[0.82rem] text-muted">{bookings.length} agendamento(s) confirmado(s)</p>
        <button
          onClick={handleExport}
          className="px-5 py-2 border-[1.5px] border-[rgba(74,94,58,0.3)] text-green-dark rounded-full text-[0.83rem] font-medium bg-transparent cursor-pointer font-sans hover:border-green transition-colors"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem] border-collapse">
          <thead>
            <tr className="border-b-2 border-[rgba(74,94,58,0.12)]">
              {['Aluno','Data','Horário','Agendado em',''].map(h => (
                <th key={h} className="text-left py-2 px-3 text-muted font-semibold text-[0.68rem] tracking-[0.12em] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b border-[rgba(74,94,58,0.07)] hover:bg-[rgba(74,94,58,0.03)] transition-colors">
                <td className="py-2.5 px-3 text-green-dark font-medium">{b.username || '—'}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">{fmtDateBR(b.date)}</td>
                <td className="py-2.5 px-3 text-muted">{b.time_slot}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">{fmtDateTime(b.created_at)}</td>
                <td className="py-2.5 px-3">
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="text-[#c0392b] underline bg-transparent border-none cursor-pointer font-sans text-[0.78rem] hover:opacity-70 disabled:opacity-40"
                  >
                    {cancelling === b.id ? '...' : 'Cancelar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="text-muted text-[0.88rem] mt-4">Nenhum agendamento confirmado.</p>
        )}
      </div>
    </div>
  )
}


// ── Tab: Horários ─────────────────────────────────────────────────────────────

function TabHorarios() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ date: '', time_slot: '', reason: '' })
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    api.get('/admin/blocked-slots')
      .then(({ data }) => setBlocks(data))
      .catch(() => setError('Erro ao carregar bloqueios.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleBlock(e) {
    e.preventDefault()
    if (!form.date || !form.time_slot) { setError('Selecione data e horário.'); return }
    setAdding(true)
    setError('')
    try {
      const { data } = await api.post('/admin/blocked-slots', form)
      setBlocks(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setForm({ date: '', time_slot: '', reason: '' })
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao bloquear slot.')
    } finally {
      setAdding(false)
    }
  }

  async function handleUnblock(id) {
    setRemoving(id)
    try {
      await api.delete(`/admin/blocked-slots/${id}`)
      setBlocks(prev => prev.filter(b => b.id !== id))
    } catch {
      setError('Erro ao desbloquear slot.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      {error && <p className="text-[0.82rem] text-[#c0392b] mb-4">{error}</p>}

      {/* Block form */}
      <div className="bg-white rounded-[18px] p-6 border border-[rgba(74,94,58,0.1)] mb-8">
        <p className="text-[0.68rem] tracking-[0.18em] uppercase text-green font-semibold mb-4">Bloquear horário</p>
        <form onSubmit={handleBlock} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted font-semibold block mb-1">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[rgba(74,94,58,0.25)] text-[0.88rem] text-green-dark font-sans outline-none focus:border-green bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted font-semibold block mb-1">Horário</label>
            <select
              value={form.time_slot}
              onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))}
              className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[rgba(74,94,58,0.25)] text-[0.88rem] text-green-dark font-sans outline-none focus:border-green bg-white transition-colors"
            >
              <option value="">— selecione —</option>
              {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted font-semibold block mb-1">Motivo (opcional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="ex: feriado"
              className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[rgba(74,94,58,0.25)] text-[0.88rem] text-green-dark font-sans outline-none focus:border-green bg-white transition-colors placeholder:text-muted"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 bg-green text-cream rounded-full text-[0.85rem] font-medium border-none cursor-pointer font-sans hover:bg-green-dark disabled:opacity-60 transition-colors"
            >
              {adding ? 'Bloqueando...' : 'Bloquear slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Blocked list */}
      {loading ? (
        <p className="text-muted text-[0.9rem]">Carregando bloqueios...</p>
      ) : (
        <>
          <p className="text-[0.68rem] tracking-[0.18em] uppercase text-muted font-semibold mb-3">
            Slots bloqueados manualmente ({blocks.length})
          </p>
          {blocks.length === 0 ? (
            <p className="text-muted text-[0.88rem]">Nenhum slot bloqueado manualmente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {blocks.map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 px-4 bg-white rounded-[12px] border border-[rgba(74,94,58,0.08)]">
                  <div>
                    <span className="text-[0.88rem] text-green-dark font-medium mr-3">{fmtDateBR(b.date)}</span>
                    <span className="text-[0.82rem] text-muted">{b.time_slot}</span>
                    {b.reason && <span className="text-[0.75rem] text-muted ml-3 italic">{b.reason}</span>}
                  </div>
                  <button
                    onClick={() => handleUnblock(b.id)}
                    disabled={removing === b.id}
                    className="text-[0.78rem] text-[#c0392b] underline bg-transparent border-none cursor-pointer font-sans hover:opacity-70 disabled:opacity-40"
                  >
                    {removing === b.id ? '...' : 'Remover'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}


// ── Tab: Quiz ─────────────────────────────────────────────────────────────────

function TabQuiz() {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/quiz-responses')
      .then(({ data }) => setResponses(data))
      .catch(() => setError('Erro ao carregar respostas.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted text-[0.9rem]">Carregando respostas do quiz...</p>
  if (error) return <p className="text-[0.82rem] text-[#c0392b]">{error}</p>

  return (
    <div>
      <p className="text-[0.82rem] text-muted mb-5">{responses.length} resposta(s)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem] border-collapse">
          <thead>
            <tr className="border-b-2 border-[rgba(74,94,58,0.12)]">
              {['Nome','E-mail','WhatsApp','Turma','Nível','Estilo','Compromisso','Data'].map(h => (
                <th key={h} className="text-left py-2 px-3 text-muted font-semibold text-[0.65rem] tracking-[0.12em] uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map(r => (
              <tr key={r.id} className="border-b border-[rgba(74,94,58,0.07)] hover:bg-[rgba(74,94,58,0.03)] transition-colors">
                <td className="py-2.5 px-3 text-green-dark font-medium whitespace-nowrap">{r.name}</td>
                <td className="py-2.5 px-3 text-muted">{r.email || '—'}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">{r.phone || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{r.turma || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{r.level || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{r.style || '—'}</td>
                <td className="py-2.5 px-3 text-muted">{r.commitment || '—'}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {responses.length === 0 && (
          <p className="text-muted text-[0.88rem] mt-4">Nenhuma resposta ainda.</p>
        )}
      </div>
    </div>
  )
}


// ── Dashboard ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'students',    label: 'Alunos'         },
  { id: 'bookings',   label: 'Agendamentos'    },
  { id: 'slots',      label: 'Horários'        },
  { id: 'quiz',       label: 'Quiz'            },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('students')

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="px-6 md:px-10 py-4 bg-green-dark border-b border-[rgba(245,239,228,0.1)] flex items-center justify-between">
        <a href="/">
          <img src="/images/logo.jpeg" alt="NOMA" className="h-9 object-contain opacity-90" />
        </a>
        <div className="flex items-center gap-4">
          <span className="text-[0.78rem] text-[rgba(245,239,228,0.55)] hidden sm:block">
            Admin: {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="text-[0.8rem] text-cream border-[1.5px] border-[rgba(245,239,228,0.2)] px-4 py-[6px] rounded-full font-sans bg-transparent cursor-pointer hover:border-[rgba(245,239,228,0.6)] transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <p className="text-[0.68rem] tracking-[0.22em] uppercase text-gold font-semibold mb-1">NOMA English School</p>
          <h1 className="font-serif text-[2rem] font-semibold text-green-dark leading-[1.1]">
            Painel administrativo
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-[rgba(74,94,58,0.06)] rounded-full p-1 w-fit flex-wrap">
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
        {tab === 'students'  && <TabAlunos />}
        {tab === 'bookings'  && <TabAgendamentos />}
        {tab === 'slots'     && <TabHorarios />}
        {tab === 'quiz'      && <TabQuiz />}
      </main>
    </div>
  )
}
