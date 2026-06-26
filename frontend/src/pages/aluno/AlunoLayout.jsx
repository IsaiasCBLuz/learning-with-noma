import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../api/client'
import { HiOutlineCalendar, HiOutlineClipboardList, HiOutlineCreditCard, HiOutlineStar, HiOutlineBell, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi'

export default function AlunoLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [profile, setProfile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {})
    api.get('/me/profile').then(r => setProfile(r.data)).catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/aluno/agenda', icon: <HiOutlineCalendar />, label: 'Minha Agenda' },
    { to: '/aluno/avaliacoes', icon: <HiOutlineClipboardList />, label: 'Avaliações' },
    { to: '/aluno/planos', icon: <HiOutlineStar />, label: 'Meu Plano' },
    { to: '/aluno/pagamentos', icon: <HiOutlineCreditCard />, label: 'Pagamentos' },
  ]

  return (
    <div className="portal-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`portal-sidebar aluno-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="NOMA" className="sidebar-logo" />
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <HiOutlineX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="sidebar-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {profile && (
            <div className="sidebar-credits">
              <span className="credits-label">Créditos</span>
              <div className="credits-bar">
                <div className="credits-fill" style={{
                  width: `${profile.plan ? Math.min(100, (profile.credits_remaining / (profile.credits_remaining + profile.credits_used || 1)) * 100) : 0}%`
                }} />
              </div>
              <span className="credits-count">{profile.credits_remaining} restantes</span>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
            <HiOutlineLogout /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="portal-main">
        <header className="portal-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <HiOutlineMenu />
          </button>
          <div className="header-greeting">
            <h1>Olá, {user?.full_name?.split(' ')[0]} 👋</h1>
            {profile?.plan && <span className="header-plan-badge">{profile.plan.name}</span>}
          </div>
          <div className="header-actions">
            <button className="header-notif-btn" onClick={() => navigate('/aluno/agenda')}>
              <HiOutlineBell />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>
          </div>
        </header>
        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
