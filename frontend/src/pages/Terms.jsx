import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function Terms() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Badge tone="blue">Legal</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Syarat & Ketentuan</h1>
        <p className="mt-2 text-sm text-slate-500">Terakhir diperbarui: 1 Maret 2026</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">1. Penerimaan Syarat</h2>
            <p>
              Dengan menggunakan PortoBuilder, Anda menyetujui ketentuan penggunaan layanan ini.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">2. Deskripsi Layanan</h2>
            <p>
              PortoBuilder adalah aplikasi untuk membuat, mengelola, preview, dan export CV atau
              portofolio profesional.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">3. Kewajiban Pengguna</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Memberikan informasi yang akurat dan tidak menyesatkan.</li>
              <li>Menjaga keamanan akun dan password.</li>
              <li>Tidak mengunggah konten ilegal, berbahaya, atau melanggar hak cipta.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">4. Kepemilikan Konten</h2>
            <p>
              Anda tetap memiliki konten CV dan portofolio yang dibuat. PortoBuilder hanya memproses
              konten tersebut untuk menyediakan fitur aplikasi.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">5. Penafian</h2>
            <p>Layanan disediakan apa adanya dan tidak menjamin hasil perekrutan atau pekerjaan.</p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <Button as={Link} to="/app" variant="secondary">
            Kembali ke Dashboard
          </Button>
        </div>
      </article>
    </main>
  );
}
