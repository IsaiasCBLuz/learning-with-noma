import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function StudentLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) { setError('Preencha usuário e senha.'); return }
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
      navigate('/aluno/dashboard')
    } catch {
      setError('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-5 border-b border-[rgba(74,94,58,0.12)]">
        <Link to="/">
          <img src="/images/logo.jpeg" alt="NOMA" className="h-10 object-contain" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[0.72rem] tracking-[0.22em] text-gold uppercase font-medium block mb-3 text-center">
            Área do Aluno
          </p>
          <h1 className="font-serif text-[2.4rem] font-semibold text-green-dark text-center leading-[1.1] mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-[0.9rem] text-muted text-center mb-8">
            Entre com seus dados para agendar suas aulas.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Usuário"
              autoComplete="username"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(74,94,58,0.3)] text-[0.9rem] bg-white text-green-dark outline-none focus:border-green font-sans placeholder:text-muted transition-colors"
            />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Senha"
              autoComplete="current-password"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(74,94,58,0.3)] text-[0.9rem] bg-white text-green-dark outline-none focus:border-green font-sans placeholder:text-muted transition-colors"
            />

            {error && (
              <p className="text-[0.8rem] text-[#c0392b]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 bg-green text-cream rounded-full text-[0.95rem] font-medium border-none cursor-pointer font-sans transition-colors hover:bg-green-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-[0.72rem] text-muted mt-4 leading-[1.6] text-center">
            Ao entrar, você concorda com a{' '}
            <Link to="/#politica-privacidade" className="text-green no-underline hover:underline">
              política de privacidade da NOMA
            </Link>.
          </p>

          <div className="text-center mt-8">
            <Link to="/" className="text-[0.85rem] text-muted no-underline hover:text-green transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
