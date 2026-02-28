import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async () => {
    setError('')
    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const data = await login({ email, password })
      if (data?.error) {
        setError(data.error || 'Gagal login')
      } else {
        window.localStorage.setItem('ACCESS_TOKEN', data.token)
        window.localStorage.setItem('USER', JSON.stringify(data.user))
        navigate('/app/portfolios')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-24 text-white max-w-md">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm">Email</label>
          <input
            id="login-email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            aria-invalid={Boolean(error)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
          />
        </div>
        {error && <div className="text-red-300 text-sm" aria-live="polite">{error}</div>}
        <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-lg ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </div>
    </div>
  )
}
