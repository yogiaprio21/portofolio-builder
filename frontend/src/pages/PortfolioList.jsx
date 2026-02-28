import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listMyPortfolioItems, listPortfolioItems } from "../api";
import { generateA4PdfFromCards } from "../utils/pdfGenerator";

export default function PortfolioList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const gridRef = useRef(null);

  const filtered = useMemo(() => items, [items]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const data = mineOnly
          ? await listMyPortfolioItems({ limit: pageSize, offset })
          : await listPortfolioItems({ q, limit: pageSize, offset });
        if (data?.error) {
          setNotice(data.error || "Gagal memuat data");
          setItems([]);
          setTotal(0);
        } else if (Array.isArray(data)) {
          setNotice("");
          setItems(data);
          setTotal(data.length);
        } else {
          setNotice("");
          setItems(Array.isArray(data.items) ? data.items : []);
          setTotal(Number.isInteger(data.total) ? data.total : 0);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [q, mineOnly, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q, mineOnly]);

  return (
    <div className="container mx-auto px-6 py-24 text-white">
      <div className="flex items-center justify-between mb-6" ref={pageRef}>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button
          onClick={() => {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
            if (!token) {
              setNotice("Silakan login terlebih dahulu untuk membuat portfolio.");
              navigate("/app/login?next=/app/create");
              return;
            }
            navigate("/app/create");
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          Tambah
        </button>
      </div>
      <div className="mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul/deskripsi…"
          className="w-full max-w-md px-3 py-2 rounded-lg bg-white/10 border border-white/20"
        />
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => {
              const next = e.target.checked;
              const token = typeof window !== "undefined" ? window.localStorage.getItem("ACCESS_TOKEN") : "";
              if (next && !token) {
                setNotice("Silakan login untuk melihat portfolio Anda.");
                setMineOnly(false);
                return;
              }
              setMineOnly(next);
            }}
          />
          Tampilkan hanya portfolio saya
        </label>
        {notice && <div className="text-yellow-300 text-sm mt-2" aria-live="polite">{notice}</div>}
      </div>
      <div className="flex items-center gap-3 mb-4 text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className={`px-3 py-1 rounded ${page <= 1 ? "bg-slate-600" : "bg-slate-500 hover:bg-slate-600"}`}
        >
          Sebelumnya
        </button>
        <div>Halaman {page}</div>
        <div className="opacity-80">Total {total}</div>
        <button
          onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
          disabled={page * pageSize >= total}
          className={`px-3 py-1 rounded ${page * pageSize >= total ? "bg-slate-600" : "bg-slate-500 hover:bg-slate-600"}`}
        >
          Berikutnya
        </button>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="font-semibold">Belum ada portfolio.</div>
          <div className="text-sm opacity-80 mt-1">Coba ubah kata kunci atau buat portfolio baru.</div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setQ("");
                setNotice("");
              }}
              className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700"
            >
              Reset Pencarian
            </button>
            <button
              onClick={() => navigate("/app/create")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Buat Portfolio
            </button>
          </div>
        </div>
      ) : (
        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {filtered.map((it) => (
            <div key={it.id} className="portfolio-card block bg-white/10 rounded-xl p-4 border border-white/20 flex flex-col">
              {it.image_url || it.imageUrl ? (
                <img
                  alt={it.title}
                  src={it.image_url || it.imageUrl}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-white/5 rounded-lg mb-3 flex items-center justify-center text-white/30">
                  No Image
                </div>
              )}
              <div className="font-semibold text-lg">{it.title}</div>
              <div className="text-sm opacity-80 line-clamp-2 mb-4 flex-grow">{it.description}</div>
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/app/portfolios/${it.id}?mode=pdf`}
                  className="flex-grow text-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
                >
                  Lihat
                </Link>
                {it.portfolioId && (
                  <Link
                    to={`/app/create/${it.portfolioId}`}
                    className="flex-grow text-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
