import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-20 pt-8 text-slate-950 md:pb-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="text-center md:text-left">
            <BrandLogo
              to="/"
              className="mb-3 justify-start"
              markClassName="h-9 w-9"
              textClassName="text-slate-950"
            />
            <p className="max-w-sm text-left text-sm leading-7 text-slate-500">
              Workspace untuk membuat CV dan portfolio modern dengan alur yang jelas, rapi, dan siap
              deploy.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
            <Link to="/app" className="transition-colors hover:text-blue-700">
              Beranda
            </Link>
            <Link to="/app/portfolios" className="transition-colors hover:text-blue-700">
              Koleksi
            </Link>
            <Link to="/app/create" className="transition-colors hover:text-blue-700">
              Buat CV
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} PortoBuilder. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <Link to="/app/privacy" className="transition-colors hover:text-slate-900">
              Kebijakan Privasi
            </Link>
            <Link to="/app/terms" className="transition-colors hover:text-slate-900">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
