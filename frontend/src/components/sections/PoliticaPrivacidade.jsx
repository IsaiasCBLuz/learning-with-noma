import { useState } from 'react'
import SectionLabel from '../ui/SectionLabel'

const WA_DELETE = 'https://wa.me/5515988137161?text=Ola%20Teacher%20Juli,%20gostaria%20de%20solicitar%20a%20exclusao%20dos%20meus%20dados%20da%20NOMA.'

const items = [
  {
    title: 'Quem somos',
    text: 'A NOMA English School é uma escola virtual de inglês conduzida por Juliana (Teacher Juli). Responsável pelos dados: Teacher Juli — contato via WhatsApp (15) 98813-7161 ou Instagram @learnwith.noma.',
  },
  {
    title: 'Quais dados coletamos',
    text: 'Coletamos apenas o necessário: nome completo, e-mail e WhatsApp (opcional) fornecidos no quiz ou no cadastro da área do aluno. Também armazenamos as respostas do quiz e os horários de aulas agendadas.',
  },
  {
    title: 'Para que usamos',
    text: 'Os dados são usados exclusivamente para entrar em contato após o quiz, gerenciar agendamentos e personalizar a experiência de ensino. Não vendemos, compartilhamos nem usamos seus dados para publicidade.',
  },
  {
    title: 'Por quanto tempo guardamos',
    text: 'Respostas do quiz e dados de contato: até 2 anos. Agendamentos: 6 meses após a data da aula.',
  },
  {
    title: 'Seus direitos (Lei 13.709/2018)',
    text: 'Você tem direito a acessar, corrigir, solicitar exclusão e revogar o consentimento a qualquer momento via WhatsApp ou Instagram.',
  },
]

export default function PoliticaPrivacidade() {
  const [open, setOpen] = useState(false)

  return (
    <section id="politica-privacidade" className="bg-[#f0ece4] py-12 px-6">
      <div className="max-w-[760px] mx-auto">
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 bg-transparent border-[1.5px] border-[rgba(74,94,58,0.25)] text-green-dark px-6 py-[0.7rem] rounded-full text-[0.875rem] cursor-pointer font-sans mb-6 transition-all hover:border-[rgba(74,94,58,0.5)]">
          {open ? 'Fechar ↑' : 'Ler política de privacidade ↓'}
        </button>

        {open && (
          <div>
            <SectionLabel className="text-green">LGPD</SectionLabel>
            <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] text-green-dark mb-8">
              Política de <em className="italic text-gold">Privacidade</em>
            </h2>

            <div className="flex flex-col gap-6 text-[0.9rem] text-muted leading-[1.9]">
              {items.map(item => (
                <div key={item.title}>
                  <h3 className="font-serif text-[1.2rem] font-semibold text-green-dark mb-2">{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}

              <div className="bg-[rgba(74,94,58,0.08)] rounded-[16px] px-6 py-5">
                <h3 className="font-serif text-[1.1rem] font-semibold text-green-dark mb-2">Solicitar exclusão dos seus dados</h3>
                <p className="mb-4">Envie uma mensagem com seu nome e e-mail cadastrado.</p>
                <a href={WA_DELETE} target="_blank" rel="noopener"
                  className="inline-block bg-green text-cream no-underline py-3 px-6 rounded-full text-[0.875rem] font-medium transition-all hover:bg-green-dark">
                  Solicitar exclusão via WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
