import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortfolioItem, updatePortfolioItem, getPortfolioItem, uploadImage } from "../api";

function validate({ title, description }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = "Judul minimal 3 karakter";
  if (!description || description.trim().length < 10) errors.description = "Deskripsi minimal 10 karakter";
  return errors;
}

export default function PortfolioAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", image_url: "", project_url: "" });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (id && id !== "new") {
      getPortfolioItem(id).then((data) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || data.imageUrl || "",
          project_url: data.project_url || data.projectUrl || "",
        });
        setPreviewUrl(data.image_url || data.imageUrl || "");
      }).catch(() => {});
    }
  }, [id]);

  const onFileSelected = async (file) => {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    try {
      const res = await uploadImage(file);
      if (res?.error) {
        setFormError(res.error);
      } else if (res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        setPreviewUrl(res.url);
      }
    } catch {
      setFormError("Gagal mengunggah gambar");
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    const token = window.localStorage.getItem("ACCESS_TOKEN") || "";
    try {
      if (id && id !== "new") {
        const res = await updatePortfolioItem(id, form, token);
        if (res?.error) setFormError(res.error);
        else if (res.id) navigate(`/app/portfolios/${id}`);
      } else {
        const res = await createPortfolioItem(form, token);
        if (res?.error) setFormError(res.error);
        else if (res.id) navigate(`/app/portfolios/${res.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-24 text-white space-y-6">
      <h1 className="text-2xl font-bold">{id && id !== "new" ? "Edit Portfolio" : "Tambah Portfolio"}</h1>
      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="portfolio-title" className="block text-sm">Judul</label>
            <input
              id="portfolio-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              aria-invalid={Boolean(errors.title)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
            />
            {errors.title && <div className="text-red-300 text-sm mt-1">{errors.title}</div>}
          </div>
          <div>
            <label htmlFor="portfolio-description" className="block text-sm">Deskripsi</label>
            <textarea
              id="portfolio-description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              aria-invalid={Boolean(errors.description)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
            />
            {errors.description && <div className="text-red-300 text-sm mt-1">{errors.description}</div>}
          </div>
          <div>
            <label htmlFor="portfolio-project-url" className="block text-sm">Project URL</label>
            <input
              id="portfolio-project-url"
              value={form.project_url}
              onChange={(e) => setForm((p) => ({ ...p, project_url: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-4 py-2 rounded-lg ${saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
          {formError && <div className="text-red-300 text-sm">{formError}</div>}
        </div>
        <div className="space-y-4">
          <label htmlFor="portfolio-image" className="block text-sm">Gambar</label>
          <input id="portfolio-image" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])} />
          {previewUrl && <img alt="preview" src={previewUrl} className="w-full h-64 object-cover rounded-lg border border-white/20" />}
          <div>
            <label htmlFor="portfolio-image-url" className="block text-sm">Atau URL Gambar</label>
            <input
              id="portfolio-image-url"
              value={form.image_url}
              onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value, }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
