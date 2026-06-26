import { useState } from 'react'

export default function PoliticaPrivacidade() {
  const [open, setOpen] = useState(false)

  return (
    <section id="politica-privacidade" style={{ background: '#f9f4ec', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => setOpen(o => !o)}
          id="privacidade-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: '1.5px solid rgba(74,94,58,0.25)',
            color: 'var(--green-dark)',
            padding: '0.7rem 1.5rem',
            borderRadius: '100px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '1.5rem',
            transition: 'all .2s'
          }}
        >
          {open ? 'Fechar ↑' : 'Ler política de privacidade ↓'}
        </button>
        <div id="privacidade-conteudo" style={{ display: open ? 'block' : 'none' }}>
          <p className="section-label" style={{ color: 'var(--green)' }}>LGPD</p>
          <h2 className="section-title" style={{ color: 'var(--green-dark)', marginBottom: '2rem' }}>Política de <em>Privacidade</em></h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.9', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Quem somos</h3>
              <p>A NOMA English School é uma escola virtual de inglês conduzida por Juliana (Teacher Juli). Responsável pelos dados: Teacher Juli — contato via WhatsApp (15) 98813-7161 ou Instagram @learnwith.noma.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Quais dados coletamos</h3>
              <p>Coletamos apenas o necessário: <strong style={{ color: 'var(--green-dark)' }}>nome completo, e-mail e WhatsApp</strong> (opcional) fornecidos no quiz ou no cadastro da área do aluno. Também armazenamos as respostas do quiz e os horários de aulas agendadas.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Para que usamos</h3>
              <p>Os dados são usados exclusivamente para entrar em contato após o quiz, gerenciar agendamentos e personalizar a experiência de ensino. Não vendemos, compartilhamos nem usamos seus dados para publicidade.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Por quanto tempo guardamos</h3>
              <p>Respostas do quiz e dados de contato: até <strong style={{ color: 'var(--green-dark)' }}>2 anos</strong>. Agendamentos: <strong style={{ color: 'var(--green-dark)' }}>6 meses</strong> após a data da aula.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Seus direitos (Lei 13.709/2018)</h3>
              <p>Você tem direito a acessar, corrigir, solicitar exclusão e revogar o consentimento a qualquer momento via WhatsApp ou Instagram.</p>
            </div>
            <div style={{ background: 'rgba(74,94,58,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.5rem' }}>Solicitar exclusão dos seus dados</h3>
              <p style={{ marginBottom: '1rem' }}>Envie uma mensagem com seu nome e e-mail cadastrado.</p>
              <a href="https://wa.me/5515988137161?text=Ola%20Teacher%20Juli,%20gostaria%20de%20solicitar%20a%20exclusao%20dos%20meus%20dados%20da%20NOMA." target="_blank" rel="noopener" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}>
                Solicitar exclusão via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

