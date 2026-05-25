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
import MetricCard from '../components/ui/MetricCard.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import Badge from '../components/ui/Badge.jsx';

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
  const completion = total > 0 ? 72 : 18;
  const greetingName = user?.email?.split('@')[0] || 'User';
  const stats = useMemo(
    () => [
      { label: 'Total CV', value: total, helper: 'Dokumen tersimpan', tone: 'blue' },
      {
        label: 'Update terakhir',
        value: latest ? formatDate(latest.createdAt) : '-',
        helper: 'Aktivitas terbaru',
        tone: 'emerald',
      },
      {
        label: 'Status akun',
        value: user?.email ? 'Aktif' : '-',
        helper: user?.email || 'Belum tersedia',
        tone: 'amber',
      },
    ],
    [latest, total, user],
  );

  return (
    <PageShell
      eyebrow="Dashboard"
      title={`Halo, ${greetingName}`}
      description="Workspace untuk membuat, merapikan, menyimpan, dan export CV profesional dari satu alur yang jelas."
      actions={
        <>
          <Button as={Link} to="/app/create">
            Buat CV Baru
          </Button>
          <Button as={Link} to="/app/portfolios" variant="secondary">
            Lihat Koleksi
          </Button>
        </>
      }
      className="space-y-6 pb-24"
    >
      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <SectionCard tone="light" className="overflow-hidden">
          <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge tone="teal">Rekomendasi langkah</Badge>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                Pilih jalur paling cepat untuk CV Anda.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                Upload CV lama untuk mengambil data, pilih template dengan preview sample, lalu
                rapikan bagian yang kurang sebelum export PDF.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} to="/app/create">
                  Import atau Buat Manual
                </Button>
                {latest && (
                  <Button
                    as={Link}
                    to={`/app/create/${latest.portfolioId || latest.id}`}
                    variant="secondary"
                  >
                    Lanjutkan CV Terakhir
                  </Button>
                )}
              </div>
            </div>
            <ProgressRing value={completion} label="Kesiapan workspace" />
          </div>
        </SectionCard>

        <SectionCard tone="light" className="p-5">
          <p className="text-sm font-semibold text-slate-500">Masuk sebagai</p>
          <div className="mt-2 break-all text-lg font-black">{user?.email}</div>
          <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
              Session aktif
            </div>
            <div className="mt-2 text-sm leading-relaxed text-emerald-900/75">
              Session aktif. Semua aksi penting tetap divalidasi backend.
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionCard tone="light" className="p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Alur CV</h2>
              <p className="text-sm text-slate-500">Gunakan sebagai checklist kerja.</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['Import data', 'Ambil informasi awal dari CV lama.'],
              ['Pilih template', 'Bandingkan ATS, modern, minimal, atau creative.'],
              ['Rapikan isi', 'Perbaiki headline, pengalaman, skill, dan project.'],
              ['Preview PDF', 'Cek tampilan sebelum download dan kirim.'],
            ].map(([title, desc], index) => (
              <div
                key={title}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <div className="font-bold">{title}</div>
                  <div className="mt-1 text-sm text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard tone="light" className="p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">CV Terbaru</h2>
              <p className="text-sm text-slate-500">Lanjutkan pekerjaan terakhir Anda.</p>
            </div>
            <Link
              to="/app/portfolios"
              className="text-sm font-bold text-blue-700 hover:text-blue-600"
            >
              Lihat semua
            </Link>
          </div>

          {notice && (
            <Alert tone="warning" className="mb-5">
              {notice}
            </Alert>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
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
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => {
                const portfolioId = item.portfolioId || item.id;
                return (
                  <article
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      {formatDate(item.createdAt)}
                    </div>
                    <h3 className="mt-2 line-clamp-1 font-extrabold">
                      {item.title || 'CV Tanpa Judul'}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {item.description || 'CV pribadi'}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        as={Link}
                        to={`/app/preview/${portfolioId}?mode=pdf`}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        Lihat
                      </Button>
                      <Button
                        as={Link}
                        to={`/app/create/${portfolioId}`}
                        size="sm"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </section>
    </PageShell>
  );
}
