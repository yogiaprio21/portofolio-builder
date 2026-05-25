import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyPortfolioItems, deletePortfolioItem, getStoredToken } from '../api';
import Button from '../components/ui/Button.jsx';
import PageShell from '../components/ui/PageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';
import Badge from '../components/ui/Badge.jsx';

function getGradientFromText(text) {
  const gradients = [
    'from-blue-600 to-cyan-400',
    'from-emerald-600 to-teal-400',
    'from-slate-800 to-blue-700',
    'from-violet-600 to-blue-500',
    'from-amber-500 to-red-500',
    'from-fuchsia-600 to-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

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

function PortfolioCover({ item }) {
  const title = item.title || 'CV Tanpa Judul';
  const displayImage = item.image_url || item.imageUrl;
  const gradientClass = getGradientFromText(title + item.id);
  const initial = title.charAt(0).toUpperCase();

  if (displayImage) {
    return <img alt={title} src={displayImage} className="h-44 w-full object-cover" />;
  }

  return (
    <div className={`h-44 w-full bg-gradient-to-br ${gradientClass} p-4`}>
      <div className="h-full rounded-xl bg-white/95 p-4 text-slate-900 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="min-w-0">
            <div className="line-clamp-2 text-lg font-black leading-tight">{title}</div>
            <div className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-black">
            {initial}
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded bg-slate-200" />
          <div className="h-2 w-4/5 rounded bg-slate-200" />
          <div className="mt-4 h-2 w-1/2 rounded bg-slate-300" />
          <div className="h-2 w-3/4 rounded bg-slate-200" />
          <div className="h-2 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function PortfolioList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => items, [items]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const data = await listMyPortfolioItems({ q, limit: pageSize, offset });
      if (data?.error) {
        setNotice(data.error || 'Gagal memuat data portofolio Anda.');
        setItems([]);
        setTotal(0);
      } else {
        setNotice('');
        const rawItems = Array.isArray(data.items) ? data.items : [];
        setItems(Array.isArray(data) ? data : rawItems);
        setTotal(Number.isInteger(data.total) ? data.total : rawItems.length);
      }
    } catch {
      setNotice('Terjadi kesalahan koneksi.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = getStoredToken();
    if (!token) {
      setNotice('Anda harus login untuk menghapus portofolio.');
      return;
    }

    setLoading(true);
    try {
      const res = await deletePortfolioItem(deleteTarget.id, token);
      if (res?.error) {
        setNotice(res.error || 'Gagal menghapus portofolio.');
      } else {
        setDeleteTarget(null);
        load();
      }
    } catch {
      setNotice('Terjadi kesalahan koneksi saat menghapus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Koleksi CV"
      title="Semua dokumen yang sedang Anda bangun"
      description="Cari, lanjutkan edit, preview PDF, atau hapus CV yang sudah tidak dipakai."
      actions={
        <Button type="button" onClick={() => navigate('/app/create')}>
          Buat CV Baru
        </Button>
      }
      className="pb-24"
    >
      <section className="mb-5 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="portfolio-search" className="mb-2 block text-sm font-bold text-slate-700">
            Cari CV
          </label>
          <input
            id="portfolio-search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Cari berdasarkan judul atau deskripsi"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setQ('')}>
            Reset
          </Button>
        </div>
      </section>

      {notice && (
        <Alert tone="warning" className="mb-6">
          {notice}
        </Alert>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">{total} CV tersimpan</Badge>
          <Badge tone="slate">
            Halaman {page} dari {totalPages}
          </Badge>
        </div>
        {total > 0 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
            >
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage((value) => (value < totalPages ? value + 1 : value))}
              disabled={page * pageSize >= total}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} className="h-96" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={q ? 'Tidak ada hasil pencarian.' : 'Anda belum memiliki CV.'}
          description={
            q
              ? 'Coba gunakan kata kunci lain atau reset pencarian.'
              : 'Koleksi Anda masih kosong. Mulai buat CV pertama dengan template dan bantuan AI.'
          }
          actionLabel={q ? 'Reset Pencarian' : 'Buat CV Sekarang'}
          onAction={q ? () => setQ('') : () => navigate('/app/create')}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const title = item.title || 'CV Tanpa Judul';
            const portfolioId = item.portfolioId || item.id;
            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl"
              >
                <PortfolioCover item={item} />
                <div className="flex min-h-52 flex-col p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                    {formatDate(item.createdAt)}
                  </div>
                  <h2 className="line-clamp-1 text-lg font-black">{title}</h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                    {item.description || 'CV pribadi'}
                  </p>
                  <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Button
                      as={Link}
                      to={`/app/preview/${portfolioId}?mode=pdf`}
                      variant="secondary"
                      size="sm"
                    >
                      Lihat
                    </Button>
                    <Button as={Link} to={`/app/create/${portfolioId}`} size="sm">
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      aria-label={`Hapus ${title}`}
                      onClick={() => setDeleteTarget({ id: item.id, title })}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus CV?"
        description={
          deleteTarget ? `CV "${deleteTarget.title}" akan dihapus permanen dari koleksi Anda.` : ''
        }
        confirmLabel="Hapus"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}
