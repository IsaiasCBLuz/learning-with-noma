import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLogin() {
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
      const user = await login(username.trim(), password)
      if (user.role !== 'admin') {
        setError('Acesso restrito a administradores.')
        return
      }
      navigate('/admin/dashboard')
    } catch {
      setError('Usuário ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-dark flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-5 border-b border-[rgba(245,239,228,0.1)]">
        <Link to="/">
          <img src="/images/logo.jpeg" alt="NOMA" className="h-10 object-contain opacity-90" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[0.72rem] tracking-[0.22em] text-gold uppercase font-medium block mb-3 text-center">
            Painel Administrativo
          </p>
          <h1 className="font-serif text-[2.4rem] font-semibold text-cream text-center leading-[1.1] mb-2">
            Acesso restrito
          </h1>
          <p className="text-[0.9rem] text-[rgba(245,239,228,0.55)] text-center mb-8">
            Apenas administradores NOMA.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Usuário"
              autoComplete="username"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(245,239,228,0.2)] text-[0.9rem] bg-[rgba(245,239,228,0.07)] text-cream outline-none focus:border-[rgba(245,239,228,0.5)] font-sans placeholder:text-[rgba(245,239,228,0.35)] transition-colors"
            />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Senha"
              autoComplete="current-password"
              className="w-full px-4 py-[10px] rounded-[12px] border-[1.5px] border-[rgba(245,239,228,0.2)] text-[0.9rem] bg-[rgba(245,239,228,0.07)] text-cream outline-none focus:border-[rgba(245,239,228,0.5)] font-sans placeholder:text-[rgba(245,239,228,0.35)] transition-colors"
            />

            {error && (
              <p className="text-[0.8rem] text-[#e07070]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3 bg-gold text-green-dark rounded-full text-[0.95rem] font-medium border-none cursor-pointer font-sans transition-colors hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link to="/" className="text-[0.85rem] text-[rgba(245,239,228,0.4)] no-underline hover:text-cream transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
