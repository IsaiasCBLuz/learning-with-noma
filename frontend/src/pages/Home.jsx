import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import Sobre from '../components/sections/Sobre'
import Valores from '../components/sections/Valores'
import Turmas from '../components/sections/Turmas'
import AulaExperimental from '../components/sections/AulaExperimental'
import Planos from '../components/sections/Planos'
import Quiz from '../components/sections/Quiz'
import StudentArea from '../components/sections/StudentArea'
import TeacherJuli from '../components/sections/TeacherJuli'
import Politica from '../components/sections/Politica'
import AdminPanel from '../components/sections/AdminPanel'

export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false)

  return (
    <>
      <Navbar onAdminTrigger={() => setAdminOpen(true)} />
      <Hero />
      <Sobre />
      <Valores />
      <Turmas />
      <AulaExperimental />
      <Planos />
      <Quiz />
      <StudentArea />
      <TeacherJuli />
      <Politica />
      <Footer />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  )
}
