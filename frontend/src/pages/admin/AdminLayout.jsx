import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../api/client'
import { HiOutlineCalendar, HiOutlineUsers, HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineBell, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadUnread()
    window.addEventListener('reloadAdminData', loadUnread)
    return () => {
      window.removeEventListener('reloadAdminData', loadUnread)
    }
  }, [])

  function loadUnread() {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {})
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNotifClick() {
    if (window.location.pathname === '/admin/agenda') {
      window.dispatchEvent(new Event('openPendingModal'))
    } else {
      navigate('/admin/agenda', { state: { openPendingModal: true } })
    }
  }

  const links = [
    { to: '/admin/agenda', icon: <HiOutlineCalendar />, label: 'Agenda' },
    { to: '/admin/alunos', icon: <HiOutlineUsers />, label: 'Alunos' },
    { to: '/admin/avaliacoes', icon: <HiOutlineClipboardList />, label: 'Avaliações' },
    { to: '/admin/financeiro', icon: <HiOutlineCurrencyDollar />, label: 'Financeiro' },
  ]

  return (
    <div className="portal-layout admin-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`portal-sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/images/logo.png" alt="NOMA" className="sidebar-logo" />
          <span className="admin-badge-sidebar">Admin</span>
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
          <button className="sidebar-logout" onClick={handleLogout}>
            <HiOutlineLogout /> Sair
          </button>
        </div>
      </aside>

      <div className="portal-main">
        <header className="portal-header admin-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <HiOutlineMenu />
          </button>
          <div className="header-greeting">
            <h1>Painel Admin</h1>
          </div>
          <div className="header-actions">
            <button className="header-notif-btn" onClick={handleNotifClick}>
              <HiOutlineBell />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>
            <span className="header-user-name">{user?.full_name}</span>
          </div>
        </header>
        <main className="portal-content admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
