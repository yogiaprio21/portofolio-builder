import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

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

  const emailOk = useMemo(() => validateEmail(email), [email]);
  const passStrength = useMemo(() => strength(password), [password]);
  const passMatch = useMemo(() => password && password === confirm, [password, confirm]);

  useEffect(() => {
    setError('');
  }, [email, password, confirm]);

  const submit = async () => {
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
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white relative">
      {/* Decorative background element matching Login */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
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
              {loading ? 'Memproses…' : 'Daftar Sekarang'}
            </button>

            {verifyLink && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 mb-2 font-medium">
                  Verifikasi email Anda dengan membuka tautan ini:
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
        </div>
      </div>
    </div>
  );
}
