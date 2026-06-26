import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  function openDrawer() {
    setOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    setOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a href="#">
          <img src="/images/logo.png" alt="NOMA" className="nav-logo" />
        </a>
        <div className="nav-right">
          <div className="nav-social">
            <a href="https://www.instagram.com/learnwith.noma" target="_blank" rel="noopener" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@learnwith.noma" target="_blank" rel="noopener" title="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
            <a href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20mais%20informa%C3%A7%C3%B5es" target="_blank" rel="noopener" title="WhatsApp">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
              </svg>
            </a>
          </div>
          <a href="/login" className="nav-login-link" style={{ marginRight: '1.2rem', textDecoration: 'none', color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>Entrar</a>
          <a href="#quiz" className="nav-cta">Descubra seu plano</a>
          <button className={`hamburger ${open ? 'open' : ''}`} onClick={openDrawer} aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* DRAWER MENU */}
      <div className={`nav-drawer ${open ? 'open' : ''}`}>
        <div className="nav-drawer-header">
          <span className="nav-drawer-title">Menu</span>
          <button className="nav-drawer-close" onClick={closeDrawer} aria-label="Fechar menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <ul className="nav-drawer-links">
          <li><a href="#sobre" onClick={closeDrawer}>Sobre</a></li>
          <li><a href="#valores" onClick={closeDrawer}>Essência</a></li>
          <li><a href="#turmas" onClick={closeDrawer}>Turmas</a></li>
          <li><a href="#estilos" onClick={closeDrawer}>Estilos</a></li>
          <li><a href="#experimental" onClick={closeDrawer}>Aula Experimental</a></li>
          <li><a href="/login" onClick={closeDrawer}>Entrar no Portal</a></li>
          <li><a href="#pacotes" onClick={closeDrawer}>Planos</a></li>
          <li><a href="#quiz" onClick={closeDrawer}>Quiz</a></li>
          <li><a href="#teacher-juli" onClick={closeDrawer}>About me</a></li>
        </ul>
        <a href="#quiz" className="nav-drawer-cta" onClick={closeDrawer}>Descubra seu plano</a>
      </div>
      <div className={`nav-overlay ${open ? 'open' : ''}`} onClick={closeDrawer}></div>
    </>
  )
}


