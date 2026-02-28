import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
      <main className="container mx-auto px-6 pt-8 pb-24">
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="mb-10 border-b border-white/10 pb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              Kebijakan Privasi
            </h1>
            <p className="text-white/60">Terakhir diperbarui: 1 Maret 2026</p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Pendahuluan</h2>
              <p>
                Selamat datang di PortoBuilder. Kami sangat menghargai privasi Anda dan berkomitmen
                untuk melindungi data pribadi yang Anda bagikan kepada kami saat menggunakan layanan
                pembuatan CV dan Portofolio kami. Kebijakan ini menjelaskan bagaimana kami
                mengumpulkan, menggunakan, dan melindungi informasi Anda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Informasi Akun:</strong> Nama, alamat email, dan kata sandi saat Anda
                  mendaftar.
                </li>
                <li>
                  <strong>Data Portofolio & CV:</strong> Informasi profesional, riwayat pendidikan,
                  pengalaman kerja, dan foto/dokumen (PDF) yang Anda unggah ke dalam sistem kami.
                </li>
                <li>
                  <strong>Informasi Teknis:</strong> Alamat IP, jenis peramban (browser), dan data
                  analitik penggunaan standar.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Penggunaan Informasi</h2>
              <p>Kami menggunakan data Anda secara eksklusif untuk:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Memfasilitasi pembuatan, penyimpanan, dan pengelolaan CV serta Portofolio Anda.
                </li>
                <li>Menghasilkan pratinjau dan dokumen PDF otomatis (ATS-friendly).</li>
                <li>
                  Menyediakan tautan publik (jika Anda bagikan) agar portofolio Anda dapat diakses
                  perekrut.
                </li>
                <li>Meningkatkan fungsionalitas dan keamanan platform kami.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Keamanan Data</h2>
              <p>
                Kami menerapkan standar keamanan industri terkini, termasuk enkripsi data dan
                koneksi aman (HTTPS), untuk melindungi akun dan dokumen portofolio Anda dari akses
                yang tidak sah. Namun, ingatlah bahwa tidak ada transmisi data di internet yang 100%
                aman.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Hak Anda (Kendali Penuh)</h2>
              <p>
                Kami percaya pada kepemilikan data. Anda memiliki kendali penuh untuk{' '}
                <strong>mengedit</strong> atau <strong>menghapus secara permanen</strong> setiap CV
                dan Portofolio yang Anda buat kapan saja melalui Dasbor Anda. Menghapus akun akan
                menghapus seluruh data Anda dari peladen (server) kami.
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
