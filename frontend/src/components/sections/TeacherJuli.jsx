import SectionLabel from '../ui/SectionLabel'

export default function TeacherJuli() {
  return (
    <section id="teacher-juli" className="bg-cream py-20 px-6">
      <div className="max-w-[860px] mx-auto">
        <div className="text-center mb-14">
          <SectionLabel className="text-green">About me</SectionLabel>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-green-dark">
            Uma trajetória que<br /><em className="italic text-gold">não foi em linha reta</em>
          </h2>
        </div>

        {/* Foto + texto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-18">
          <div className="flex justify-center">
            <div className="rounded-full overflow-hidden w-[260px] h-[340px] shadow-[0_12px_50px_rgba(74,94,58,0.2)]">
              <img src="/images/foto_1.png" alt="Teacher Juli" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <div>
            <p className="text-[0.75rem] tracking-[0.14em] uppercase text-green font-semibold mb-3">Sobre mim</p>
            <h3 className="font-serif text-[1.8rem] font-semibold text-green-dark mb-4">Teacher Juli</h3>
            <p className="font-lora text-[1.05rem] italic text-green-dark leading-[1.85] mb-5">
              "Por quatro anos, estudei farmácia. Aprendi muito, mas sentia que estava no lugar errado. Sabia só que queria ajudar as pessoas de verdade."
            </p>
            <p className="text-[0.93rem] text-muted leading-[1.8] mb-4">
              Com 21 anos e sem uma direção clara, me candidatei quase sem querer para uma vaga de professora de inglês. Não esperava que fosse mudar tudo.
            </p>
            <p className="text-[0.93rem] text-muted leading-[1.8]">
              Hoje sou professora de inglês há 2 anos e estudante de Letras na UNIVESP.
            </p>
          </div>
        </div>

        {/* texto + foto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
          <div>
            <p className="text-[0.75rem] tracking-[0.14em] uppercase text-green font-semibold mb-3">Por que NOMA</p>
            <h3 className="font-serif text-[1.8rem] font-semibold text-green-dark mb-4">Recalcular a rota</h3>
            <p className="text-[0.93rem] text-muted leading-[1.8] mb-4">
              NOMA vem de nômade. Da necessidade de mudar, de recalcular a rota. Surgiu da percepção de que as escolas são muito engessadas, presas a um livro, sem espaço para o aluno ser quem é.
            </p>
            <p className="font-lora text-base italic text-green-dark leading-[1.85]">
              "A NOMA nasceu da necessidade de ir mais longe."
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-[24px] overflow-hidden w-full max-w-[320px] h-[420px] shadow-[0_12px_50px_rgba(74,94,58,0.15)]">
              <img src="/images/foto_2.png" alt="Teacher Juli" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
