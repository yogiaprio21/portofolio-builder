import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { listMyPortfolioItems } from '../api';
import { useAuth } from '../auth/useAuth.js';
import Button from '../components/ui/Button.jsx';
import PageShell from '../components/ui/PageShell.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';

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
    <div className="min-h-[calc(100vh-68px)] bg-slate-950 text-white">
      <PageShell
        eyebrow="Dashboard"
        title="Kelola CV Anda dengan lebih rapi."
        description="Buat, edit, preview, dan ekspor CV dari satu tempat. Data tersimpan di akun Anda dan bisa dilanjutkan kapan saja."
        actions={
          <>
            <Button as={Link} to="/app/create">Buat CV Baru</Button>
            <Button as={Link} to="/app/portfolios" variant="secondary">Lihat Koleksi</Button>
          </>
        }
        className="space-y-8"
      >
        <section className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 items-stretch">
          <SectionCard className="p-6">
            <h2 className="text-xl font-bold">Langkah berikutnya</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['Import', 'Ambil data dari CV lama'],
                ['Rapikan', 'Isi section yang penting'],
                ['Export', 'Preview dan download PDF'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-white/55">{desc}</div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard className="p-6">
            <p className="text-sm text-white/55">Masuk sebagai</p>
            <div className="mt-2 text-lg font-semibold break-all">{user?.email}</div>
            <div className="mt-6 grid gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white/[0.04] p-4">
                  <div className="text-xs text-white/50">{stat.label}</div>
                  <div className="mt-1 text-xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        {notice && <Alert tone="warning">{notice}</Alert>}

        <SectionCard className="p-6">
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
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Belum ada CV tersimpan."
              description="Mulai dari import CV lama atau isi form manual. Anda bisa memilih template sebelum menyimpan."
              actionLabel="Buat CV Pertama"
              actionTo="/app/create"
            />
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
        </SectionCard>
      </PageShell>
    </div>
  );
}
