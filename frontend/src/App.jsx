import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import AlunoLayout from './pages/aluno/AlunoLayout'
import MinhaAgenda from './pages/aluno/MinhaAgenda'
import Avaliacoes from './pages/aluno/Avaliacoes'
import MeusPlanos from './pages/aluno/MeusPlanos'
import Pagamentos from './pages/aluno/Pagamentos'
import AdminLayout from './pages/admin/AdminLayout'
import Agenda from './pages/admin/Agenda'
import Alunos from './pages/admin/Alunos'
import AlunoDetalhe from './pages/admin/AlunoDetalhe'
import CriarAvaliacao from './pages/admin/CriarAvaliacao'
import Financeiro from './pages/admin/Financeiro'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="loader-spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/agenda' : '/aluno/agenda'} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Portal do Aluno */}
      <Route path="/aluno" element={
        <ProtectedRoute role="student"><AlunoLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<MinhaAgenda />} />
        <Route path="avaliacoes" element={<Avaliacoes />} />
        <Route path="planos" element={<MeusPlanos />} />
        <Route path="pagamentos" element={<Pagamentos />} />
      </Route>

      {/* Painel Admin */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="agenda" replace />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="alunos/:id" element={<AlunoDetalhe />} />
        <Route path="avaliacoes" element={<CriarAvaliacao />} />
        <Route path="financeiro" element={<Financeiro />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
