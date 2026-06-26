import { useState } from 'react'

export default function AreaAluno() {
  const [hovered, setHovered] = useState(false)

  return (
    <section id="area-aluno" style={{ background: '#f9f4ec', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="section-label">Área do Aluno</p>
          <h2 className="section-title" style={{ color: 'var(--green-dark)' }}>
            Agende sua <em>aula online</em>
          </h2>
          <p className="section-sub" style={{ margin: '0 auto', maxWidth: '500px' }}>
            Escolha o melhor horário para você de forma prática e personalizada.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            boxShadow: '0 20px 40px rgba(74, 94, 58, 0.04)',
            border: '1px solid rgba(74, 94, 58, 0.08)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--green-dark)',
              fontWeight: '500',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
            }}
          >
            Nossas aulas são coordenadas e reservadas individualmente para garantir total atenção e flexibilidade à sua rotina.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
              textAlign: 'left',
              maxWidth: '550px',
              margin: '0 auto 3rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'rgba(74, 94, 58, 0.1)',
                  color: 'var(--green)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  fontSize: '0.9rem',
                }}
              >
                1
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--green-dark)', fontSize: '1.05rem', fontWeight: '600' }}>
                  Escolha seu Estilo
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Defina o seu ritmo e foco (aulas individuais, em grupo ou focadas em objetivos específicos).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'rgba(74, 94, 58, 0.1)',
                  color: 'var(--green)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  fontSize: '0.9rem',
                }}
              >
                2
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--green-dark)', fontSize: '1.05rem', fontWeight: '600' }}>
                  Combine os Horários
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Alinhe seus dias e horários diretamente com a Teacher Juli para garantir a melhor experiência.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  background: 'rgba(74, 94, 58, 0.1)',
                  color: 'var(--green)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  fontSize: '0.9rem',
                }}
              >
                3
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--green-dark)', fontSize: '1.05rem', fontWeight: '600' }}>
                  Comece sua Jornada
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Receba seu link de acesso exclusivo e comece a falar inglês com confiança desde o primeiro dia.
                </p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20de%20ingl%C3%AAs"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 36px',
              background: hovered ? 'var(--green-dark)' : 'var(--green)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: '100px',
              fontSize: '1.05rem',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: hovered ? '0 8px 24px rgba(74, 94, 58, 0.25)' : '0 4px 14px rgba(74, 94, 58, 0.15)',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z" />
            </svg>
            Agendar Aula via WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
