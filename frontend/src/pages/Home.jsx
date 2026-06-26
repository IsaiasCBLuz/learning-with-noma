import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import Sobre from '../components/sections/Sobre'
import Valores from '../components/sections/Valores'
import Turmas from '../components/sections/Turmas'
import AulaExperimental from '../components/sections/AulaExperimental'
import Planos from '../components/sections/Planos'
import Quiz from '../components/sections/Quiz'
import AreaAluno from '../components/sections/AreaAluno'
import TeacherJuli from '../components/sections/TeacherJuli'
import PoliticaPrivacidade from '../components/sections/PoliticaPrivacidade'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Sobre />
        <Valores />
        <Turmas />
        <AulaExperimental />
        <Planos />
        <Quiz />
        <AreaAluno />
        <TeacherJuli />
        <PoliticaPrivacidade />
      </main>
      <Footer />
    </>
  )
}

