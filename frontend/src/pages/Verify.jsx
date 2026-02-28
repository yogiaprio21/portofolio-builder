import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail } from '../api';

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

  return (
    <div className="container mx-auto px-6 pt-8 pb-24 text-white max-w-md">
      <h1 className="text-2xl font-bold mb-6">Verifikasi Email</h1>
      {status === 'pending' && <div>Memverifikasi…</div>}
      {status === 'missing' && <div>Token tidak ditemukan</div>}
      {status === 'error' && <div>Verifikasi gagal</div>}
      {status === 'ok' && (
        <div>
          <div className="mb-4">Verifikasi berhasil. Silakan login.</div>
          <button onClick={() => navigate('/app/login')} className="px-4 py-2 rounded bg-blue-600">
            Ke Login
          </button>
        </div>
      )}
    </div>
  );
}
