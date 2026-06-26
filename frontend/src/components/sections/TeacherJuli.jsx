export default function TeacherJuli() {
  return (
    <section id="teacher-juli" style={{ background: 'var(--cream)', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="section-label" style={{ color: 'var(--green)' }}>About me</p>
          <h2 className="section-title" style={{ color: 'var(--green-dark)' }}>Uma trajetória que<br /><em>não foi em linha reta</em></h2>
        </div>

        {/* Sobre mim: selfie à esquerda, texto à direita */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4.5rem' }} className="about-inner">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ borderRadius: '999px', overflow: 'hidden', width: '260px', height: '340px', boxShadow: '0 12px 50px rgba(74,94,58,0.2)' }}>
              <img src="/images/foto_1.png" alt="Teacher Juli" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 600, marginBottom: '0.75rem' }}>Sobre mim</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '1rem' }}>Teacher Juli</h3>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--green-dark)', lineHeight: 1.85, marginBottom: '1.25rem' }}>"Por quatro anos, estudei farmácia. Aprendi muito, mas sentia que estava no lugar errado. Sabia só que queria ajudar as pessoas de verdade."</p>
            <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>Com 21 anos e sem uma direção clara, me candidatei quase sem querer para uma vaga de professora de inglês. Não esperava que fosse mudar tudo.</p>
            <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>Hoje sou professora de inglês há 2 anos e estudante de Letras na UNIVESP.</p>
          </div>
        </div>

        {/* Por que NOMA: texto à esquerda, foto à direita */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="about-inner">
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 600, marginBottom: '0.75rem' }}>Por que NOMA</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '1rem' }}>Recalcular a rota</h3>
            <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>NOMA vem de nômade. Da necessidade de mudar, de recalcular a rota. Surgiu da percepção de que as escolas são muito engessadas, presas a um livro, sem espaço para o aluno ser quem é.</p>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontStyle: 'italic', color: 'var(--green-dark)', lineHeight: 1.85 }}>"A NOMA nasceu da necessidade de ir mais longe."</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', width: '100%', maxWidth: '320px', height: '420px', boxShadow: '0 12px 50px rgba(74,94,58,0.15)' }}>
              <img src="/images/foto_2.png" alt="Teacher Juli" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

