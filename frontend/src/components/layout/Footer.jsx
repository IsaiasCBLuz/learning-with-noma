export default function Footer() {

  return (
    <>
      {/* FOOTER */}
      <footer>
        <img src="/images/logo.png" alt="NOMA" className="footer-logo" style={{ filter: 'brightness(0) invert(1)', opacity: 0.85, height: '44px', marginBottom: '0.75rem' }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'rgba(245,239,228,0.85)', marginBottom: '0.5rem' }}>
          <span className="gold">NOMA — Own your path.</span>
        </p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(245,239,228,0.5)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
          By Teacher Juli · Escola virtual de inglês · Aprendizado com propósito, leveza e autenticidade.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <a href="https://www.instagram.com/learnwith.noma" target="_blank" rel="noopener" style={{ color: 'rgba(245,239,228,0.5)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            @learnwith.noma
          </a>
          <a href="https://www.tiktok.com/@learnwith.noma" target="_blank" rel="noopener" style={{ color: 'rgba(245,239,228,0.5)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
            </svg>
            @learnwith.noma
          </a>
          <a href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!" target="_blank" rel="noopener" style={{ color: 'rgba(245,239,228,0.5)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
            </svg>
            WhatsApp
          </a>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(245,239,228,0.2)' }}>
          © 2025 NOMA English School ·{' '}
          <a href="#politica-privacidade" style={{ color: 'rgba(245,239,228,0.3)', textDecoration: 'none' }}>
            Política de Privacidade
          </a>
        </p>
      </footer>

      {/* ADMIN TRIGGER */}
      <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--green-dark)' }}>
        <span id="admin-secret" style={{ fontSize: '0.65rem', color: 'rgba(245,239,228,0.15)', cursor: 'default', userSelect: 'none', letterSpacing: '0.05em' }}>
          NOMA © 2025
        </span>
      </div>
    </>
  )
}


