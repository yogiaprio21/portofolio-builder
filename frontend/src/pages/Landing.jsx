import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getTemplates } from '../api';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import TemplatePreviewCard from '../components/TemplatePreviewCard.jsx';

const fallbackCv = {
  personal: {
    fullName: 'Alya Pratama',
    headline: 'Product Designer',
    email: 'alya@mail.com',
    location: 'Jakarta',
    linkedin: 'linkedin.com/in/alya',
  },
  summary: {
    id: 'Designer produk dengan pengalaman membangun onboarding, design system, dan pengalaman SaaS yang mudah dipahami pengguna.',
  },
  workExperience: [
    {
      role: 'Lead Designer',
      company: 'Studio Nusantara',
      startDate: '2022',
      endDate: 'Sekarang',
      highlights: [
        'Meningkatkan completion onboarding sebesar 28%.',
        'Merapikan komponen desain untuk 4 produk internal.',
      ],
    },
  ],
  skills: [{ category: 'Core', items: ['UX Research', 'Figma', 'Design System', 'React'] }],
  projects: [
    {
      name: 'SaaS Onboarding',
      role: 'Designer',
      description: 'Riset, wireframe, dan prototipe high-fidelity.',
      tech: 'Figma, Maze',
    },
  ],
  languageBySection: { summary: 'id', workExperience: 'id', skills: 'en', projects: 'id' },
};

export default function Landing() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getTemplates()
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(() => {});
  }, []);

  const primaryTemplate = useMemo(
    () => templates.find((item) => item.metadata?.isAtsSafe) || templates[0] || {},
    [templates],
  );
  const previewCv = primaryTemplate?.metadata?.previewCv || fallbackCv;
  const showcasedTemplates = templates.slice(0, 3);

  return (
    <div className="bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo to="/" markClassName="h-9 w-9" textClassName="text-slate-950" />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#cara-kerja" className="hover:text-slate-950">
              Cara kerja
            </a>
            <a href="#template" className="hover:text-slate-950">
              Template
            </a>
            <a href="#fitur" className="hover:text-slate-950">
              Fitur
            </a>
          </nav>
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
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:py-14 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="max-w-2xl">
              <Badge tone="blue">CV ATS dan portfolio builder</Badge>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Buat CV profesional tanpa merasa tersesat di form panjang.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                PortoBuilder menggabungkan import CV, template preview hidup, bantuan AI, dan export
                PDF ke dalam alur kerja yang jelas dari awal sampai siap kirim.
              </p>
              <div className="mt-6 grid gap-3 sm:flex-row md:flex md:items-center">
                <Button as={Link} to="/app/register" size="lg">
                  Mulai Buat CV
                </Button>
                <Button as={Link} to="/app/login" variant="secondary" size="lg">
                  Buka Workspace
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['30+', 'Template dengan preview sample'],
                  ['ATS', 'Struktur mudah dipindai recruiter'],
                  ['PDF', 'Preview dan download dari browser'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-2xl font-black text-slate-950">{value}</div>
                    <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-950">
                      {primaryTemplate?.name || 'ATS Classic'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {primaryTemplate?.category || 'ATS'} preview
                    </div>
                  </div>
                  <Badge tone="emerald">ATS-safe</Badge>
                </div>
                <TemplatePreviewCard
                  template={primaryTemplate}
                  cv={previewCv}
                  compact
                  scale={0.58}
                  previewClassName="h-[520px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="max-w-2xl">
            <Badge tone="slate">Alur jelas</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              Dari CV lama ke versi siap kirim.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Import', 'Upload CV lama atau mulai manual dari form bertahap.'],
              ['Pilih template', 'Bandingkan desain dari preview sample yang hidup.'],
              ['Rapikan konten', 'Isi section penting dengan validasi dan auto-save.'],
              ['Export', 'Preview web, mobile, PDF, lalu download dokumen akhir.'],
            ].map(([title, desc], index) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="template" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge tone="blue">Template preview</Badge>
                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  Pilih desain sebelum mengisi terlalu jauh.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Setiap template bisa membawa sample CV sendiri, sehingga user melihat hasil
                  realistis sebelum memilih gaya yang cocok.
                </p>
              </div>
              <Button as={Link} to="/app/register" variant="secondary">
                Coba Template
              </Button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(showcasedTemplates.length ? showcasedTemplates : [primaryTemplate]).map(
                (template) => (
                  <TemplatePreviewCard
                    key={template.id || template.name || 'fallback'}
                    template={template}
                    cv={template?.metadata?.previewCv || fallbackCv}
                    compact
                    scale={0.23}
                  />
                ),
              )}
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                'Form bertahap',
                'Setiap section punya fokus sendiri, bukan satu halaman panjang yang melelahkan.',
              ],
              [
                'Auto-save draft',
                'Data tersimpan lokal saat proses edit agar pekerjaan tidak mudah hilang.',
              ],
              [
                'AI fallback',
                'Backend mendukung provider AI berantai, dengan heuristic saat provider lain tidak aktif.',
              ],
            ].map(([title, desc]) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-extrabold">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
