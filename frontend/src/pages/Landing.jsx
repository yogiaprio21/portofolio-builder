import { Link } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getTemplates } from '../api';
import Footer from '../components/Footer';
import Button from '../components/ui/Button.jsx';
const TemplateRenderer = lazy(() => import('../templates/TemplateRenderer'));

const fallbackCv = {
  personal: {
    fullName: 'Alya Pratama',
    headline: 'Product Designer',
    email: 'alya@mail.com',
    location: 'Jakarta',
    linkedin: 'linkedin.com/in/alya',
  },
  summary: {
    id: 'Designer produk dengan pengalaman membangun alur onboarding, design system, dan pengalaman SaaS yang mudah dipahami pengguna.',
  },
  workExperience: [
    {
      role: 'Lead Designer',
      company: 'Studio Nusantara',
      startDate: '2022',
      endDate: 'Sekarang',
      highlights: ['Meningkatkan completion onboarding sebesar 28%.', 'Merapikan komponen desain untuk 4 produk internal.'],
    },
  ],
  skills: [{ category: 'Core', items: ['UX Research', 'Figma', 'Design System', 'React'] }],
  projects: [{ name: 'SaaS Onboarding', role: 'Designer', description: 'Riset, wireframe, dan prototipe high-fidelity.', tech: 'Figma, Maze' }],
  languageBySection: { summary: 'id', workExperience: 'id', skills: 'en', projects: 'id' },
};

export default function Landing() {
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    getTemplates()
      .then((data) => {
        if (Array.isArray(data)) setTemplate(data.find((item) => item.metadata?.isAtsSafe) || data[0]);
      })
      .catch(() => {});
  }, []);

  const previewCv = template?.metadata?.previewCv || fallbackCv;

  return (
    <div className="bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-extrabold">
            <span className="text-blue-300">Porto</span>Builder
          </Link>
          <div className="flex gap-2">
            <Button as={Link} to="/app/login" variant="ghost" size="sm">
              Masuk
            </Button>
            <Button as={Link} to="/app/register" size="sm">
              Daftar
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
              CV builder dengan template ATS dan portfolio visual
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Buat CV yang rapi, mudah dibaca, dan siap dikirim.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/65">
              Import CV lama, pilih template, rapikan isi, lalu simpan dan download PDF dari satu
              alur kerja yang jelas.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/app/register" size="lg">
                Mulai Sekarang
              </Button>
              <Button as={Link} to="/app/login" variant="secondary" size="lg">
                Masuk
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['1', 'Import CV'],
                ['2', 'Pilih Template'],
                ['3', 'Download PDF'],
              ].map(([number, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-100">
                    {number}
                  </div>
                  <div className="text-sm font-semibold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between text-slate-700">
              <div>
                <div className="text-sm font-semibold">{template?.name || 'ATS Classic'}</div>
                <div className="text-xs text-slate-500">{template?.category || 'ATS'} preview</div>
              </div>
              {template?.metadata?.isAtsSafe && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ATS-safe
                </span>
              )}
            </div>
            <div className="max-h-[640px] overflow-hidden rounded-lg bg-white p-6 text-slate-900">
              <Suspense fallback={<div className="h-[520px] animate-pulse bg-slate-100" />}>
                <TemplateRenderer
                  data={{ cv: previewCv, theme: {} }}
                  template={template || {}}
                  sectionsOrder={template?.sections || []}
                />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              ['Konten lebih jelas', 'Form bertahap membantu Anda fokus ke satu bagian CV.'],
              ['Template hidup', 'Setiap template punya preview sample sehingga mudah dibandingkan.'],
              ['Siap deploy', 'Backend, database, upload, email, dan AI sudah disiapkan untuk production.'],
            ].map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-white/10 bg-slate-950 p-6">
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
