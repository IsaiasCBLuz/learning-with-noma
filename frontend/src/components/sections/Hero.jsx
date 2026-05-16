import SectionLabel from '../ui/SectionLabel'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-[72px] bg-cream">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none">
        <img src="/images/logo.jpeg" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 text-center px-8 max-w-[820px] mx-auto">
        <img
          src="/images/logo.jpeg"
          alt="NOMA Own your path"
          className="h-[220px] md:h-[300px] object-contain mx-auto mb-6"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        />
        <SectionLabel>Escola virtual de inglês</SectionLabel>
        <p className="text-[0.82rem] text-muted mb-0">By Teacher Juli</p>
        <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.95] text-green-dark my-5 tracking-[-0.01em]">
          Own your<em className="italic text-gold block">path.</em>
        </h1>
        <p className="text-[1.05rem] text-muted leading-[1.7] max-w-[480px] mx-auto mb-8">
          Aprender inglês não é sobre memorizar regras. É sobre encontrar sua voz e levar ela para o mundo.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="#quiz" className="bg-green text-cream no-underline py-[0.9rem] px-[2.2rem] rounded-full text-[0.95rem] font-medium transition-all hover:bg-green-dark hover:-translate-y-0.5">
            Descubra seu plano ideal
          </a>
          <a href="#turmas" className="bg-transparent text-green border-[1.5px] border-green no-underline py-[0.9rem] px-[2.2rem] rounded-full text-[0.95rem] font-medium transition-all hover:bg-green hover:text-cream">
            Conhecer as turmas
          </a>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  )
}
