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

const workflow = [
  ['Import', 'Ambil data awal dari CV lama atau mulai manual.'],
  ['Pilih desain', 'Bandingkan preview sample sebelum mengisi terlalu jauh.'],
  ['Rapikan isi', 'Isi form bertahap dengan validasi dan bantuan AI.'],
  ['Export', 'Cek preview web, mobile, PDF, lalu download dokumen.'],
];

const features = [
  ['Form bertahap', 'Setiap section fokus pada satu jenis informasi agar user tidak tersesat.'],
  ['Preview hidup', 'Template menampilkan sample CV yang relevan sebelum dipilih.'],
  ['AI fallback', 'Backend bisa memakai beberapa provider dan tetap punya fallback heuristic.'],
];

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
    <div className="bg-[#f3f6fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo to="/" markClassName="h-9 w-9" />
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
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
        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:py-12 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="max-w-xl">
              <Badge tone="teal">CV ATS + portfolio workspace</Badge>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                Buat CV siap kirim tanpa alur yang membingungkan.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600">
                PortoBuilder menyatukan import CV, template preview, form bertahap, bantuan AI, dan
                export PDF dalam workspace yang rapi dari awal sampai final.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/app/register" size="lg">
                  Mulai Buat CV
                </Button>
                <Button as={Link} to="/app/login" variant="secondary" size="lg">
                  Buka Workspace
                </Button>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ['30+', 'Template'],
                  ['ATS', 'Struktur'],
                  ['PDF', 'Export'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="text-2xl font-black text-slate-950">{value}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <div>
                    <div className="text-sm font-black text-slate-950">
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
                  scale={0.34}
                  previewClassName="h-[300px] sm:h-[360px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge tone="slate">Alur jelas</Badge>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Dari draft lama ke dokumen final.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Setiap langkah punya tujuan yang jelas, jadi pengguna selalu tahu harus lanjut ke
              mana.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map(([title, desc], index) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="template" className="section-band">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge tone="blue">Template preview</Badge>
                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                  Pilih desain dari hasil yang terlihat nyata.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Preview sample membantu pengguna menilai struktur, kerapian, dan kecocokan gaya
                  sebelum mulai mengisi form.
                </p>
              </div>
              <Button as={Link} to="/app/register" variant="secondary">
                Coba Template
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(showcasedTemplates.length ? showcasedTemplates : [primaryTemplate]).map(
                (template) => (
                  <TemplatePreviewCard
                    key={template.id || template.name || 'fallback'}
                    template={template}
                    cv={template?.metadata?.previewCv || fallbackCv}
                    compact
                    scale={0.19}
                    previewClassName="h-44"
                  />
                ),
              )}
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(([title, desc]) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
