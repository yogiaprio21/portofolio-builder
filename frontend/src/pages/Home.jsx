import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <main className="pt-32 container mx-auto px-6 pb-24">

        {/* HERO SECTION */}
        <section className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT SECTION */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Buat portofolio yang  
              <span className="text-blue-400"> menonjol</span>
            </h2>

            <p className="text-gray-300 text-lg max-w-lg leading-relaxed">
              Pilih template modern, isi data, atau cukup upload CV — sistem otomatis
              membentuk portofolio profesional siap kirim ke HR.
            </p>

            <Link
              to="/app/create"
              className="inline-block px-8 py-4 mt-4 bg-blue-600 hover:bg-blue-700 
              transition rounded-xl text-lg font-semibold shadow-lg"
            >
              Buat Sekarang
            </Link>
          </div>

          {/* PREVIEW CARD */}
          <div className="relative">
            <div
              className="rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg 
              border border-white/20 p-6 transform hover:scale-[1.02] 
              transition duration-300"
            >
              <div
                className="h-80 w-full rounded-xl bg-gradient-to-br 
                from-blue-500/20 to-purple-500/20 flex items-center justify-center
                text-blue-300 text-2xl font-semibold border border-white/10
                shadow-inner"
              >
                Contoh Preview
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-3 w-48 bg-blue-500/40 blur-xl rounded-full opacity-70"></div>
          </div>

        </section>

        {/* FEATURES */}
        <section className="mt-28 grid md:grid-cols-3 gap-10">
          {[
            ["Template Modern", "Pilih template stylish siap pakai."],
            ["Auto Generate", "Upload CV → Portofolio terbentuk otomatis."],
            ["Download PDF", "Hasil rapi & profesional, siap dikirim ke HR."]
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
              shadow-xl hover:-translate-y-1 transition"
            >
              <h3 className="text-xl font-semibold text-blue-300 mb-2">{title}</h3>
              <p className="text-gray-300">{desc}</p>
            </div>
          ))}
        </section>

      </main>
    </div>
  )
}
