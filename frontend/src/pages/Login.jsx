import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { resendVerification } from '../api';
import { useAuth } from '../auth/useAuth.js';
import AuthShell from '../components/ui/AuthShell.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import FormField from '../components/ui/FormField.jsx';

function authErrorMessage(error, status) {
  if (error === 'email not verified') {
    return 'Email belum diverifikasi. Silakan cek inbox atau kirim ulang email verifikasi.';
  }
  if (error === 'invalid credentials') {
    return 'Email atau password tidak sesuai.';
  }
  if (status === 429) {
    return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
  }
  return error || 'Gagal login.';
}

function verificationLoginMessage(data) {
  if (data?.email_delivery === 'sent') {
    return 'Email belum diverifikasi. Link verifikasi baru sudah dikirim, silakan cek inbox atau spam.';
  }
  if (data?.email_delivery === 'cooldown') {
    return `Email belum diverifikasi. Tunggu ${data.retry_after || 60} detik sebelum kirim ulang.`;
  }
  if (data?.email_delivery === 'failed') {
    return 'Email belum diverifikasi, dan pengiriman email belum berhasil. Cek konfigurasi email provider lalu kirim ulang.';
  }
  return authErrorMessage(data?.error, data?.status);
}

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
  const nextPath = useMemo(() => searchParams.get('next') || '/app', [searchParams]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setCanResend(false);
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data?.error) {
        setError(
          data.error === 'email not verified'
            ? verificationLoginMessage(data)
            : authErrorMessage(data.error, data.status),
        );
        if (data.error === 'email not verified') setCanResend(true);
      } else {
        navigate(nextPath);
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Masukkan email terlebih dahulu.');
      return;
    }
    const data = await resendVerification({ email });
    if (data?.error) {
      if (data.status === 429) {
        setError(
          `Mohon tunggu ${data.retry_after || 60} detik sebelum meminta email verifikasi lagi.`,
        );
      } else if (data.code === 'EMAIL_DELIVERY_FAILED' || data.email_delivery === 'failed') {
        setError(
          'Email verifikasi belum bisa dikirim. Pastikan provider email di Render benar, lalu coba lagi.',
        );
      } else {
        setError(data.error);
      }
    } else if (data?.email_delivery === 'sent') {
      setNotice('Email verifikasi baru sudah dikirim. Silakan cek inbox atau folder spam.');
    } else {
      setNotice('Jika akun perlu verifikasi, email verifikasi akan dikirim.');
    }
  };

  return (
    <AuthShell
      title="Masuk ke workspace"
      description="Lanjutkan CV yang tersimpan, pilih template, dan export dokumen dari dashboard Anda."
      asideTitle="Bangun CV seperti mengerjakan produk, bukan mengisi formulir tanpa arah."
      asideItems={[
        'Dashboard memberi langkah berikutnya setelah login.',
        'Draft tersimpan saat proses pembuatan CV.',
        'Template preview membantu memilih desain sebelum export.',
      ]}
    >
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <Alert tone="error">
            {error}
            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                className="mt-2 block font-semibold text-red-900 underline underline-offset-4"
              >
                Kirim ulang email verifikasi
              </button>
            )}
          </Alert>
        )}
        {notice && <Alert tone="success">{notice}</Alert>}

        <FormField id="login-email" label="Email" hint="Gunakan email yang dipakai saat daftar.">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="nama@email.com"
            className="field-control"
          />
        </FormField>

        <FormField id="login-password" label="Password">
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="field-control"
          />
        </FormField>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/app/register" className="font-bold text-blue-700 hover:text-blue-600">
            Daftar sekarang
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
