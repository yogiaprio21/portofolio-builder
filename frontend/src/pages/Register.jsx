import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api'

function validateEmail(e) {
  return /\S+@\S+\.\S+/.test(e)
}
function strength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[a-z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 5)
}

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyLink, setVerifyLink] = useState('')

  const emailOk = useMemo(() => validateEmail(email), [email])
  const passStrength = useMemo(() => strength(password), [password])
  const passMatch = useMemo(() => password && password === confirm, [password, confirm])

  useEffect(() => {
    setError('')
  }, [email, password, confirm])

  const submit = async () => {
    if (!emailOk) { setError('Format email tidak valid'); return }
    if (passStrength < 3) { setError('Password terlalu lemah'); return }
    if (!passMatch) { setError('Konfirmasi password tidak cocok'); return }
    setLoading(true)
    try {
      const data = await register({ email, password })
      if (data?.error) {
        setError(data.error || 'Gagal register')
      } else {
        setVerifyLink(data.verification_url || '')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-24 text-white max-w-md">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="register-email" className="block text-sm">Email</label>
          <input
            id="register-email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            aria-invalid={Boolean(email && !emailOk)}
            className={`w-full px-3 py-2 rounded-lg bg-white/10 border ${email && !emailOk ? 'border-red-400' : 'border-white/20'}`}
          />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            aria-invalid={Boolean(password && passStrength < 3)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
          />
          <div className="h-2 rounded bg-white/10 mt-2">
            <div className={`h-2 rounded ${passStrength<=2?'bg-red-500':passStrength===3?'bg-yellow-500':'bg-green-500'}`} style={{ width: `${(passStrength/5)*100}%` }} />
          </div>
          <div className="text-xs opacity-80 mt-1">Gunakan huruf besar/kecil, angka, dan simbol.</div>
        </div>
        <div>
          <label htmlFor="register-confirm" className="block text-sm">Konfirmasi Password</label>
          <input
            id="register-confirm"
            type="password"
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
            aria-invalid={Boolean(confirm && !passMatch)}
            className={`w-full px-3 py-2 rounded-lg bg-white/10 border ${confirm && !passMatch ? 'border-red-400' : 'border-white/20'}`}
          />
        </div>
        {error && <div className="text-red-300 text-sm" aria-live="polite">{error}</div>}
        <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-lg ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? 'Memproses…' : 'Daftar'}
        </button>
        {verifyLink && (
          <div className="mt-4 text-sm">
            Verifikasi email Anda dengan membuka tautan ini:
            <div className="mt-1 break-all"><a href={verifyLink} className="text-blue-300 underline">{verifyLink}</a></div>
            <div className="mt-3">
              <button onClick={()=>navigate('/app/login')} className="px-3 py-2 rounded bg-slate-600">Ke Login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
