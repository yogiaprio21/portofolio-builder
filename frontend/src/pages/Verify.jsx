import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail } from '../api';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

export default function Verify() {
  const [status, setStatus] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    if (!token) {
      setTimeout(() => setStatus('missing'), 0);
      return;
    }
    verifyEmail(token)
      .then((data) => {
        if (data?.error) throw new Error('failed');
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  const content = {
    pending: [
      'Memverifikasi email',
      'Tunggu sebentar, kami sedang mencocokkan token verifikasi Anda.',
    ],
    missing: [
      'Token tidak ditemukan',
      'Buka tautan verifikasi langsung dari email yang dikirimkan.',
    ],
    error: [
      'Verifikasi gagal',
      'Token mungkin sudah kedaluwarsa. Silakan login lalu kirim ulang email verifikasi.',
    ],
    ok: ['Verifikasi berhasil', 'Email Anda sudah aktif. Silakan masuk untuk mulai membuat CV.'],
  }[status];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-lg items-center px-4 py-10 text-slate-950">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-black text-blue-700">
          {status === 'ok' ? '✓' : status === 'pending' ? '…' : '!'}
        </div>
        <h1 className="text-2xl font-bold">{content[0]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{content[1]}</p>
        {status === 'pending' && (
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
          </div>
        )}
        {status === 'missing' && (
          <Alert tone="warning" className="mt-6">
            Token verifikasi tidak tersedia di URL.
          </Alert>
        )}
        {status === 'error' && (
          <Alert tone="error" className="mt-6">
            Verifikasi gagal atau token sudah tidak berlaku.
          </Alert>
        )}
        {status !== 'pending' && (
          <Button type="button" onClick={() => navigate('/app/login')} className="mt-6 w-full">
            Ke Login
          </Button>
        )}
      </section>
    </div>
  );
}
