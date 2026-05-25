import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { register } from '../api';
import AuthShell from '../components/ui/AuthShell.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import FormField from '../components/ui/FormField.jsx';

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function strength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
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
  const strengthLabel = ['Kosong', 'Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][
    passStrength
  ];

  useEffect(() => {
    setError('');
  }, [email, password, confirm]);

  const submit = async (event) => {
    event.preventDefault();
    if (!emailOk) {
      setError('Format email tidak valid.');
      return;
    }
    if (passStrength < 3) {
      setError(
        'Password terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi angka dan huruf.',
      );
      return;
    }
    if (!passMatch) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ email, password });
      if (data?.error) {
        setError(data.error || 'Gagal register.');
      } else {
        setVerifyLink(data.verification_url || '');
        setSuccessMessage(
          data.verification_url
            ? 'Akun dibuat. Gunakan tautan verifikasi berikut untuk development.'
            : data.message || 'Akun dibuat. Silakan cek email Anda untuk verifikasi.',
        );
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun PortoBuilder"
      description="Mulai dari template, import CV lama, lalu rapikan isi dengan alur bertahap."
      asideTitle="Workspace CV yang memandu user dari kosong sampai siap export."
      asideItems={[
        'Akun menyimpan koleksi CV dan item portfolio.',
        'Email verification menjaga akun tetap aman.',
        'Cloud upload, AI, dan template sudah disiapkan untuk production.',
      ]}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        {successMessage && (
          <Alert tone="success">
            {successMessage}
            {verifyLink && (
              <a href={verifyLink} className="mt-2 block break-all font-semibold underline">
                {verifyLink}
              </a>
            )}
          </Alert>
        )}

        <FormField
          id="register-email"
          label="Email"
          error={email && !emailOk ? 'Format email belum valid.' : ''}
        >
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="nama@email.com"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </FormField>

        <FormField
          id="register-password"
          label="Password"
          hint="Minimal 8 karakter, lebih baik dengan angka dan simbol."
        >
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Buat password"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all ${
                  passStrength <= 2
                    ? 'bg-red-500'
                    : passStrength === 3
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                }`}
                style={{ width: `${(passStrength / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500">{strengthLabel}</span>
          </div>
        </FormField>

        <FormField
          id="register-confirm"
          label="Konfirmasi password"
          error={confirm && !passMatch ? 'Password belum sama.' : ''}
        >
          <input
            id="register-confirm"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            placeholder="Ulangi password"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </FormField>

        <Button
          type="submit"
          disabled={loading || Boolean(successMessage)}
          className="w-full"
          size="lg"
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </Button>

        {successMessage ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/app/login')}
            className="w-full"
          >
            Lanjut ke Login
          </Button>
        ) : (
          <p className="text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/app/login" className="font-bold text-blue-700 hover:text-blue-600">
              Masuk
            </Link>
          </p>
        )}
      </form>
    </AuthShell>
  );
}
