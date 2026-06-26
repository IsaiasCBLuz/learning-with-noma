import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { HiOutlineSearch, HiOutlinePlus, HiOutlineUserCircle } from 'react-icons/hi'

export default function Alunos() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', cpf: '', phone: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/admin/students')
      .then(r => setStudents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function createStudent(e) {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/admin/students', form)
      showToast('Aluno criado! E-mail de convite enviado.', 'success')
      setShowModal(false)
      setForm({ full_name: '', email: '', cpf: '', phone: '' })
      const res = await api.get('/admin/students')
      setStudents(res.data)
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao criar aluno', 'error')
    }
    setCreating(false)
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.cpf && s.cpf.includes(search)) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="loading-container"><div className="loader-spinner" /></div>

  return (
    <div className="page-alunos">
      <div className="page-header">
        <h2>Alunos</h2>
        <button className="btn-action" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Novo Aluno
        </button>
      </div>

      <div className="search-bar">
        <HiOutlineSearch />
        <input type="text" placeholder="Buscar por nome, CPF ou e-mail..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="students-table">
        <div className="table-header">
          <span className="col-name">Nome</span>
          <span className="col-email">E-mail</span>
          <span className="col-status">Status</span>
          <span className="col-date">Cadastro</span>
        </div>
        {filtered.length === 0 ? (
          <div className="table-empty">
            <p>Nenhum aluno encontrado</p>
          </div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="table-row" onClick={() => navigate(`/admin/alunos/${s.id}`)}>
              <span className="col-name">
                <HiOutlineUserCircle className="row-avatar" />
                <span>{s.full_name}</span>
              </span>
              <span className="col-email">{s.email}</span>
              <span className="col-status">
                <span className={`status-dot ${s.is_active ? 'active' : 'inactive'}`} />
                {s.is_active ? 'Ativo' : 'Inativo'}
              </span>
              <span className="col-date">
                {new Date(s.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Cadastrar Novo Aluno</h3>
            <p className="modal-desc">Uma senha temporária será gerada e enviada por e-mail.</p>
            <form onSubmit={createStudent}>
              <div className="form-field">
                <label>Nome completo *</label>
                <input type="text" value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nome Sobrenome" required />
              </div>
              <div className="form-field">
                <label>E-mail *</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="aluno@email.com" required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>CPF</label>
                  <input type="text" value={form.cpf}
                    onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))}
                    placeholder="000.000.000-00" />
                </div>
                <div className="form-field">
                  <label>Telefone</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={creating}>
                  {creating ? 'Criando...' : 'Cadastrar e enviar e-mail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
