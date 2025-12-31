import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Template1 from "../templates/Template1";
import Template2 from "../templates/Template2";
import Template3 from "../templates/Template3";

export default function Create() {
  const navigate = useNavigate();

  const templates = [
    { id: 1, title: "Template 1" },
    { id: 2, title: "Template 2" },
    { id: 3, title: "Template 3" },
  ];

  const [selected, setSelected] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    about: "",
    skills: "",
    experience: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNext = async () => {
    try {
      // FIX: backend expects { form: {...}, template }
      const payload = {
        form: {
          name: form.name,
          email: form.email,
          bio: form.about,
          skills: form.skills,
          experience: form.experience,
        },
        template: selected,
      };

      const res = await fetch("http://localhost:3000/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.id) {
        navigate(`/app/preview/${data.id}`);
      } else {
        alert(data.error || "Gagal menyimpan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 to-slate-800 p-6 pt-32">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* TEMPLATE SELECT */}
        <aside className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10">
            <h4 className="font-semibold text-blue-300 mb-4">Pilih Template</h4>

            <div className="grid gap-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`p-4 rounded-lg cursor-pointer transition border
                      ${selected === t.id
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10"}`}
                >
                  <h3 className="font-semibold">{t.title}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* PREVIEW TEMPLATE */}
          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10">
            <h4 className="font-semibold text-blue-300 mb-4">Preview</h4>

            <div className="bg-white rounded-xl p-4 h-[350px] overflow-y-auto shadow-inner border">
              <div className="scale-[0.85] origin-top-left min-w-[600px]">
                {selected === 1 && <Template1 data={form} />}
                {selected === 2 && <Template2 data={form} />}
                {selected === 3 && <Template3 data={form} />}
              </div>
            </div>
          </div>
        </aside>

        {/* FORM */}
        <section className="lg:col-span-2 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-bold text-blue-300">Lengkapi Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-300">Nama</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg text-black"
                placeholder="Nama lengkap"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full p-3 mt-1 rounded-lg text-black"
                placeholder="email@example.com"
              />
            </div>

            {/* ABOUT */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Tentang Saya (Bio)</label>
              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg text-black"
                rows={4}
                placeholder="Tuliskan deskripsi diri"
              />
            </div>

            {/* SKILLS */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Skills</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg text-black"
                placeholder="Contoh: HTML, CSS, JavaScript"
              />
            </div>

            {/* EXPERIENCE */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Pengalaman</label>
              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="w-full p-3 mt-1 rounded-lg text-black"
                rows={4}
                placeholder="Ceritakan pengalaman kerja / proyek"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleNext}
            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
          >
            Simpan & Lihat Preview
          </button>
        </section>

      </div>
    </div>
  );
}