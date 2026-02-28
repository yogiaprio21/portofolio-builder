import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <main className="container mx-auto px-6 pt-8 pb-24">
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="mb-10 border-b border-white/10 pb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              Syarat & Ketentuan Layanan
            </h1>
            <p className="text-white/60">Terakhir diperbarui: 1 Maret 2026</p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Penerimaan Syarat</h2>
              <p>
                Dengan mengakses dan menggunakan platform PortoBuilder, Anda setuju untuk terikat
                dengan Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari
                syarat ini, harap jangan gunakan layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Deskripsi Layanan</h2>
              <p>
                PortoBuilder adalah platform perangkat lunak sebagai layanan (SaaS) yang
                memungkinkan pengguna membuat, mengelola, dan membagikan Curriculum Vitae (CV) dan
                Portofolio profesional, termasuk kemampuan menghasilkan dokumen berformat PDF
                (ATS-friendly).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Kewajiban Pengguna</h2>
              <p>Sebagai pengguna platform, Anda setuju untuk:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Memberikan informasi yang akurat dan jujur di dalam CV dan portofolio Anda.</li>
                <li>
                  Menjaga kerahasiaan kata sandi dan bertanggung jawab atas semua aktivitas di bawah
                  akun Anda.
                </li>
                <li>
                  Tidak mengunggah materi yang melanggar hak cipta, ilegal, menyinggung, atau
                  mengandung virus/perangkat lunak berbahaya.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Kepemilikan Konten</h2>
              <p>
                <strong>Konten Anda:</strong> Anda mempertahankan seluruh hak kepemilikan atas teks,
                gambar, dan dokumen yang Anda unggah. Anda hanya memberikan lisensi kepada
                PortoBuilder untuk memproses dan menampilkan konten tersebut sesuai fungsionalitas
                aplikasi.
              </p>
              <p className="mt-4">
                <strong>Konten Kami:</strong> Desain antarmuka, *template* presentasi CV, kode
                sumber, dan merek PortoBuilder adalah hak milik intelektual eksklusif kami dan
                dilindungi oleh hukum.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Penghentian Layanan</h2>
              <p>
                Kami berhak untuk menangguhkan atau menghentikan akun Anda jika kami menemukan
                pelanggaran terhadap Syarat dan Ketentuan ini, termasuk penyalahgunaan layanan untuk
                tujuan spam, penipuan, atau peretasan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Penafian Jaminan (Disclaimer)
              </h2>
              <p>
                Layanan disediakan "apa adanya". Kami tidak menjamin bahwa layanan tidak akan
                mengalami gangguan (uninterrupted) atau sepenuhnya bebas dari kesalahan sistem. Kami
                juga tidak menjamin bahwa penggunaan platform ini pasti akan membuahkan hasil
                perekrutan / pekerjaan untuk Anda.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-white/10 flex justify-center">
              <Link
                to="/app"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-semibold transition-all duration-300"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
