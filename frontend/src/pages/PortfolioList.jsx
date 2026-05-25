import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyPortfolioItems, deletePortfolioItem } from '../api';
import Button from '../components/ui/Button.jsx';
import PageShell from '../components/ui/PageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import SkeletonCard from '../components/ui/SkeletonCard.jsx';

// Helper to generate a consistent gradient color based on a string (like a title or ID)
function getGradientFromText(text) {
  const gradients = [
    'from-rose-400 to-orange-300',
    'from-emerald-400 to-cyan-400',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-fuchsia-500 to-pink-500',
    'from-teal-400 to-emerald-500',
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
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
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
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
      eyebrow="Koleksi"
      title="Koleksi CV Saya"
      description="Cari, lanjutkan edit, preview, atau hapus CV yang sudah tersimpan."
      actions={<Button type="button" onClick={() => navigate('/app/create')}>Buat CV Baru</Button>}
      className="pb-24"
    >

      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.05] p-4">
        <label htmlFor="portfolio-search" className="mb-2 block text-sm font-medium text-white/75">
          Cari CV
        </label>
        <input
          id="portfolio-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari CV berdasarkan judul atau deskripsi…"
          className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 outline-none transition placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>

      {notice && <Alert tone="warning" className="mb-6">{notice}</Alert>}

      {total > 0 && (
        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="opacity-70 font-medium">
            Menampilkan {filtered.length} dari {total} CV
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-4 py-1.5 rounded-lg transition-colors ${page <= 1 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Sebelumnya
            </button>
            <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              Hal {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page * pageSize >= total}
              className={`px-4 py-1.5 rounded-lg transition-colors ${page * pageSize >= total ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} className="h-80" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={q ? 'Tidak ada hasil pencarian.' : 'Anda belum memiliki CV.'}
          description={q ? 'Coba gunakan kata kunci lain atau reset pencarian.' : 'Koleksi Anda masih kosong. Mulai buat CV pertama dengan template dan bantuan AI.'}
          actionLabel={q ? 'Reset Pencarian' : 'Buat CV Sekarang'}
          onAction={q ? () => setQ('') : () => navigate('/app/create')}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((it) => {
            const title = it.title || 'CV Tanpa Judul';
            const displayImage = it.image_url || it.imageUrl;
            const gradientClass = getGradientFromText(title + it.id);
            const initial = title.charAt(0).toUpperCase();

            return (
              <div
                key={it.id}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Auto-Generated Covers vs Image */}
                {displayImage ? (
                  <img
                    alt={title}
                    src={displayImage}
                    className="w-full h-48 object-cover border-b border-white/10"
                  />
                ) : (
                  <div className={`h-48 w-full bg-gradient-to-br ${gradientClass} p-5`}>
                    <div className="h-full rounded-lg bg-white/90 p-4 text-slate-800 shadow-xl">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <div className="text-lg font-bold leading-tight">{title}</div>
                          <div className="text-xs text-slate-500">{formatDate(it.createdAt)}</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold">
                          {initial}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-slate-200" />
                        <div className="h-2 w-4/5 rounded bg-slate-200" />
                        <div className="mt-4 h-2 w-1/2 rounded bg-slate-300" />
                        <div className="h-2 w-3/4 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-grow">
                  <div className="font-bold text-lg mb-1 line-clamp-1">{title}</div>
                  <div className="text-sm text-white/60 line-clamp-2 mb-6 flex-grow">
                    {it.description || 'CV Pribadi'}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link
                      to={`/app/preview/${it.portfolioId}?mode=pdf`}
                      className="flex-1 text-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
                    >
                      Lihat
                    </Link>
                    <Link
                      to={`/app/create/${it.portfolioId}`}
                      className="flex-1 text-center px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ id: it.id, title })}
                      className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-sm font-semibold transition-all"
                      title="Hapus Portofolio"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus CV?"
        description={deleteTarget ? `CV "${deleteTarget.title}" akan dihapus permanen dari koleksi Anda.` : ''}
        confirmLabel="Hapus"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}
