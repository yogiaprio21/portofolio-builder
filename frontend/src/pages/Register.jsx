import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

function validateEmail(e) {
  return /\S+@\S+\.\S+/.test(e);
}
function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLink, setVerifyLink] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const emailOk = useMemo(() => validateEmail(email), [email]);
  const passStrength = useMemo(() => strength(password), [password]);
  const passMatch = useMemo(() => password && password === confirm, [password, confirm]);

  useEffect(() => {
    setError('');
  }, [email, password, confirm]);

  const submit = async (event) => {
    event?.preventDefault();
    if (!emailOk) {
      setError('Format email tidak valid');
      return;
    }
    if (passStrength < 3) {
      setError('Password terlalu lemah');
      return;
    }
    if (!passMatch) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ email, password });
      if (data?.error) {
        setError(data.error || 'Gagal register');
      } else {
        setVerifyLink(data.verification_url || '');
        setSuccessMessage(
          data.verification_url
            ? 'Akun dibuat. Gunakan tautan verifikasi berikut untuk development.'
            : data.message || 'Akun dibuat. Silakan cek email Anda untuk verifikasi.',
        );
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center p-4 text-white sm:p-6">
      <div className="w-full max-w-md relative">
        <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Buat Akun Baru</h1>
            <p className="text-white/60 text-sm">Bergabunglah dan mulai bangun portfolio Anda</p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium mb-1.5 text-white/80"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(email && !emailOk)}
                placeholder="nama@email.com"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 outline-none transition-all placeholder:text-white/30 ${
                  email && !emailOk
                    ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium mb-1.5 text-white/80"
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(password && passStrength < 3)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 outline-none transition-all placeholder:text-white/30 ${
                  password && passStrength < 3
                    ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {/* Modernized Password Strength Indicator */}
              <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    passStrength <= 2
                      ? 'bg-red-500'
                      : passStrength === 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(passStrength / 5) * 100}%` }}
                />
              </div>
              <div className="text-xs text-white/50 mt-2 font-medium">
                Gunakan huruf besar/kecil, angka, dan simbol.
              </div>
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-sm font-medium mb-1.5 text-white/80"
              >
                Konfirmasi Password
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={Boolean(confirm && !passMatch)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 outline-none transition-all placeholder:text-white/30 ${
                  confirm && !passMatch
                    ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
            </div>

            {error && <Alert tone="error">{error}</Alert>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full"
              size="lg"
            >
              {loading ? 'Memproses…' : 'Daftar Sekarang'}
            </Button>

            {verifyLink && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 mb-2 font-medium">
                  {successMessage}
                </p>
                <a
                  href={verifyLink}
                  className="text-sm text-blue-400 hover:text-blue-300 underline break-all font-medium transition-colors"
                >
                  {verifyLink}
                </a>
                <button
                  onClick={() => navigate('/app/login')}
                  className="w-full mt-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Lanjut ke Login
                </button>
              </div>
            )}

            {successMessage && !verifyLink && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 mb-3 font-medium">{successMessage}</p>
                <button
                  onClick={() => navigate('/app/login')}
                  className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Lanjut ke Login
                </button>
              </div>
            )}

            {!verifyLink && (
              <div className="text-center mt-6 text-sm text-white/60">
                Sudah punya akun?{' '}
                <a
                  href="/app/login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/app/login');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Masuk di sini
                </a>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
