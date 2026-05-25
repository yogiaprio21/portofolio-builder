import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resendVerification } from '../api';
import { useAuth } from '../auth/useAuth.js';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const submit = async (event) => {
    event?.preventDefault();
    setError('');
    setNotice('');
    setCanResend(false);
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data?.error) {
        setError(data.error || 'Gagal login');
        if (data.error === 'email not verified') setCanResend(true);
      } else {
        navigate(searchParams.get('next') || '/app/portfolios');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Masukkan email terlebih dahulu');
      return;
    }
    const data = await resendVerification({ email });
    if (data?.error) setError(data.error);
    else setNotice('Jika akun perlu verifikasi, email verifikasi sudah dikirim.');
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center p-4 text-white sm:p-6">
      <div className="w-full max-w-md relative">
        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl sm:p-8">
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
              <Alert tone="error">
                {error}
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="block mt-2 text-blue-300 underline underline-offset-4"
                  >
                    Kirim ulang email verifikasi
                  </button>
                )}
              </Alert>
            )}
            {notice && <Alert tone="success">{notice}</Alert>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full"
              size="lg"
            >
              {loading ? 'Memproses…' : 'Masuk'}
            </Button>

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
        </form>
      </div>
    </div>
  );
}
