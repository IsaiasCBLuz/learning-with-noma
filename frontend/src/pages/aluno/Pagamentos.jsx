import { useState, useEffect } from 'react'
import api from '../../api/client'
import { HiOutlineCash, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi'

const STATUS_MAP = {
  pending: { label: 'Pendente', icon: <HiOutlineClock />, className: 'pending' },
  paid: { label: 'Pago', icon: <HiOutlineCheckCircle />, className: 'paid' },
  overdue: { label: 'Atrasado', icon: <HiOutlineExclamationCircle />, className: 'overdue' },
  cancelled: { label: 'Cancelado', icon: <HiOutlineExclamationCircle />, className: 'cancelled' },
}

export default function Pagamentos() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/mine')
      .then(r => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-container"><div className="loader-spinner" /></div>

  const pending = payments.filter(p => p.status === 'pending' || p.status === 'overdue')
  const history = payments.filter(p => p.status === 'paid' || p.status === 'cancelled')

  return (
    <div className="page-pagamentos">
      {/* Pending */}
      <div className="payments-section">
        <h3><HiOutlineCash /> Pendências</h3>
        {pending.length === 0 ? (
          <div className="empty-state">
            <HiOutlineCheckCircle className="empty-icon" />
            <p>Nenhuma pendência! Tudo em dia.</p>
          </div>
        ) : (
          <div className="payments-list">
            {pending.map(p => {
              const s = STATUS_MAP[p.status]
              return (
                <div key={p.id} className={`payment-card payment-${s.className}`}>
                  <div className="payment-amount">
                    <span className="payment-currency">R$</span>
                    <span className="payment-value">{Number(p.amount).toFixed(2)}</span>
                  </div>
                  <div className="payment-details">
                    <span className="payment-due">
                      Vencimento: {new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    {p.plan_name && <span className="payment-plan">{p.plan_name}</span>}
                    {p.notes && <span className="payment-notes">{p.notes}</span>}
                  </div>
                  <span className={`payment-status status-${s.className}`}>
                    {s.icon} {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="payments-section">
        <h3>Histórico</h3>
        {history.length === 0 ? (
          <p className="no-data">Nenhum pagamento registrado</p>
        ) : (
          <div className="payments-list">
            {history.map(p => {
              const s = STATUS_MAP[p.status]
              return (
                <div key={p.id} className={`payment-card payment-${s.className} payment-history`}>
                  <div className="payment-amount">
                    <span className="payment-currency">R$</span>
                    <span className="payment-value">{Number(p.amount).toFixed(2)}</span>
                  </div>
                  <div className="payment-details">
                    {p.paid_at && (
                      <span className="payment-paid-at">
                        Pago em {new Date(p.paid_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {p.payment_method && <span className="payment-method">{p.payment_method}</span>}
                    {p.plan_name && <span className="payment-plan">{p.plan_name}</span>}
                  </div>
                  <span className={`payment-status status-${s.className}`}>
                    {s.icon} {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
