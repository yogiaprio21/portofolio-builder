import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getTemplates } from '../api';
import Footer from '../components/Footer';

function CvPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-6 text-slate-900 shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-2xl font-bold">Alya Pratama</div>
          <div className="text-sm text-blue-700 font-medium">Product Designer</div>
          <div className="mt-2 text-xs text-slate-500">Jakarta · alya@mail.com · linkedin.com/in/alya</div>
        </div>
        <div className="h-14 w-14 rounded-full bg-blue-100 border border-blue-200" />
      </div>
      <div className="mt-5 space-y-5">
        <section>
          <h3 className="text-xs font-bold tracking-wide text-blue-700 uppercase">Ringkasan</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Designer dengan pengalaman membangun produk SaaS, design system, dan alur onboarding
            yang mudah dipahami pengguna.
          </p>
        </section>
        <section>
          <h3 className="text-xs font-bold tracking-wide text-blue-700 uppercase">Pengalaman</h3>
          <div className="mt-2 rounded-lg bg-slate-50 p-3">
            <div className="font-semibold text-sm">Lead Designer · Studio Nusantara</div>
            <div className="text-xs text-slate-500">2022 - Sekarang</div>
            <div className="mt-2 h-2 rounded bg-slate-200" />
            <div className="mt-2 h-2 w-4/5 rounded bg-slate-200" />
          </div>
        </section>
        <section>
          <h3 className="text-xs font-bold tracking-wide text-blue-700 uppercase">Keahlian</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {['UX Research', 'Figma', 'Design System', 'React'].map((skill) => (
              <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    getTemplates().catch(() => {});
  }, []);

  return (
    <div className="bg-slate-950 text-white">
      <section className="min-h-[92vh] flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
              CV builder siap deploy untuk portfolio profesional
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Bangun CV modern yang siap dikirim dalam hitungan menit.
            </h1>
            <p className="text-lg text-white/65 max-w-2xl leading-relaxed">
              Import CV, pilih template, atur section, lalu simpan dan download PDF dari satu alur
              kerja yang rapi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/app/register"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                Mulai Sekarang
              </Link>
              <Link
                to="/app/login"
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 font-semibold"
              >
                Masuk
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 pt-4">
              {['Import CV', 'Custom Template', 'Export PDF'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold">{item}</div>
                  <div className="mt-2 h-1 rounded bg-blue-500/60" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CvPreview />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-5">
          {[
            ['Import dan rapikan', 'Ambil informasi dari PDF atau teks, lalu cek ulang setiap bagian.'],
            ['Desain fleksibel', 'Pilih template, warna, font, layout, dan urutan section sesuai target lamaran.'],
            ['Siap dikirim', 'Simpan CV ke akun Anda dan download PDF dari halaman preview.'],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-slate-950 p-6">
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
