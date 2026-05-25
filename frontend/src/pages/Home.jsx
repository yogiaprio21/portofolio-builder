import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { listMyPortfolioItems } from '../api';
import { useAuth } from '../auth/useAuth.js';

function formatDate(value) {
  if (!value) return 'Belum tersedia';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return 'Belum tersedia';
  }
}

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const data = await listMyPortfolioItems({ limit: 4, offset: 0 });
      if (!active) return;
      if (data?.error) {
        setNotice(data.error);
        setItems([]);
        setTotal(0);
      } else {
        const rows = Array.isArray(data) ? data : data.items || [];
        setItems(rows);
        setTotal(Number.isInteger(data?.total) ? data.total : rows.length);
        setNotice('');
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const latest = items[0];
  const stats = useMemo(
    () => [
      { label: 'Total CV', value: total },
      { label: 'Terakhir dibuat', value: latest ? formatDate(latest.createdAt) : '-' },
      { label: 'Status akun', value: user?.email ? 'Aktif' : '-' },
    ],
    [latest, total, user],
  );

  return (
    <div className="min-h-[calc(100vh-76px)] bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 items-stretch">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-blue-300 mb-2">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Kelola CV Anda dengan lebih rapi.
            </h1>
            <p className="mt-3 max-w-2xl text-white/65">
              Buat, edit, preview, dan ekspor CV dari satu tempat. Data tersimpan di akun Anda dan
              bisa dilanjutkan kapan saja.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/app/create"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                Buat CV Baru
              </Link>
              <Link
                to="/app/portfolios"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
              >
                Lihat Koleksi
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-white/55">Masuk sebagai</p>
            <div className="mt-2 text-lg font-semibold break-all">{user?.email}</div>
            <div className="mt-6 grid gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/[0.04] p-4">
                  <div className="text-xs text-white/50">{stat.label}</div>
                  <div className="mt-1 text-xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {notice && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-200">
            {notice}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold">CV Terbaru</h2>
              <p className="text-sm text-white/55">Lanjutkan pekerjaan terakhir Anda.</p>
            </div>
            <Link to="/app/portfolios" className="text-sm text-blue-300 hover:text-blue-200">
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-40 rounded-xl bg-white/[0.06] animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
              <div className="text-lg font-semibold">Belum ada CV tersimpan.</div>
              <p className="mt-2 text-white/55">Mulai dari import CV lama atau isi form manual.</p>
              <Link
                to="/app/create"
                className="inline-flex mt-5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                Buat CV Pertama
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
                  <div className="text-sm text-white/50">{formatDate(item.createdAt)}</div>
                  <h3 className="mt-2 font-semibold line-clamp-1">{item.title || 'CV Tanpa Judul'}</h3>
                  <p className="mt-2 text-sm text-white/55 line-clamp-2">
                    {item.description || 'CV pribadi'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/app/preview/${item.portfolioId}?mode=pdf`}
                      className="flex-1 text-center rounded-lg bg-white/10 px-3 py-2 text-sm"
                    >
                      Lihat
                    </Link>
                    <Link
                      to={`/app/create/${item.portfolioId}`}
                      className="flex-1 text-center rounded-lg bg-blue-600 px-3 py-2 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
