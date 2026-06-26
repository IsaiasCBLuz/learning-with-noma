import { useState, useEffect } from 'react'
import api from '../../api/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineExclamationCircle,
  HiOutlineDownload,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineTrash
} from 'react-icons/hi'

export default function Financeiro() {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [payments, setPayments] = useState([])
  const [chartData, setChartData] = useState([])
  const [students, setStudents] = useState([])
  const [plans, setPlans] = useState([])

  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState(null)

  // Modals state
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [creatingBilling, setCreatingBilling] = useState(false)
  const [billingForm, setBillingForm] = useState({
    student_id: '',
    plan_id: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_method: 'pix',
    reference_period_start: '',
    reference_period_end: '',
    notes: ''
  })

  useEffect(() => {
    fetchFinancialData()
  }, [filterStatus])

  async function fetchFinancialData() {
    setLoading(true)
    try {
      const year = new Date().getFullYear()
      const [statsRes, paymentsRes, chartRes, studentsRes, plansRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get(`/admin/payments${filterStatus ? `?status=${filterStatus}` : ''}`),
        api.get(`/admin/revenue/monthly?year=${year}`),
        api.get('/admin/students'),
        api.get('/admin/plans')
      ])

      setDashboardStats(statsRes.data)
      setPayments(paymentsRes.data)
      setStudents(studentsRes.data)
      setPlans(plansRes.data)

      // Map month numbers to labels
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      const formattedChart = chartRes.data.map(item => ({
        name: monthNames[item.month - 1],
        total: item.total
      }))
      setChartData(formattedChart)

    } catch (err) {
      showToast('Erro ao carregar dados financeiros', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleConfirmPayment(paymentId) {
    if (!window.confirm('Confirmar recebimento deste pagamento?')) return
    try {
      await api.patch(`/admin/payments/${paymentId}`, { status: 'paid' })
      showToast('Pagamento confirmado com sucesso!', 'success')
      fetchFinancialData()
    } catch (err) {
      showToast('Erro ao confirmar pagamento', 'error')
    }
  }

  async function handleDeletePayment(paymentId) {
    if (!window.confirm('Excluir esta cobrança permanentemente?')) return
    try {
      await api.delete(`/admin/payments/${paymentId}`)
      showToast('Cobrança excluída', 'success')
      fetchFinancialData()
    } catch (err) {
      showToast('Erro ao excluir cobrança', 'error')
    }
  }

  async function handleCreateBilling(e) {
    e.preventDefault()
    if (!billingForm.student_id || !billingForm.amount) {
      showToast('Preencha os campos obrigatórios!', 'error')
      return
    }

    setCreatingBilling(true)
    const payload = {
      student_id: parseInt(billingForm.student_id, 10),
      plan_id: billingForm.plan_id ? parseInt(billingForm.plan_id, 10) : null,
      amount: parseFloat(billingForm.amount),
      due_date: billingForm.due_date,
      payment_method: billingForm.payment_method || 'pix',
      reference_period_start: billingForm.reference_period_start || null,
      reference_period_end: billingForm.reference_period_end || null,
      notes: billingForm.notes || null
    }

    try {
      await api.post('/admin/payments', payload)
      showToast('Cobrança criada com sucesso!', 'success')
      setShowBillingModal(false)
      // reset form
      setBillingForm({
        student_id: '',
        plan_id: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        payment_method: 'pix',
        reference_period_start: '',
        reference_period_end: '',
        notes: ''
      })
      fetchFinancialData()
    } catch (err) {
      showToast('Erro ao criar cobrança', 'error')
    } finally {
      setCreatingBilling(false)
    }
  }

  function handleExportCSV() {
    window.open(`${api.defaults.baseURL}/admin/export/payments.csv`, '_blank')
  }

  // Handle plan selection in billing form to auto-fill amount
  function handleSelectPlan(planId) {
    const selectedPlan = plans.find(p => p.id === parseInt(planId, 10))
    setBillingForm(f => ({
      ...f,
      plan_id: planId,
      amount: selectedPlan && selectedPlan.price ? selectedPlan.price.toString() : ''
    }))
  }

  if (loading && !dashboardStats) {
    return <div className="loading-container"><div className="loader-spinner" /></div>
  }

  const revenueDifference = (dashboardStats?.revenue_month ?? 0) - (dashboardStats?.revenue_prev_month ?? 0)

  return (
    <div className="financeiro-page">
      <div className="page-header">
        <h2>Gestão Financeira</h2>
        <div className="header-actions-btn-group">
          <button className="btn-action btn-export" onClick={handleExportCSV}>
            <HiOutlineDownload /> Exportar CSV
          </button>
          <button className="btn-action" onClick={() => setShowBillingModal(true)}>
            <HiOutlinePlus /> Nova Cobrança
          </button>
        </div>
      </div>

      {/* Big Numbers Row */}
      <div className="bignumbers-grid">
        <div className="bignumber-card">
          <div className="card-icon"><HiOutlineCurrencyDollar /></div>
          <div className="card-info">
            <span className="card-lbl">Receita Mensal (Pago)</span>
            <h3 className="card-val">R$ {parseFloat(dashboardStats?.revenue_month ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <span className={`card-trend ${revenueDifference >= 0 ? 'up' : 'down'}`}>
              {revenueDifference >= 0 ? '+' : ''}R$ {revenueDifference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em relação ao mês anterior
            </span>
          </div>
        </div>

        <div className="bignumber-card">
          <div className="card-icon"><HiOutlineUsers /></div>
          <div className="card-info">
            <span className="card-lbl">Alunos Ativos</span>
            <h3 className="card-val">{dashboardStats?.active_students ?? 0}</h3>
            <span className="card-desc-lbl">Matrículas ativas no sistema</span>
          </div>
        </div>

        <div className="bignumber-card">
          <div className="card-icon overdue"><HiOutlineExclamationCircle /></div>
          <div className="card-info">
            <span className="card-lbl">Cobranças em Atraso</span>
            <h3 className="card-val overdue">{dashboardStats?.overdue_payments ?? 0}</h3>
            <span className="card-desc-lbl">Cobranças vencidas não pagas</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-billing-section">
        <div className="finance-chart-card">
          <h3>Faturamento Anual (Pago por Pix)</h3>
          <div className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#7A8A6A" fontSize={11} tickLine={false} />
                <YAxis stroke="#7A8A6A" fontSize={11} tickLine={false} tickFormatter={v => `R$ ${v}`} />
                <Tooltip
                  formatter={(value) => [`R$ ${parseFloat(value).toFixed(2)}`, 'Recebido']}
                  contentStyle={{ background: '#2E3B24', border: 'none', borderRadius: 8, color: '#F5EFE4' }}
                />
                <Bar dataKey="total" fill="#C8881A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payments Table Section */}
      <div className="payments-table-card">
        <div className="table-card-header">
          <h3>Registro de Cobranças</h3>
          <div className="table-filters">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-filter">
              <option value="">Status: Todos</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Atrasado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="payments-table-wrap">
          <div className="payments-table-header">
            <span>Aluno</span>
            <span>Plano de Referência</span>
            <span>Valor</span>
            <span>Vencimento</span>
            <span>Método</span>
            <span>Status</span>
            <span className="actions-col">Ações</span>
          </div>
          {payments.length === 0 ? (
            <div className="table-empty">
              <p>Nenhum registro de pagamento encontrado</p>
            </div>
          ) : (
            payments.map(p => (
              <div key={p.id} className="payments-table-row">
                <span className="col-student-name">{p.student_name}</span>
                <span className="col-plan">{p.plan_name || 'Ajuste / Avulso'}</span>
                <span className="col-amount">R$ {parseFloat(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="col-date">
                  {new Date(p.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
                <span className="col-method uppercase">{p.payment_method}</span>
                <span className="col-status">
                  <span className={`status-badge-inline ${p.status}`}>
                    {p.status === 'paid' ? 'Pago' : p.status === 'pending' ? 'Pendente' : p.status === 'overdue' ? 'Atrasado' : 'Cancelado'}
                  </span>
                </span>
                <span className="col-actions">
                  {p.status !== 'paid' && p.status !== 'cancelled' && (
                    <button className="btn-confirm-pay" onClick={() => handleConfirmPayment(p.id)} title="Confirmar Recebimento">
                      <HiOutlineCheck /> Confirmar
                    </button>
                  )}
                  <button className="btn-delete-pay" onClick={() => handleDeletePayment(p.id)} title="Excluir Cobrança">
                    <HiOutlineTrash />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Billing Modal */}
      {showBillingModal && (
        <div className="modal-overlay" onClick={() => setShowBillingModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Nova Cobrança</h3>
            <form onSubmit={handleCreateBilling}>
              <div className="form-field">
                <label>Aluno *</label>
                <select value={billingForm.student_id}
                  onChange={e => setBillingForm(f => ({ ...f, student_id: e.target.value }))} required>
                  <option value="">Selecione o aluno</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Plano Associado (Opcional)</label>
                  <select value={billingForm.plan_id}
                    onChange={e => handleSelectPlan(e.target.value)}>
                    <option value="">Nenhum (Lançamento avulso)</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Valor Cobrado (R$) *</label>
                  <input type="number" step="0.01" value={billingForm.amount}
                    onChange={e => setBillingForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="Ex: 350.00" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Data de Vencimento *</label>
                  <input type="date" value={billingForm.due_date}
                    onChange={e => setBillingForm(f => ({ ...f, due_date: e.target.value }))} required />
                </div>
                <div className="form-field">
                  <label>Método de Pagamento</label>
                  <select value={billingForm.payment_method}
                    onChange={e => setBillingForm(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro / Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Início do Período de Ref.</label>
                  <input type="date" value={billingForm.reference_period_start}
                    onChange={e => setBillingForm(f => ({ ...f, reference_period_start: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Fim do Período de Ref.</label>
                  <input type="date" value={billingForm.reference_period_end}
                    onChange={e => setBillingForm(f => ({ ...f, reference_period_end: e.target.value }))} />
                </div>
              </div>

              <div className="form-field">
                <label>Observações</label>
                <textarea value={billingForm.notes}
                  onChange={e => setBillingForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ex: Pagamento referente ao material didático" rows="2" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBillingModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={creatingBilling}>
                  {creatingBilling ? 'Registrando...' : 'Registrar Cobrança'}
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
