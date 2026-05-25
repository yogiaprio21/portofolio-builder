import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createPortfolioItem,
  updatePortfolioItem,
  getPortfolioItem,
  uploadImage,
  getStoredToken,
} from '../api';
import Button from '../components/ui/Button.jsx';
import PageShell from '../components/ui/PageShell.jsx';
import Alert from '../components/ui/Alert.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';

function validate({ title, description }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Judul minimal 3 karakter';
  if (!description || description.trim().length < 10)
    errors.description = 'Deskripsi minimal 10 karakter';
  return errors;
}

export default function PortfolioAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    image_provider: '',
    image_public_id: '',
    upload_asset_id: '',
    project_url: '',
  });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      getPortfolioItem(id)
        .then((data) => {
          setForm({
            title: data.title || '',
            description: data.description || '',
            image_url: data.image_url || data.imageUrl || '',
            image_provider: data.image_provider || data.imageProvider || '',
            image_public_id: data.image_public_id || data.imagePublicId || '',
            upload_asset_id: '',
            project_url: data.project_url || data.projectUrl || '',
          });
          setPreviewUrl(data.image_url || data.imageUrl || '');
        })
        .catch(() => {});
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
        setForm((prev) => ({
          ...prev,
          image_url: res.url,
          image_provider: res.provider || '',
          image_public_id: res.public_id || '',
          upload_asset_id: res.upload_asset_id || '',
        }));
        setPreviewUrl(res.url);
      }
    } catch {
      setFormError('Gagal mengunggah gambar');
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    const token = getStoredToken();
    try {
      if (id && id !== 'new') {
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
    <PageShell
      eyebrow="Portfolio item"
      title={id && id !== 'new' ? 'Edit item portfolio' : 'Tambah item portfolio'}
      description="Gunakan halaman ini untuk menambahkan karya atau project terpisah dari CV utama Anda."
      className="pb-24"
    >
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <SectionCard tone="light" className="space-y-4 p-6">
          <div>
            <label htmlFor="portfolio-title" className="block text-sm">
              Judul
            </label>
            <input
              id="portfolio-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              aria-invalid={Boolean(errors.title)}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
            />
            {errors.title && <div className="mt-1 text-sm text-red-600">{errors.title}</div>}
          </div>
          <div>
            <label htmlFor="portfolio-description" className="block text-sm">
              Deskripsi
            </label>
            <textarea
              id="portfolio-description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              aria-invalid={Boolean(errors.description)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
            />
            {errors.description && (
              <div className="mt-1 text-sm text-red-600">{errors.description}</div>
            )}
          </div>
          <div>
            <label htmlFor="portfolio-project-url" className="block text-sm">
              Project URL
            </label>
            <input
              id="portfolio-project-url"
              value={form.project_url}
              onChange={(e) => setForm((p) => ({ ...p, project_url: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/app/portfolios')}>
              Kembali
            </Button>
          </div>
          {formError && <Alert tone="error">{formError}</Alert>}
        </SectionCard>
        <SectionCard tone="light" className="space-y-4 p-6">
          <label htmlFor="portfolio-image" className="block text-sm">
            Gambar
          </label>
          <input
            id="portfolio-image"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          />
          {previewUrl && (
            <img
              alt="preview"
              src={previewUrl}
              className="h-64 w-full rounded-lg border border-slate-200 object-cover"
            />
          )}
          <div>
            <label htmlFor="portfolio-image-url" className="block text-sm">
              Atau URL Gambar
            </label>
            <input
              id="portfolio-image-url"
              value={form.image_url}
              onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
              placeholder="https://..."
            />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
