import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import {
  HiOutlineChevronLeft,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlineCreditCard,
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi'

export default function AlunoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ficha') // ficha | timeline | creditos | avaliacoes

  const [studentData, setStudentData] = useState(null)
  const [plans, setPlans] = useState([])
  const [notes, setNotes] = useState([])
  const [assessments, setAssessments] = useState([])
  const [submissions, setSubmissions] = useState([])

  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Forms state
  const [personalForm, setPersonalForm] = useState({
    full_name: '',
    email: '',
    cpf: '',
    phone: '',
    is_active: true
  })

  const [profileForm, setProfileForm] = useState({
    plan_id: '',
    turma: '',
    level: '',
    style: '',
    method: '',
    contract_start: '',
    contract_end: ''
  })

  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [adjustingCredits, setAdjustingCredits] = useState(false)

  // Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [noteForm, setNoteForm] = useState({
    lesson_date: new Date().toISOString().split('T')[0],
    attendance: 'present',
    homework_status: 'done',
    content: '',
    next_lesson_plan: ''
  })
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    try {
      const [studentRes, plansRes, notesRes, assessmentsRes] = await Promise.all([
        api.get(`/admin/students/${id}`),
        api.get('/admin/plans'),
        api.get(`/admin/students/${id}/lesson-notes`),
        api.get('/admin/assessments')
      ])

      const std = studentRes.data
      setStudentData(std)
      setPlans(plansRes.data)
      setNotes(notesRes.data)
      setAssessments(assessmentsRes.data)

      // Initialize forms
      setPersonalForm({
        full_name: std.user.full_name || '',
        email: std.user.email || '',
        cpf: std.user.cpf || '',
        phone: std.user.phone || '',
        is_active: std.user.is_active ?? true
      })

      if (std.profile) {
        setProfileForm({
          plan_id: std.profile.plan_id || '',
          turma: std.profile.turma || '',
          level: std.profile.level || '',
          style: std.profile.style || '',
          method: std.profile.method || '',
          contract_start: std.profile.contract_start || '',
          contract_end: std.profile.contract_end || ''
        })
      }

      // Fetch submissions for all assessments
      const submissionsPromises = assessmentsRes.data.map(async (ass) => {
        try {
          const subRes = await api.get(`/admin/assessments/${ass.id}/submissions`)
          // Filter submissions for this specific student
          return subRes.data.filter(s => s.student_id === Number(id))
        } catch (e) {
          return []
        }
      })
      const subsResults = await Promise.all(submissionsPromises)
      setSubmissions(subsResults.flat())

    } catch (err) {
      showToast('Erro ao carregar dados do aluno', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleUpdatePersonal(e) {
    e.preventDefault()
    try {
      await api.patch(`/admin/students/${id}`, personalForm)
      showToast('Dados pessoais salvos!', 'success')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao salvar dados pessoais', 'error')
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    const payload = {
      plan_id: profileForm.plan_id ? parseInt(profileForm.plan_id, 10) : null,
      turma: profileForm.turma || null,
      level: profileForm.level || null,
      style: profileForm.style || null,
      method: profileForm.method || null,
      contract_start: profileForm.contract_start || null,
      contract_end: profileForm.contract_end || null
    }
    try {
      await api.post(`/admin/students/${id}/profile`, payload)
      showToast('Perfil acadêmico salvo!', 'success')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao salvar perfil acadêmico', 'error')
    }
  }

  async function handleAdjustCredits(e) {
    e.preventDefault()
    if (!creditAmount) return
    setAdjustingCredits(true)
    try {
      await api.post(`/admin/students/${id}/credits`, {
        amount: parseInt(creditAmount, 10),
        reason: creditReason || 'Ajuste manual admin'
      })
      showToast('Créditos ajustados com sucesso!', 'success')
      setCreditAmount('')
      setCreditReason('')
      fetchData()
    } catch (err) {
      showToast('Erro ao ajustar créditos', 'error')
    } finally {
      setAdjustingCredits(false)
    }
  }

  async function handleSaveNote(e) {
    e.preventDefault()
    setSavingNote(true)
    try {
      if (editingNote) {
        await api.patch(`/lesson-notes/${editingNote.id}`, noteForm)
        showToast('Anotação atualizada!', 'success')
      } else {
        await api.post(`/admin/students/${id}/lesson-notes`, noteForm)
        showToast('Anotação registrada!', 'success')
      }
      setShowNoteModal(false)
      setEditingNote(null)
      // reset form
      setNoteForm({
        lesson_date: new Date().toISOString().split('T')[0],
        attendance: 'present',
        homework_status: 'done',
        content: '',
        next_lesson_plan: ''
      })
      // reload notes list
      const notesRes = await api.get(`/admin/students/${id}/lesson-notes`)
      setNotes(notesRes.data)
    } catch (err) {
      showToast('Erro ao salvar anotação', 'error')
    } finally {
      setSavingNote(false)
    }
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm('Tem certeza que deseja excluir esta anotação?')) return
    try {
      await api.delete(`/lesson-notes/${noteId}`)
      showToast('Anotação excluída', 'success')
      setNotes(notes.filter(n => n.id !== noteId))
    } catch (err) {
      showToast('Erro ao excluir anotação', 'error')
    }
  }

  function openCreateNote() {
    setEditingNote(null)
    setNoteForm({
      lesson_date: new Date().toISOString().split('T')[0],
      attendance: 'present',
      homework_status: 'done',
      content: '',
      next_lesson_plan: ''
    })
    setShowNoteModal(true)
  }

  function openEditNote(note) {
    setEditingNote(note)
    setNoteForm({
      lesson_date: note.lesson_date,
      attendance: note.attendance || 'present',
      homework_status: note.homework_status || 'done',
      content: note.content || '',
      next_lesson_plan: note.next_lesson_plan || ''
    })
    setShowNoteModal(true)
  }

  if (loading) return <div className="loading-container"><div className="loader-spinner" /></div>
  if (!studentData) return <div className="empty-state"><p>Aluno não encontrado</p></div>

  const { user, profile: studentProfile, total_lessons, attended_lessons } = studentData

  return (
    <div className="aluno-detalhe-page">
      <div className="aluno-detalhe-back">
        <button onClick={() => navigate('/admin/alunos')} className="btn-back">
          <HiOutlineChevronLeft /> Voltar para Alunos
        </button>
      </div>

      <div className="ficheiro-container">
        {/* Ficheiro Header */}
        <div className="ficheiro-header">
          <div className="student-main-info">
            <div className="student-avatar-big">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h2>{user.full_name}</h2>
              <span className={`status-badge-inline ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? 'Matrícula Ativa' : 'Matrícula Suspensa'}
              </span>
            </div>
          </div>

          <div className="ficheiro-tabs">
            <button className={`ficheiro-tab ${activeTab === 'ficha' ? 'active' : ''}`}
              onClick={() => setActiveTab('ficha')}>
              <HiOutlineUser /> Ficha Cadastral
            </button>
            <button className={`ficheiro-tab ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}>
              <HiOutlineBookOpen /> Diário de Bordo
            </button>
            <button className={`ficheiro-tab ${activeTab === 'creditos' ? 'active' : ''}`}
              onClick={() => setActiveTab('creditos')}>
              <HiOutlineCreditCard /> Créditos
            </button>
            <button className={`ficheiro-tab ${activeTab === 'avaliacoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('avaliacoes')}>
              <HiOutlineClipboardList /> Avaliações ({submissions.length})
            </button>
          </div>
        </div>

        {/* Ficheiro Sheet (styled like folder paper) */}
        <div className="ficheiro-sheet">
          {/* TAB 1: FICHA CADASTRAL */}
          {activeTab === 'ficha' && (
            <div className="sheet-grid">
              <div className="sheet-column">
                <h3>Dados Pessoais</h3>
                <form onSubmit={handleUpdatePersonal} className="sheet-form">
                  <div className="form-field">
                    <label>Nome Completo</label>
                    <input type="text" value={personalForm.full_name}
                      onChange={e => setPersonalForm(f => ({ ...f, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-field">
                    <label>E-mail</label>
                    <input type="email" value={personalForm.email}
                      onChange={e => setPersonalForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>CPF</label>
                      <input type="text" value={personalForm.cpf}
                        onChange={e => setPersonalForm(f => ({ ...f, cpf: e.target.value }))} />
                    </div>
                    <div className="form-field">
                      <label>Telefone</label>
                      <input type="text" value={personalForm.phone}
                        onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-field checkbox-field">
                    <input type="checkbox" id="is_active" checked={personalForm.is_active}
                      onChange={e => setPersonalForm(f => ({ ...f, is_active: e.target.checked }))} />
                    <label htmlFor="is_active">Matrícula Ativa (Permite agendamentos)</label>
                  </div>
                  <button type="submit" className="btn-save-sheet">Salvar Dados Cadastrais</button>
                </form>
              </div>

              <div className="sheet-column">
                <h3>Perfil Pedagógico & Contrato</h3>
                <form onSubmit={handleUpdateProfile} className="sheet-form">
                  <div className="form-field">
                    <label>Plano</label>
                    <select value={profileForm.plan_id}
                      onChange={e => setProfileForm(f => ({ ...f, plan_id: e.target.value }))}>
                      <option value="">Sem plano</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.credits_total} crds)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Turma (Tiers NOMA)</label>
                      <select value={profileForm.turma}
                        onChange={e => setProfileForm(f => ({ ...f, turma: e.target.value }))}>
                        <option value="">Nenhuma</option>
                        <option value="sprouts">Sprouts (Iniciante)</option>
                        <option value="buds">Buds (Intermediário I)</option>
                        <option value="bloom">Bloom (Intermediário II)</option>
                        <option value="bee">Bee (Avançado)</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Nível</label>
                      <select value={profileForm.level}
                        onChange={e => setProfileForm(f => ({ ...f, level: e.target.value }))}>
                        <option value="">Não definido</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Estilo de Aula</label>
                      <select value={profileForm.style}
                        onChange={e => setProfileForm(f => ({ ...f, style: e.target.value }))}>
                        <option value="">Não definido</option>
                        <option value="flow">Flow</option>
                        <option value="roots">Roots</option>
                        <option value="bee">Bee</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Método de Estudo</label>
                      <select value={profileForm.method}
                        onChange={e => setProfileForm(f => ({ ...f, method: e.target.value }))}>
                        <option value="">Não definido</option>
                        <option value="quest">Quest</option>
                        <option value="level">Level</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Início do Contrato</label>
                      <input type="date" value={profileForm.contract_start}
                        onChange={e => setProfileForm(f => ({ ...f, contract_start: e.target.value }))} />
                    </div>
                    <div className="form-field">
                      <label>Fim do Contrato</label>
                      <input type="date" value={profileForm.contract_end}
                        onChange={e => setProfileForm(f => ({ ...f, contract_end: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="btn-save-sheet">Salvar Perfil Acadêmico</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: DIÁRIO DE BORDO */}
          {activeTab === 'timeline' && (
            <div className="timeline-sheet-content">
              <div className="sheet-section-header">
                <h3>Anotações Pedagógicas (Histórico de Aulas)</h3>
                <button className="btn-new-note" onClick={openCreateNote}>
                  <HiOutlinePlus /> Nova Anotação
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="empty-notes">
                  <p>Nenhuma anotação registrada para este aluno.</p>
                  <button className="btn-secondary-link" onClick={openCreateNote}>Adicionar primeira anotação</button>
                </div>
              ) : (
                <div className="notes-timeline">
                  {notes.map(note => (
                    <div key={note.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-card">
                        <div className="card-top">
                          <span className="note-date">
                            {new Date(note.lesson_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                          <span className="note-author">por {note.author_name || 'Admin'}</span>
                          <div className="note-badges">
                            <span className={`badge-attendance ${note.attendance}`}>
                              {note.attendance === 'present' ? 'Presente' : note.attendance === 'absent' ? 'Ausente' : 'Atraso'}
                            </span>
                            {note.homework_status && (
                              <span className={`badge-homework ${note.homework_status}`}>
                                HW: {note.homework_status === 'done' ? 'Feito' : note.homework_status === 'partial' ? 'Parcial' : note.homework_status === 'not_done' ? 'Não Feito' : 'Nenhum'}
                              </span>
                            )}
                          </div>
                          <div className="note-actions">
                            <button onClick={() => openEditNote(note)} title="Editar"><HiOutlinePencil /></button>
                            <button onClick={() => handleDeleteNote(note.id)} title="Excluir"><HiOutlineTrash /></button>
                          </div>
                        </div>
                        <div className="card-body">
                          {note.content && (
                            <div className="note-section">
                              <strong>Conteúdo da Aula:</strong>
                              <p>{note.content}</p>
                            </div>
                          )}
                          {note.next_lesson_plan && (
                            <div className="note-section next-steps">
                              <strong>Próximos Passos / Próxima Aula:</strong>
                              <p>{note.next_lesson_plan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRÉDITOS */}
          {activeTab === 'creditos' && (
            <div className="credits-sheet-content">
              <div className="credits-summary-cards">
                <div className="credit-summary-card">
                  <span className="credit-card-title">Créditos Restantes</span>
                  <span className="credit-card-val">{studentProfile?.credits_remaining ?? 0}</span>
                  <span className="credit-card-sub">Usáveis para agendamento</span>
                </div>
                <div className="credit-summary-card">
                  <span className="credit-card-title">Créditos Consumidos</span>
                  <span className="credit-card-val">{studentProfile?.credits_used ?? 0}</span>
                  <span className="credit-card-sub">Aulas concluídas/agendadas</span>
                </div>
                <div className="credit-summary-card">
                  <span className="credit-card-title">Aulas Realizadas</span>
                  <span className="credit-card-val">{attended_lessons}</span>
                  <span className="credit-card-sub">Frequência registrada como Presente</span>
                </div>
              </div>

              <div className="credits-adjust-section">
                <h3>Ajustar Créditos Manualmente</h3>
                <p className="section-desc">Insira um número positivo para adicionar créditos ou negativo para retirar créditos do saldo do aluno.</p>
                <form onSubmit={handleAdjustCredits} className="credits-adjust-form">
                  <div className="form-field">
                    <label>Quantidade de Créditos</label>
                    <input type="number" value={creditAmount}
                      onChange={e => setCreditAmount(e.target.value)}
                      placeholder="Ex: 4 ou -2" required />
                  </div>
                  <div className="form-field">
                    <label>Motivo do Ajuste</label>
                    <input type="text" value={creditReason}
                      onChange={e => setCreditReason(e.target.value)}
                      placeholder="Ex: Aula bônus por indicação" />
                  </div>
                  <button type="submit" className="btn-adjust" disabled={adjustingCredits}>
                    {adjustingCredits ? 'Ajustando...' : 'Aplicar Ajuste'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: AVALIAÇÕES */}
          {activeTab === 'avaliacoes' && (
            <div className="assessments-sheet-content">
              <h3>Histórico de Provas & Avaliações</h3>
              <p className="section-desc">Respostas enviadas pelo aluno para as avaliações cadastradas.</p>

              {submissions.length === 0 ? (
                <div className="empty-assessments">
                  <p>O aluno ainda não enviou respostas para nenhuma avaliação.</p>
                </div>
              ) : (
                <div className="submissions-table">
                  <div className="table-header">
                    <span>Avaliação</span>
                    <span>Data de Envio</span>
                    <span>Pontuação</span>
                    <span>Aproveitamento</span>
                  </div>
                  {submissions.map(sub => {
                    const pct = sub.max_score > 0 ? Math.round((sub.score / sub.max_score) * 100) : 0
                    return (
                      <div key={sub.id} className="table-row">
                        <span className="sub-title">{sub.assessment_title || 'Avaliação'}</span>
                        <span className="sub-date">
                          {new Date(sub.submitted_at).toLocaleDateString('pt-BR')} às {new Date(sub.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="sub-score">
                          <strong>{sub.score}</strong> / {sub.max_score}
                        </span>
                        <span className="sub-pct">
                          <span className={`pct-tag ${pct >= 70 ? 'high' : pct >= 50 ? 'medium' : 'low'}`}>
                            {pct}%
                          </span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{editingNote ? 'Editar Anotação' : 'Nova Anotação de Aula'}</h3>
            <form onSubmit={handleSaveNote} className="note-modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Data da Aula</label>
                  <input type="date" value={noteForm.lesson_date}
                    onChange={e => setNoteForm(n => ({ ...n, lesson_date: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label>Presença</label>
                  <select value={noteForm.attendance}
                    onChange={e => setNoteForm(n => ({ ...n, attendance: e.target.value }))}>
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                    <option value="late">Atrasou</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Tarefa (Homework)</label>
                  <select value={noteForm.homework_status}
                    onChange={e => setNoteForm(n => ({ ...n, homework_status: e.target.value }))}>
                    <option value="done">Feito</option>
                    <option value="partial">Parcial</option>
                    <option value="not_done">Não Feito</option>
                    <option value="none">Nenhum</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Conteúdo Trabalhado / Observações</label>
                <textarea rows="4" value={noteForm.content}
                  onChange={e => setNoteForm(n => ({ ...n, content: e.target.value }))}
                  placeholder="Descreva o que foi estudado na aula, vocabulário novo, etc." required />
              </div>

              <div className="form-field">
                <label>Próximos Passos / Lição de Casa</label>
                <textarea rows="3" value={noteForm.next_lesson_plan}
                  onChange={e => setNoteForm(n => ({ ...n, next_lesson_plan: e.target.value }))}
                  placeholder="Tarefa recomendada para a próxima aula ou tópicos a revisar." />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowNoteModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={savingNote}>
                  {savingNote ? 'Salvando...' : 'Salvar Anotação'}
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
