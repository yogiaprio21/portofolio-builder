import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getTemplates } from '../api';
import Footer from '../components/Footer';

export default function Landing() {
  useEffect(() => {
    getTemplates().catch(() => {});
  }, []);
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <section className="min-h-screen flex items-center">
        <div className="container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center gap-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Portofolio profesional
              <br />
              <span className="text-blue-400">tanpa ribet</span>
            </h1>

            <p className="text-gray-300 max-w-xl text-lg leading-relaxed">
              Buat portofolio modern dari CV atau form, pilih template premium, dan download versi
              PDF berkualitas tinggi dalam hitungan menit.
            </p>

            <div className="flex gap-4 mt-4">
              {/* CTA PRIMARY */}
              <Link
                to="/app"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 
                transition shadow-lg font-semibold text-lg"
              >
                Mulai Sekarang
              </Link>

              {/* CTA SECONDARY */}
              <a
                className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10
                transition font-semibold text-lg cursor-pointer backdrop-blur-sm"
              >
                Lihat Contoh
              </a>
            </div>
          </div>

          {/* RIGHT SIDE — DEMO PANEL */}
          <div className="flex items-center justify-center">
            <div
              className="w-full max-w-md rounded-2xl shadow-2xl bg-white/10 
                p-6 backdrop-blur-lg border border-white/20"
            >
              <div
                className="h-80 rounded-xl overflow-hidden bg-gradient-to-br 
                from-blue-500/20 to-purple-500/20 flex items-center 
                justify-center text-blue-300 text-2xl font-semibold 
                border border-white/10 shadow-inner"
              >
                Demo Preview
              </div>

              {/* Glow Under Card */}
              <div className="mx-auto mt-6 h-2 w-40 bg-blue-500/40 blur-xl rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
