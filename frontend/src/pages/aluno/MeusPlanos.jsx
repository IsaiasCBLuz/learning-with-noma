import { useState, useEffect } from 'react'
import api from '../../api/client'
import { HiOutlineStar, HiOutlineArrowUp } from 'react-icons/hi'

const TIER_COLORS = {
  beige: '#D4C4A8',
  orange: '#E8945A',
  green: '#6B7E59',
  gold: '#C8881A',
}

const TIER_LABELS = {
  beige: 'Mensal',
  orange: 'Trimestral',
  green: 'Semestral',
  gold: 'Anual',
}

export default function MeusPlanos() {
  const [profile, setProfile] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/me/profile'),
      api.get('/plans').catch(() => ({ data: [] })),
    ]).then(([pRes, plansRes]) => {
      setProfile(pRes.data)
      setPlans(plansRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-container"><div className="loader-spinner" /></div>

  const currentPlan = profile?.plan
  const lightPlans = plans.filter(p => p.category === 'light')
  const fullPlans = plans.filter(p => p.category === 'full')

  return (
    <div className="page-planos">
      {/* Current plan */}
      {currentPlan && (
        <div className="current-plan-card" style={{ borderColor: TIER_COLORS[currentPlan.tier] }}>
          <div className="current-plan-header">
            <HiOutlineStar style={{ color: TIER_COLORS[currentPlan.tier] }} />
            <span className="current-plan-label">Seu Plano Atual</span>
          </div>
          <h2 className="current-plan-name">{currentPlan.name}</h2>
          <div className="current-plan-details">
            <div className="plan-detail">
              <span className="plan-detail-label">Frequência</span>
              <span className="plan-detail-value">{currentPlan.weekly_frequency}x por semana</span>
            </div>
            <div className="plan-detail">
              <span className="plan-detail-label">Créditos totais</span>
              <span className="plan-detail-value">{currentPlan.credits_total}</span>
            </div>
            <div className="plan-detail">
              <span className="plan-detail-label">Duração</span>
              <span className="plan-detail-value">{currentPlan.duration_months} {currentPlan.duration_months === 1 ? 'mês' : 'meses'}</span>
            </div>
          </div>
          <div className="plan-credits-visual">
            <div className="plan-credits-bar">
              <div className="plan-credits-fill" style={{
                width: `${(profile.credits_remaining / (profile.credits_remaining + profile.credits_used || 1)) * 100}%`,
                background: TIER_COLORS[currentPlan.tier],
              }} />
            </div>
            <span>{profile.credits_remaining} créditos restantes de {profile.credits_remaining + profile.credits_used}</span>
          </div>
          {profile.contract_start && (
            <p className="plan-contract">
              Contrato: {new Date(profile.contract_start + 'T12:00:00').toLocaleDateString('pt-BR')}
              {profile.contract_end && ` — ${new Date(profile.contract_end + 'T12:00:00').toLocaleDateString('pt-BR')}`}
            </p>
          )}
        </div>
      )}

      {/* Available plans */}
      <h3 className="plans-section-title">
        <HiOutlineArrowUp /> Planos Disponíveis
      </h3>

      <div className="plans-grid">
        {/* Light plans */}
        <div className="plan-category-card light">
          <div className="plan-cat-header">
            <span className="plan-cat-badge">✈ Light</span>
            <span className="plan-cat-freq">1x por semana</span>
          </div>
          <div className="plan-tiers">
            {lightPlans.map(p => (
              <div key={p.id} className={`plan-tier-row ${currentPlan?.id === p.id ? 'current' : ''}`}>
                <div className="tier-indicator" style={{ background: TIER_COLORS[p.tier] }} />
                <div className="tier-info">
                  <span className="tier-name">{p.name}</span>
                  <span className="tier-duration">{TIER_LABELS[p.tier]} • {p.credits_total} créditos</span>
                </div>
                {currentPlan?.id === p.id && <span className="tier-current-badge">Atual</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Full plans */}
        <div className="plan-category-card full">
          <div className="plan-cat-header">
            <span className="plan-cat-badge full-badge">✦ Full</span>
            <span className="plan-cat-freq">2x por semana</span>
          </div>
          <div className="plan-tiers">
            {fullPlans.map(p => (
              <div key={p.id} className={`plan-tier-row ${currentPlan?.id === p.id ? 'current' : ''}`}>
                <div className="tier-indicator" style={{ background: TIER_COLORS[p.tier] }} />
                <div className="tier-info">
                  <span className="tier-name">{p.name}</span>
                  <span className="tier-duration">{TIER_LABELS[p.tier]} • {p.credits_total} créditos</span>
                </div>
                {currentPlan?.id === p.id && <span className="tier-current-badge">Atual</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="plan-upgrade-cta">
        <p>Quer fazer upgrade ou trocar de plano?</p>
        <a href="https://wa.me/5515988137161?text=Oi%20Teacher%20Juli!%20Quero%20saber%20mais%20sobre%20os%20planos"
          target="_blank" rel="noopener" className="btn-whatsapp">
          Falar com a Teacher Juli →
        </a>
      </div>
    </div>
  )
}
