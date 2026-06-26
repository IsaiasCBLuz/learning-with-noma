import { useFadeIn } from '../../hooks/useFadeIn'

export default function Turmas() {
  const headerRef = useFadeIn()
  const ref1 = useFadeIn()
  const ref2 = useFadeIn()
  const ref3 = useFadeIn()
  const refFlow = useFadeIn()
  const refRoots = useFadeIn()
  const refBee = useFadeIn()
  const refQuest = useFadeIn()
  const refLevel = useFadeIn()

  return (
    <section className="turmas" id="turmas">
      <div className="turmas-pattern">
        <img src="/images/fundo.jpeg" alt="" />
      </div>
      <div className="turmas-inner">
        <div ref={headerRef} className="turmas-header fade-in">
          <p className="section-label">Para cada momento da vida</p>
          <h2 className="section-title">
            Encontre sua <em>turma</em>
          </h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Cada faixa etária tem seu próprio ritmo, vocabulário e forma de aprender. Por isso, criamos experiências feitas para cada fase.
          </p>
        </div>
        <div className="turmas-cards">
          <div ref={ref1} className="turma-card sprouts fade-in">
            <span className="turma-badge">NOMA Sprouts</span>
            <h3>Pequenos exploradores</h3>
            <span className="turma-age">Para crianças de 8 a 11 anos</span>
            <p>Aprendizado lúdico com brincadeiras, músicas e histórias. As crianças aprendem sem perceber e adoram cada momento.</p>
          </div>
          <div ref={ref2} className="turma-card explorers fade-in">
            <span className="turma-badge">NOMA Buds</span>
            <h3>Cultura, tecnologia e mundo</h3>
            <span className="turma-age">Para jovens de 12 a 17 anos</span>
            <p>Inglês conectado com cultura, tecnologia e tudo que move essa geração. Para quem está descobrindo o mundo.</p>
          </div>
          <div ref={ref3} className="turma-card voyagers fade-in">
            <span className="turma-badge">NOMA Bloom</span>
            <h3>Trabalho, viagens e relacionamentos</h3>
            <span className="turma-age">Para adultos a partir de 18 anos</span>
            <p>Inglês para quem vive intensamente: trabalho, viagens, relacionamentos. Com a seriedade que você precisa e a leveza que merece.</p>
          </div>
        </div>

        {/* ESTILOS */}
        <div id="estilos" style={{ marginTop: '4rem', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="section-label">Estilos de ensino</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600, color: 'var(--green-dark)' }}>
              Como a gente <em style={{ color: 'var(--gold)' }}>ensina</em>
            </h3>
          </div>
          <div className="estilos-grid">
            <div ref={refFlow} id="flow" className="fade-in" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(74,94,58,0.12)', borderTop: '4px solid var(--gold)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(200,136,26,0.1)', color: '#8B5E0A', borderRadius: '100px', padding: '0.25rem 0.9rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                ✈ Flow
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
                Comunicação em primeiro lugar
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                No Flow, a conversa não espera. Cada aula tem um tema novo, vocabulário em contexto real e muita prática oral. O objetivo é você ganhar confiança para se comunicar de verdade, sem travar.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Temas do seu mundo</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Vocabulário por contexto</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Conversação desde o primeiro dia</span>
              </div>
            </div>
            <div ref={refRoots} id="roots" className="fade-in" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(74,94,58,0.12)', borderTop: '4px solid var(--green)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(74,94,58,0.1)', color: 'var(--green-dark)', borderRadius: '100px', padding: '0.25rem 0.9rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                🌱 Roots
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
                Estrutura que sustenta tudo
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                No Roots, você entende o inglês por dentro. A gramática deixa de ser decoreba e vira ferramenta. Cada aula constrói uma base sólida para que você leia, escreva e fale com precisão.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Gramática aplicada, não decorada</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Estrutura para ler e escrever melhor</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Base para fluência duradoura</span>
              </div>
            </div>
          </div>
          <div ref={refBee} id="bee" className="fade-in" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(74,94,58,0.12)', borderTop: '4px solid #C8881A', marginTop: '1.5rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(200,160,20,0.1)', color: '#7A5C00', borderRadius: '100px', padding: '0.25rem 0.9rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              🐝 Bee
            </div>
            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
              Reforço escolar com propósito
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
              O Bee é para quem precisa de apoio com o inglês do colégio, mas sem a pressão de decorar regra. A gente pega o conteúdo da escola e transforma em algo que faz sentido de verdade, com conversação, contexto e leveza.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Conteúdo escolar com contexto real</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Gramática sem decoreba</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Preparação para provas e vestibular</span>
            </div>
          </div>
        </div>

        {/* MÉTODOS */}
        <div style={{ marginTop: '3rem', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p className="section-label">Métodos</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600, color: 'var(--green-dark)' }}>
              Como cada aula <em style={{ color: 'var(--gold)' }}>acontece</em>
            </h3>
          </div>
          <div className="estilos-grid">
            <div ref={refQuest} id="quest" className="fade-in" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(74,94,58,0.12)', borderTop: '4px solid var(--gold)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(200,136,26,0.1)', color: '#8B5E0A', borderRadius: '100px', padding: '0.25rem 0.9rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                ✦ Quest
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
                Um tema novo a cada aula
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                No Quest, cada aula começa com um tema do seu universo. A conversa acontece desde o primeiro minuto, o vocabulário entra pelo contexto e a fluência vem pela prática constante.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Conversação ao vivo</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Vocabulário por contexto</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Temas que você escolhe</span>
              </div>
            </div>
            <div ref={refLevel} id="level" className="fade-in" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(74,94,58,0.12)', borderTop: '4px solid var(--green)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(74,94,58,0.1)', color: 'var(--green-dark)', borderRadius: '100px', padding: '0.25rem 0.9rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                ✦ Level
              </div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--green-dark)', marginBottom: '0.6rem' }}>
                Aprenda como num jogo
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
                No Level, cada aula tem desafios, pontuações e metas. A sensação de avançar de fase mantém a motivação alta. O conteúdo tem temas mas o formato é gamificado do começo ao fim.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Desafios e conquistas</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Motivação constante</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green-dark)' }}>✦ Aprender sem parecer aula</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


