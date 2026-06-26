import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const { login, updateUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.must_change_password) {
        setShowChangePw(true)
        setLoading(false)
        return
      }
      navigate(user.role === 'admin' ? '/admin/agenda' : '/aluno/agenda')
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePw(e) {
    e.preventDefault()
    if (newPw.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (newPw !== confirmPw) { setError('Senhas não coincidem'); return }
    setLoading(true)
    try {
      const res = await api.post('/users/change-password', { new_password: newPw })
      updateUser(res.data)
      navigate(res.data.role === 'admin' ? '/admin/agenda' : '/aluno/agenda')
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-card">
        <div className="login-header">
          <img src="/images/logo.png" alt="NOMA" className="login-logo" />
          <p className="login-label">NOMA English School</p>
        </div>

        {!showChangePw ? (
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Entrar</h2>
            <p className="login-subtitle">Acesse seu portal</p>

            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label>Usuário ou e-mail</label>
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="seu.usuario"
                autoComplete="username" required
              />
            </div>

            <div className="login-field">
              <label>Senha</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password" required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePw} className="login-form">
            <h2 className="login-title">Nova Senha</h2>
            <p className="login-subtitle">Crie sua senha pessoal</p>

            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label>Nova senha</label>
              <input
                type="password" value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Mínimo 8 caracteres" required
              />
            </div>

            <div className="login-field">
              <label>Confirmar senha</label>
              <input
                type="password" value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Digite novamente" required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar e entrar →'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="/">← Voltar ao site</a>
        </div>
      </div>
    </div>
  )
}
