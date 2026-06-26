import { useState, useEffect } from 'react'
import api from '../../api/client'
import { HiOutlineClipboardCheck, HiOutlineClipboardList, HiOutlineClock } from 'react-icons/hi'

export default function Avaliacoes() {
  const [assessments, setAssessments] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [taking, setTaking] = useState(null) // assessment being taken
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('pending')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [aRes, rRes] = await Promise.all([
        api.get('/assessments/mine'),
        api.get('/assessments/mine/results'),
      ])
      setAssessments(aRes.data)
      setResults(rRes.data)
    } catch { }
    setLoading(false)
  }

  async function submitAssessment() {
    if (!taking) return
    setSubmitting(true)
    try {
      await api.post(`/assessments/${taking.id}/submit`, { answers })
      showToast('Avaliação enviada com sucesso!', 'success')
      setTaking(null)
      setAnswers({})
      loadData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao enviar', 'error')
    }
    setSubmitting(false)
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const pendingAssessments = assessments.filter(a => !a.already_submitted)
  const completedResults = results

  if (loading) return <div className="loading-container"><div className="loader-spinner" /></div>

  // Taking an assessment
  if (taking) {
    return (
      <div className="page-avaliacoes">
        <div className="assessment-taking">
          <div className="assessment-taking-header">
            <h2>{taking.title}</h2>
            {taking.description && <p>{taking.description}</p>}
            <span className="assessment-q-count">{taking.questions.length} questões</span>
          </div>

          <div className="assessment-questions">
            {taking.questions.map((q, i) => (
              <div key={q.id} className="question-card">
                <div className="question-number">Questão {i + 1}</div>
                <p className="question-text">{q.question}</p>

                {q.type === 'multiple_choice' && q.options && (
                  <div className="question-options">
                    {q.options.map((opt, j) => (
                      <button key={j}
                        className={`question-opt ${answers[q.id] === opt ? 'selected' : ''}`}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      >
                        <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="question-options">
                    {['True', 'False'].map(opt => (
                      <button key={opt}
                        className={`question-opt ${answers[q.id] === opt ? 'selected' : ''}`}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      >
                        {opt === 'True' ? 'Verdadeiro' : 'Falso'}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <input type="text" className="question-input"
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Sua resposta..."
                  />
                )}
              </div>
            ))}
          </div>

          <div className="assessment-actions">
            <button className="btn-cancel" onClick={() => { setTaking(null); setAnswers({}) }}>
              ← Voltar
            </button>
            <button className="btn-submit" onClick={submitAssessment} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar respostas ✓'}
            </button>
          </div>
        </div>
        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </div>
    )
  }

  return (
    <div className="page-avaliacoes">
      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          <HiOutlineClipboardList /> Pendentes ({pendingAssessments.length})
        </button>
        <button className={`tab ${tab === 'done' ? 'active' : ''}`} onClick={() => setTab('done')}>
          <HiOutlineClipboardCheck /> Concluídas ({completedResults.length})
        </button>
      </div>

      {tab === 'pending' && (
        <div className="assessment-list">
          {pendingAssessments.length === 0 ? (
            <div className="empty-state">
              <HiOutlineClipboardCheck className="empty-icon" />
              <p>Nenhuma avaliação pendente!</p>
            </div>
          ) : (
            pendingAssessments.map(a => (
              <div key={a.id} className="assessment-card">
                <div className="assessment-card-info">
                  <h3>{a.title}</h3>
                  {a.description && <p>{a.description}</p>}
                  <span className="assessment-meta">
                    <HiOutlineClock /> {a.questions.length} questões
                    {a.due_date && ` • Até ${new Date(a.due_date).toLocaleDateString('pt-BR')}`}
                  </span>
                </div>
                <button className="btn-start" onClick={() => setTaking(a)}>
                  Iniciar →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'done' && (
        <div className="results-list">
          {completedResults.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma avaliação concluída</p>
            </div>
          ) : (
            completedResults.map(r => (
              <div key={r.id} className="result-card-item">
                <div className="result-card-info">
                  <h3>{r.assessment_title}</h3>
                  <span className="result-date">
                    {new Date(r.submitted_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="result-score">
                  {r.score != null && r.max_score != null ? (
                    <>
                      <span className="score-number">{Number(r.score).toFixed(0)}</span>
                      <span className="score-max">/ {Number(r.max_score).toFixed(0)}</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${(r.score / r.max_score) * 100}%` }} />
                      </div>
                    </>
                  ) : (
                    <span className="score-pending">Aguardando correção</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
