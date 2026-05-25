import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function Privacy() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Badge tone="blue">Legal</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-2 text-sm text-slate-500">Terakhir diperbarui: 1 Maret 2026</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">1. Pendahuluan</h2>
            <p>
              PortoBuilder menghargai privasi Anda dan berkomitmen melindungi data pribadi yang
              digunakan saat membuat CV dan portofolio.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">
              2. Informasi yang Dikumpulkan
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Informasi akun seperti email dan kredensial login.</li>
              <li>Data CV, portfolio, gambar, dan dokumen yang Anda unggah.</li>
              <li>Informasi teknis standar untuk keamanan dan operasional layanan.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">3. Penggunaan Informasi</h2>
            <p>
              Data digunakan untuk membuat, menyimpan, mengelola, menampilkan preview, dan
              menghasilkan dokumen PDF dari CV atau portofolio Anda.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">4. Keamanan Data</h2>
            <p>
              Kami menggunakan praktik keamanan seperti HTTPS, validasi backend, cookie aman, dan
              pembatasan akses untuk membantu melindungi akun.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-black text-slate-950">5. Kendali Pengguna</h2>
            <p>
              Anda dapat mengedit atau menghapus CV dan item portofolio melalui dashboard kapan
              saja.
            </p>
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
