import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setError('');
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data?.error) {
        setError(data.error || 'Gagal login');
      } else {
        window.localStorage.setItem('ACCESS_TOKEN', data.token);
        window.localStorage.setItem('USER', JSON.stringify(data.user));
        navigate('/app/portfolios');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white relative">
      {/* Optional decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Selamat Datang Kembali</h1>
            <p className="text-white/60 text-sm">Silakan masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-1.5 text-white/80"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/30"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium mb-1.5 text-white/80"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/30"
              />
            </div>

            {error && (
              <div
                className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full py-3.5 mt-2 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
            >
              {loading ? 'Memproses…' : 'Masuk'}
            </button>

            <div className="text-center mt-6 text-sm text-white/60">
              Belum punya akun?{' '}
              <a
                href="/app/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/app/register');
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Daftar di sini
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
