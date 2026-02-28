import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyPortfolioItems, deletePortfolioItem } from '../api';

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

export default function PortfolioList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  const filtered = useMemo(() => items, [items]);

  useEffect(() => {
    // ENFORCE LOGIN: Bounce unauthenticated users immediately
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
    if (!token) {
      navigate('/app/login?next=/app/portfolios');
    }
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      // STRICTLY fetch only the logged-in user's private items
      const data = await listMyPortfolioItems({ limit: pageSize, offset });
      if (data?.error) {
        setNotice(data.error || 'Gagal memuat data portofolio Anda.');
        setItems([]);
        setTotal(0);
      } else if (Array.isArray(data)) {
        setNotice('');

        // Frontend filtering for search query `q` on private feed
        const searchFiltered = q
          ? data.filter(
              (it) =>
                (it.title && it.title.toLowerCase().includes(q.toLowerCase())) ||
                (it.description && it.description.toLowerCase().includes(q.toLowerCase())),
            )
          : data;

        setItems(searchFiltered);
        setTotal(searchFiltered.length);
      } else {
        setNotice('');

        const rawItems = Array.isArray(data.items) ? data.items : [];
        const searchFiltered = q
          ? rawItems.filter(
              (it) =>
                (it.title && it.title.toLowerCase().includes(q.toLowerCase())) ||
                (it.description && it.description.toLowerCase().includes(q.toLowerCase())),
            )
          : rawItems;

        setItems(searchFiltered);
        setTotal(q ? searchFiltered.length : Number.isInteger(data.total) ? data.total : 0);
      }
    } catch (err) {
      setNotice('Terjadi kesalahan koneksi.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
    if (token) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const handleDelete = async (id, title) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
    if (!token) {
      setNotice('Anda harus login untuk menghapus portofolio.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus CV "${title}" secara permanen?`)) {
      setLoading(true);
      try {
        const res = await deletePortfolioItem(id, token);
        if (res?.error) {
          setNotice(res.error || 'Gagal menghapus portofolio.');
        } else {
          load();
        }
      } catch (err) {
        setNotice('Terjadi kesalahan koneksi saat menghapus.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 pt-8 pb-24 text-white">
      <div className="flex items-center justify-between mb-8" ref={pageRef}>
        <h1 className="text-3xl font-extrabold tracking-tight">Koleksi CV Saya</h1>
        <button
          onClick={() => navigate('/app/create')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
        >
          + Buat CV Baru
        </button>
      </div>

      <div className="mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari CV berdasarkan judul atau deskripsi…"
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/40"
        />
      </div>

      {notice && (
        <div
          className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-medium"
          aria-live="polite"
        >
          {notice}
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="opacity-70 font-medium">Menampilkan {total} CV</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-4 py-1.5 rounded-lg transition-colors ${page <= 1 ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Sebelumnya
            </button>
            <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              Hal {page}
            </div>
            <button
              onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
              disabled={page * pageSize >= total}
              className={`px-4 py-1.5 rounded-lg transition-colors ${page * pageSize >= total ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="text-xl font-bold mb-2">Anda belum memiliki CV.</div>
          <div className="text-white/60 mb-6">
            Koleksi Anda masih kosong. Mulai buat CV pertama Anda dengan bantuan AI sekarang!
          </div>
          <div className="flex justify-center gap-4">
            {q && (
              <button
                onClick={() => {
                  setQ('');
                  setNotice('');
                }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium"
              >
                Reset Pencarian
              </button>
            )}
            <button
              onClick={() => navigate('/app/create')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all font-medium"
            >
              Buat CV Sekarang
            </button>
          </div>
        </div>
      ) : (
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <div
                    className={`w-full h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center border-b border-white/10 relative overflow-hidden`}
                  >
                    <span className="text-7xl font-bold text-white/30 drop-shadow-xl z-10">
                      {initial}
                    </span>
                    <div className="absolute inset-0 bg-black/10 z-0 mix-blend-overlay"></div>
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
                      onClick={() => handleDelete(it.id, title)}
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
    </div>
  );
}
