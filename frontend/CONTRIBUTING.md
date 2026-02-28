## Panduan Kontribusi

Terima kasih ingin berkontribusi! Ikuti panduan berikut agar perubahan konsisten dan berkualitas.

### Alur Kerja
- Fork dan buat branch fitur: `feat/nama-fitur` atau `fix/isu-spesifik`.
- Commit kecil dan deskriptif (imperative): `feat: tambah parser teks sederhana`.
- Buka Pull Request dengan deskripsi tujuan, perubahan, dan dampaknya.

### Standar Kode
- Ikuti prinsip SOLID, DRY, dan KISS.
- Pisahkan logika bisnis dari UI.
- Tempatkan util bersama di `src/shared/lib`, konfigurasi di `src/shared/config`.
- Fitur domain CV di `src/features/cv`, hindari komponen >300 baris.
- Gunakan penamaan deskriptif (camelCase untuk variabel/fungsi, PascalCase untuk komponen).

### Linting & Format
- Jalankan `npm run lint` dan `npm run format:check` sebelum commit.
- Pre-commit hook akan menjalankan `lint-staged` untuk format + lint otomatis.

### Testing
- Wajib menambah unit test dan/atau integration test dengan Vitest + RTL.
- Target coverage minimal 80% (`npm run test:coverage`).
- Mock dependensi eksternal (fetch, jsPDF, dll) pada test.

### Environment
- Gunakan `VITE_API_BASE` untuk base URL API. Jangan hardcode URL di kode.

### CI
- Pipeline CI menjalankan lint dan test otomatis. Perbaiki kegagalan sebelum merge.

