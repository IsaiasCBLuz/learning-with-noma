import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#valores', label: 'Essência' },
  { href: '#turmas', label: 'Turmas' },
  { href: '#estilos', label: 'Estilos' },
  { href: '#experimental', label: 'Aula Experimental' },
  { href: '#pacotes', label: 'Planos' },
  { href: '#quiz', label: 'Quiz' },
  { href: '#teacher-juli', label: 'About me' },
]

const IGIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const TKIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
  </svg>
)
const WAIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z"/>
  </svg>
)

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 w-full z-[200] bg-[rgba(245,239,228,0.96)] backdrop-blur-[10px] border-b border-[rgba(74,94,58,0.12)] px-10 h-[72px] flex items-center justify-between">
        <a href="#">
          <img src="/images/logo.jpeg" alt="NOMA" className="h-[52px] object-contain" />
        </a>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-[10px]">
            <a href="https://www.instagram.com/learnwith.noma" target="_blank" rel="noopener" className="text-green opacity-70 flex items-center hover:opacity-100 transition-opacity">
              <IGIcon />
            </a>
            <a href="https://www.tiktok.com/@learnwith.noma" target="_blank" rel="noopener" className="text-green opacity-70 flex items-center hover:opacity-100 transition-opacity">
              <TKIcon />
            </a>
            <a href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20mais%20informa%C3%A7%C3%B5es" target="_blank" rel="noopener" className="text-green opacity-70 flex items-center hover:opacity-100 transition-opacity">
              <WAIcon />
            </a>
          </div>

          <Link to="/aluno/login" className="border-[1.5px] border-[rgba(74,94,58,0.4)] text-green-dark no-underline px-[1.2rem] py-[0.5rem] rounded-full text-[0.82rem] font-medium whitespace-nowrap hover:border-green hover:text-green transition-colors hidden md:inline-block">
            Área do Aluno
          </Link>

          <a href="#quiz" className="bg-green text-cream no-underline px-[1.4rem] py-[0.55rem] rounded-full text-[0.82rem] font-medium whitespace-nowrap hover:bg-green-dark transition-colors hidden md:inline-block">
            Descubra seu plano
          </a>

          <button
            onClick={() => setOpen(true)}
            className="flex flex-col gap-[5px] cursor-pointer bg-none border-none p-1 md:hidden"
            aria-label="Menu"
          >
            <span className="block w-[20px] h-[1.5px] bg-green rounded-sm" />
            <span className="block w-[20px] h-[1.5px] bg-green rounded-sm" />
            <span className="block w-[20px] h-[1.5px] bg-green rounded-sm" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-[rgba(46,59,36,0.35)] backdrop-blur-[2px] z-[499] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-cream z-[500] flex flex-col shadow-xl border-l border-[rgba(74,94,58,0.1)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(74,94,58,0.1)]">
          <span className="font-serif text-[1.1rem] font-semibold text-green-dark tracking-[0.04em]">Menu</span>
          <button onClick={() => setOpen(false)} className="bg-none border-none cursor-pointer text-green opacity-70 hover:opacity-100 flex items-center" aria-label="Fechar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <ul className="list-none flex-1 overflow-y-auto py-3">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-7 py-[13px] text-[0.93rem] text-green-dark no-underline border-l-[3px] border-transparent hover:text-green hover:bg-[rgba(74,94,58,0.05)] hover:border-l-gold hover:pl-8 transition-all"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="px-6 pt-3 pb-1">
            <Link
              to="/aluno/login"
              onClick={() => setOpen(false)}
              className="block py-3 border-[1.5px] border-[rgba(74,94,58,0.35)] text-green-dark no-underline rounded-full text-[0.88rem] font-medium text-center hover:border-green hover:text-green transition-all"
            >
              Área do Aluno
            </Link>
          </li>
        </ul>

        <a href="#quiz" onClick={() => setOpen(false)} className="mx-6 mb-8 mt-4 py-[13px] bg-green text-cream rounded-full text-center no-underline text-[0.9rem] font-medium hover:bg-green-dark transition-colors">
          Descubra seu plano
        </a>
      </div>
    </>
  )
}
