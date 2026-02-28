# CV Builder

Sistem pembuatan CV dengan template profesional yang dapat disesuaikan, editor dinamis, dan preview multi-format.

## Struktur Data CV

Semua data CV disimpan dalam field `cv` pada backend. Format ringkas:

```json
{
  "personal": {
    "fullName": "Nama Lengkap",
    "headline": "Job Title",
    "email": "email@domain.com",
    "phone": "+62 812 0000 0000",
    "location": "Jakarta",
    "website": "https://domain.com",
    "linkedin": "linkedin.com/in/nama",
    "github": "github.com/nama"
  },
  "summary": "Ringkasan profesional",
  "experience": [
    {
      "role": "Posisi",
      "company": "Perusahaan",
      "location": "Lokasi",
      "startDate": "2023",
      "endDate": "2024",
      "highlights": ["Pencapaian 1", "Pencapaian 2"]
    }
  ],
  "education": [
    {
      "degree": "S1 Teknik",
      "institution": "Universitas",
      "location": "Kota",
      "startDate": "2019",
      "endDate": "2023",
      "gpa": "3.8"
    }
  ],
  "skills": [
    {
      "category": "Teknis",
      "items": ["React", "Node.js"]
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified",
      "issuer": "AWS",
      "date": "2024",
      "credentialUrl": "https://verify.aws"
    }
  ],
  "projects": [
    {
      "name": "Project A",
      "role": "Lead",
      "description": "Deskripsi singkat",
      "tech": "React, Node",
      "link": "https://github.com/project"
    }
  ],
  "achievements": [
    { "title": "Best Innovator", "date": "2024", "description": "Detail penghargaan" }
  ],
  "references": [
    { "name": "Nama", "title": "Manager", "company": "Perusahaan", "contact": "email@domain.com" }
  ],
  "additional": {
    "languages": "Indonesia, Inggris",
    "interests": "AI, UI Design",
    "awards": "Hackathon Winner",
    "volunteer": "Komunitas Teknologi",
    "publications": "Judul Publikasi"
  }
}
```

## Endpoint API

Base URL dikonfigurasi melalui environment: `VITE_API_BASE` (default `http://localhost:3000`)

- `GET /templates` mengambil semua template
- `GET /templates/:id` mengambil detail template
- `POST /templates` menambahkan template baru
- `POST /portfolios` menyimpan data CV
- `GET /portfolios/:id` mengambil data CV

## Cara Menambahkan Template Baru

1. Jalankan backend, template awal akan di-seed otomatis.
2. Gunakan endpoint `POST /templates` dengan body:

```json
{
  "name": "Modern 7",
  "category": "Modern",
  "layout": "sidebar-left",
  "style": {
    "accentColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "headingColor": "#0f172a",
    "fontFamily": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    "sectionGap": 20
  },
  "sections": [
    "summary",
    "experience",
    "education",
    "skills",
    "certifications",
    "projects",
    "achievements",
    "references",
    "additional"
  ],
  "tags": ["ATS", "Minimal"]
}
```

## Cara Menggunakan Fitur Baru

- Pilih template di panel kiri, preview langsung berubah.
- Drag & drop urutan section pada panel Urutan Section.
- Ubah warna, font, dan layout di panel Kustomisasi.
- Pilih mode preview Web, PDF, atau Mobile.
- Klik Simpan & Lihat Preview untuk membuka preview dan download PDF.

## Menjalankan Aplikasi

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Struktur Proyek

- `src/pages` – Halaman dan routing
- `src/templates` – Renderer template portofolio
- `src/shared` – Modul reusable (config & util)
- `src/features/cv` – Parser & logika domain CV
- `src/utils` – Util umum (mis. generator PDF)

## Konfigurasi Environment

- Buat `.env` atau `.env.local` di `frontend/` bila perlu:
  - `VITE_API_BASE=http://localhost:3000`

## Quality: Lint, Format, Test

- Lint: `npm run lint`
- Format: `npm run format` atau `npm run format:check`
- Test:
  - `npm run test` (watch)
  - `npm run test:coverage` (threshold 80% lines/func/branches/statements)

Pre-commit hooks aktif untuk menjalankan format dan lint otomatis saat commit (`husky` + `lint-staged`). Jalankan sekali:

```bash
npm run prepare
```
