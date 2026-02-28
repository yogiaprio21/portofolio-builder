import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Brand & Slogan */}
          <div className="text-center md:text-left">
            <Link to="/app" className="text-2xl font-extrabold tracking-tight block mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                PortoBuilder
              </span>
            </Link>
            <p className="text-white/50 text-sm max-w-sm">
              Membangun karier profesional Anda dengan satu klik. Buat CV dan Portofolio modern
              dalam hitungan menit.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm text-white/50 font-medium">
            <Link to="/app" className="hover:text-blue-400 transition-colors">
              Beranda
            </Link>
            <Link to="/app/portfolios" className="hover:text-blue-400 transition-colors">
              Koleksi
            </Link>
            <Link to="/app/create" className="hover:text-blue-400 transition-colors">
              Buat CV
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} PortoBuilder. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <Link to="/app/privacy" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link to="/app/terms" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
