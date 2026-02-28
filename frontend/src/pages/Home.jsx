import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { listMyPortfolioItems } from '../api';

const TemplateRenderer = lazy(() => import('../templates/TemplateRenderer'));

export default function Home() {
  const navigate = useNavigate();
  const [latestCv, setLatestCv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      const token =
        typeof window !== 'undefined' ? window.localStorage.getItem('ACCESS_TOKEN') : '';
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await listMyPortfolioItems({ limit: 1 });
        if (res.items && res.items.length > 0) {
          setLatestCv(res.items[0]);
        } else if (Array.isArray(res) && res.length > 0) {
          setLatestCv(res[0]);
        }
      } catch (err) {
        console.error('Failed to fetch latest CV for preview', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-[calc(100vh-6rem)]">
      <main className="pt-8 container mx-auto px-6 pb-24">
        {/* HERO SECTION */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SECTION */}
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Karier Cemerlang Dimulai dari
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Portofolio Cerdas.
              </span>
            </h1>

            <p className="text-gray-300 text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Platform revolusioner untuk membangun CV dan Portofolio berstandar industri secara
              otomatis. Tingkatkan peluang Anda direkrut hingga 300%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/app/create"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all rounded-xl text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1"
              >
                Buat CV Sekarang
              </Link>
              <button
                onClick={() => navigate('/app/portfolios')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded-xl text-lg font-bold backdrop-blur-sm"
              >
                Lihat Koleksi
              </button>
            </div>
          </div>

          {/* RIGHT SECTION: PREVIEW CARD */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none">
            {/* Glow Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-3xl rounded-full transform scale-90"></div>

            <div className="relative rounded-2xl shadow-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-4 lg:p-6 transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 group">
              {/* Browser-like Header */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 text-xs text-white/40 font-mono tracking-widest uppercase">
                  Preview Mode
                </div>
              </div>

              {/* Live Preview Container (CSS SCALED) */}
              <div className="h-[400px] lg:h-[500px] w-full rounded-xl overflow-hidden bg-white relative">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : latestCv ? (
                  // REAL CV PREVIEW
                  <div
                    className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left"
                    style={{ transform: 'scale(0.40) lg:scale(0.50)' }}
                  >
                    {/* We use inline styles for dynamic scaling based on parent container logic loosely, but CSS transforms are tricky responsive-wise. 
                        Let's force an exact scale for simplicity that fits the parent h-400 container. 
                        A4 Ratio is 1:1.414. width 800px -> height 1131px. 
                        To fit 500px height: scale = 500 / 1131 = 0.44.
                    */}
                    <div
                      className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left"
                      style={{ transform: 'scale(0.442)' }}
                    >
                      <Suspense
                        fallback={<div className="p-10 text-black">Memuat Pratinjau...</div>}
                      >
                        <TemplateRenderer
                          data={latestCv.data || {}}
                          template={latestCv.template || {}}
                          sectionsOrder={latestCv.sectionsOrder || []}
                        />
                      </Suspense>
                    </div>
                  </div>
                ) : (
                  // ANIMATED PREMIUM SKELETON (NO CV / LOGGED OUT)
                  <div className="w-full h-full bg-white p-6 flex flex-col gap-6 animate-pulse">
                    {/* Header Skeleton */}
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-full bg-gray-200"></div>
                      <div className="space-y-3 flex-1">
                        <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-gray-100"></div>

                    {/* Body Skeleton 1 */}
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-200 rounded-md w-1/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded-md w-full"></div>
                      <div className="h-3 bg-gray-200 rounded-md w-full"></div>
                      <div className="h-3 bg-gray-200 rounded-md w-5/6"></div>
                    </div>

                    {/* Body Skeleton 2 */}
                    <div className="space-y-3 mt-4">
                      <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Kami merancang setiap alat untuk memaksimalkan potensi Anda menembus seleksi
              perusahaan idaman.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              [
                '⚡',
                'Template Cerdas',
                'Sistem cerdas yang menyesuaikan panjang konten dengan otomatisasi tata letak yang sempurna tanpa perlu mendesain manual.',
              ],
              [
                '📄',
                'Ramah ATS (PDF)',
                'Download dengan format PDF bersih, rapih, dan terstruktur yang mampu dibaca oleh mesin pelacak pelamar (ATS).',
              ],
              [
                '🔗',
                'Link Koleksi',
                'Simpan puluhan variasi portofolio di cloud dan kirimkan tautan langsung ke perekrut hanya dengan satu kali klik.',
              ],
            ].map(([icon, title, desc], i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:-translate-y-2 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
