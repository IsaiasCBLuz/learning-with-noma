import { useState, useEffect } from 'react'
import api from '../../api/client'
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineMinusCircle
} from 'react-icons/hi'

export default function CriarAvaliacao() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Show builder or list
  const [showBuilder, setShowBuilder] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [targetLevel, setTargetLevel] = useState('')
  const [targetTurma, setTargetTurma] = useState('')
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)

  // Preview Modal
  const [previewItem, setPreviewItem] = useState(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  async function fetchAssessments() {
    setLoading(true)
    try {
      const res = await api.get('/admin/assessments')
      setAssessments(res.data)
    } catch (err) {
      showToast('Erro ao carregar avaliações', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function addQuestion() {
    const newQ = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'multiple_choice',
      question: '',
      options: ['Opção 1', 'Opção 2'],
      correct_answer: 'Opção 1',
      points: 10
    }
    setQuestions([...questions, newQ])
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestionField(index, field, value) {
    const updated = [...questions]
    updated[index][field] = value
    
    // Adjust options and correct answer if type changes
    if (field === 'type') {
      if (value === 'true_false') {
        updated[index].options = ['True', 'False']
        updated[index].correct_answer = 'True'
      } else if (value === 'short_answer') {
        updated[index].options = null
        updated[index].correct_answer = ''
      } else if (value === 'multiple_choice') {
        updated[index].options = ['Opção 1', 'Opção 2']
        updated[index].correct_answer = 'Opção 1'
      }
    }
    setQuestions(updated)
  }

  function addOption(qIndex) {
    const updated = [...questions]
    const optCount = updated[qIndex].options.length
    updated[qIndex].options.push(`Opção ${optCount + 1}`)
    setQuestions(updated)
  }

  function removeOption(qIndex, optIndex) {
    const updated = [...questions]
    const opts = updated[qIndex].options.filter((_, i) => i !== optIndex)
    updated[qIndex].options = opts
    
    // If the removed option was the correct answer, reset it to the first option
    if (updated[qIndex].correct_answer === updated[qIndex].options[optIndex]) {
      updated[qIndex].correct_answer = opts[0] || ''
    }
    setQuestions(updated)
  }

  function updateOptionText(qIndex, optIndex, text) {
    const updated = [...questions]
    const oldVal = updated[qIndex].options[optIndex]
    updated[qIndex].options[optIndex] = text
    
    // If correct answer was this option, update it
    if (updated[qIndex].correct_answer === oldVal) {
      updated[qIndex].correct_answer = text
    }
    setQuestions(updated)
  }

  async function handleCreateAssessment(e) {
    e.preventDefault()
    if (questions.length === 0) {
      showToast('Adicione pelo menos uma pergunta!', 'error')
      return
    }

    setSaving(true)
    const payload = {
      title,
      description: description || null,
      due_date: dueDate || null,
      target_level: targetLevel || null,
      target_turma: targetTurma || null,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: parseInt(q.points, 10)
      }))
    }

    try {
      await api.post('/admin/assessments', payload)
      showToast('Avaliação criada com sucesso!', 'success')
      // Reset form
      setTitle('')
      setDescription('')
      setDueDate('')
      setTargetLevel('')
      setTargetTurma('')
      setQuestions([])
      setShowBuilder(false)
      fetchAssessments()
    } catch (err) {
      showToast('Erro ao salvar avaliação', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(id) {
    try {
      const res = await api.patch(`/admin/assessments/${id}/toggle`)
      showToast(`Avaliação ${res.data.is_active ? 'ativada' : 'desativada'}`, 'success')
      setAssessments(assessments.map(a => a.id === id ? { ...a, is_active: res.data.is_active } : a))
    } catch (err) {
      showToast('Erro ao alterar status', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir esta avaliação? Todas as respostas dos alunos também serão perdidas!')) return
    try {
      await api.delete(`/admin/assessments/${id}`)
      showToast('Avaliação excluída', 'success')
      setAssessments(assessments.filter(a => a.id !== id))
    } catch (err) {
      showToast('Erro ao excluir avaliação', 'error')
    }
  }

  if (loading && assessments.length === 0) {
    return <div className="loading-container"><div className="loader-spinner" /></div>
  }

  return (
    <div className="criar-avaliacao-page">
      <div className="page-header">
        <h2>Banco de Avaliações</h2>
        {!showBuilder ? (
          <button className="btn-action" onClick={() => setShowBuilder(true)}>
            <HiOutlinePlus /> Criar Nova Avaliação
          </button>
        ) : (
          <button className="btn-cancel-action" onClick={() => setShowBuilder(false)}>
            Voltar para Lista
          </button>
        )}
      </div>

      {!showBuilder ? (
        /* LIST VIEW */
        <div className="assessments-list-section">
          {assessments.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma avaliação cadastrada.</p>
              <button className="btn-primary" onClick={() => setShowBuilder(true)}>Criar Primeira Avaliação</button>
            </div>
          ) : (
            <div className="assessments-grid">
              {assessments.map(ass => (
                <div key={ass.id} className="assessment-card-admin">
                  <div className="card-top">
                    <h4>{ass.title}</h4>
                    <span className={`status-badge-inline ${ass.is_active ? 'active' : 'inactive'}`}>
                      {ass.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  {ass.description && <p className="card-desc">{ass.description}</p>}
                  
                  <div className="card-meta">
                    {ass.target_level && <span>Nível: <strong className="capitalize">{ass.target_level}</strong></span>}
                    {ass.target_turma && <span>Turma: <strong className="capitalize">{ass.target_turma}</strong></span>}
                    {ass.due_date && <span>Vence em: <strong>{new Date(ass.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></span>}
                    <span>Perguntas: <strong>{ass.questions_json?.length ?? 0}</strong></span>
                    <span>Respostas: <strong>{ass.submissions_count ?? 0}</strong></span>
                  </div>

                  <div className="card-actions">
                    <button className="btn-card-toggle" onClick={() => handleToggleActive(ass.id)} title={ass.is_active ? 'Desativar' : 'Ativar'}>
                      {ass.is_active ? <HiOutlineCheckCircle className="toggle-on" /> : <HiOutlineMinusCircle className="toggle-off" />}
                      <span>{ass.is_active ? 'Ativa' : 'Inativa'}</span>
                    </button>
                    <div className="card-right-btns">
                      <button className="btn-card-preview" onClick={() => setPreviewItem(ass)} title="Visualizar Prova">
                        <HiOutlineEye /> Visualizar
                      </button>
                      <button className="btn-card-delete" onClick={() => handleDelete(ass.id)} title="Excluir">
                        <HiOutlineTrash /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* BUILDER VIEW (Google Forms-like) */
        <div className="assessment-builder-section">
          <form onSubmit={handleCreateAssessment} className="builder-form">
            {/* Header info */}
            <div className="builder-card main-info-card">
              <div className="form-field">
                <input type="text" className="builder-title-input" value={title}
                  onChange={e => setTitle(e.target.value)} placeholder="Título da Avaliação *" required />
              </div>
              <div className="form-field">
                <textarea className="builder-desc-input" value={description}
                  onChange={e => setDescription(e.target.value)} placeholder="Descrição ou instruções da avaliação (opcional)" rows="2" />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Data Limite (Opcional)</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Nível Alvo (Filtro)</label>
                  <select value={targetLevel} onChange={e => setTargetLevel(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Turma Alvo (Filtro)</label>
                  <select value={targetTurma} onChange={e => setTargetTurma(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="sprouts">Sprouts</option>
                    <option value="buds">Buds</option>
                    <option value="bloom">Bloom</option>
                    <option value="bee">Bee</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions list */}
            {questions.map((q, qIndex) => (
              <div key={q.id} className="builder-card question-card-builder">
                <div className="question-header-row">
                  <span className="q-num">Pergunta {qIndex + 1}</span>
                  <div className="q-controls">
                    <select value={q.type} onChange={e => updateQuestionField(qIndex, 'type', e.target.value)} className="q-type-select">
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="true_false">Verdadeiro ou Falso</option>
                      <option value="short_answer">Resposta Curta</option>
                    </select>
                    <div className="points-input-wrap">
                      <input type="number" min="0" max="100" value={q.points}
                        onChange={e => updateQuestionField(qIndex, 'points', e.target.value)} />
                      <span>pts</span>
                    </div>
                    <button type="button" className="btn-del-q" onClick={() => removeQuestion(qIndex)} title="Remover Pergunta">
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <input type="text" className="q-text-input" value={q.question}
                    onChange={e => updateQuestionField(qIndex, 'question', e.target.value)}
                    placeholder="Escreva o enunciado da pergunta *" required />
                </div>

                {/* Multiple Choice Options */}
                {q.type === 'multiple_choice' && (
                  <div className="options-builder-area">
                    <label className="sub-label">Alternativas (Selecione a correta):</label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="opt-row-builder">
                        <input type="radio" name={`correct_${q.id}`} checked={q.correct_answer === opt}
                          onChange={() => updateQuestionField(qIndex, 'correct_answer', opt)} />
                        <input type="text" className="opt-text-input" value={opt}
                          onChange={e => updateOptionText(qIndex, optIndex, e.target.value)} required />
                        {q.options.length > 2 && (
                          <button type="button" className="btn-del-opt" onClick={() => removeOption(qIndex, optIndex)}>
                            <HiOutlineX />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add-opt" onClick={() => addOption(qIndex)}>
                      <HiOutlinePlus /> Adicionar Alternativa
                    </button>
                  </div>
                )}

                {/* True/False Options */}
                {q.type === 'true_false' && (
                  <div className="options-builder-area">
                    <label className="sub-label">Selecione a resposta correta:</label>
                    <div className="tf-row-builder">
                      <label className="radio-label">
                        <input type="radio" name={`correct_${q.id}`} checked={q.correct_answer === 'True'}
                          onChange={() => updateQuestionField(qIndex, 'correct_answer', 'True')} />
                        Verdadeiro (True)
                      </label>
                      <label className="radio-label">
                        <input type="radio" name={`correct_${q.id}`} checked={q.correct_answer === 'False'}
                          onChange={() => updateQuestionField(qIndex, 'correct_answer', 'False')} />
                        Falso (False)
                      </label>
                    </div>
                  </div>
                )}

                {/* Short Answer Correct Text */}
                {q.type === 'short_answer' && (
                  <div className="options-builder-area">
                    <label className="sub-label">Gabarito de resposta (Auto-correção exata):</label>
                    <input type="text" className="opt-text-input text-correct-short" value={q.correct_answer}
                      onChange={e => updateQuestionField(qIndex, 'correct_answer', e.target.value)}
                      placeholder="Resposta correta esperada *" required />
                  </div>
                )}
              </div>
            ))}

            {/* Bottom Actions */}
            <div className="builder-actions-bottom">
              <button type="button" className="btn-add-question" onClick={addQuestion}>
                <HiOutlinePlus /> Adicionar Pergunta
              </button>
              <div className="right-submit-btns">
                <button type="button" className="btn-cancel-form" onClick={() => setShowBuilder(false)}>Cancelar</button>
                <button type="submit" className="btn-save-assessment" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar e Publicar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-card preview-assessment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-preview">
              <h3>Visualização da Prova</h3>
              <button className="btn-close-modal" onClick={() => setPreviewItem(null)}>
                <HiOutlineX />
              </button>
            </div>
            
            <div className="preview-body">
              <h2 className="preview-title">{previewItem.title}</h2>
              {previewItem.description && <p className="preview-desc">{previewItem.description}</p>}
              
              <div className="preview-questions">
                {(previewItem.questions_json || []).map((q, idx) => (
                  <div key={idx} className="preview-question-card">
                    <div className="pq-header">
                      <span className="pq-num">Questão {idx + 1} ({q.points || 10} pontos)</span>
                      <span className="pq-type-badge capitalize">{q.type.replace('_', ' ')}</span>
                    </div>
                    <p className="pq-text">{q.question}</p>
                    
                    {/* Display options if MC/TF */}
                    {q.options && q.options.length > 0 && (
                      <div className="pq-options">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`pq-option ${q.correct_answer === opt ? 'is-correct' : ''}`}>
                            <span className="opt-dot" />
                            <span>{opt}</span>
                            {q.correct_answer === opt && <span className="correct-tag">Correta</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Short Answer Gabarito */}
                    {q.type === 'short_answer' && (
                      <div className="pq-short-answer-correct">
                        <span>Gabarito: <strong>{q.correct_answer}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
