import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ImportPanel({
  importMessage,
  importDiagnostics,
  onFileSelected,
  aiMessage,
  aiLoading,
  canEnhance,
  onEnhance,
  aiReview,
  onApplyAiReview,
  onDiscardAiReview,
  documentLanguageMode,
  setDocumentLanguageMode,
  selectedTemplate,
  onOpenTemplate,
}) {
  const reviewSections = aiReview?.sections || [];
  const [firstSection, ...otherSections] = reviewSections;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-5">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ['Template', selectedTemplate?.name || 'Belum dipilih'],
          [
            'Bahasa',
            documentLanguageMode === 'bilingual'
              ? 'Bilingual'
              : documentLanguageMode === 'en'
                ? 'English'
                : 'Indonesia',
          ],
          ['AI Review', aiReview ? `${reviewSections.length} section siap` : 'Belum ada hasil'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
              {label}
            </div>
            <div className="mt-1 line-clamp-1 text-sm font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-5">
          <Badge tone="blue">Import</Badge>
          <h3 className="mt-3 text-lg font-black">Import CV dari file</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Gunakan file `.json`, `.txt`, atau `.pdf` sederhana sebagai titik awal. Setelah import,
            data tetap bisa diedit manual.
          </p>
          <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500">
            Pilih File
            <input
              type="file"
              accept=".json,.txt,.pdf"
              onChange={(event) => event.target.files?.[0] && onFileSelected(event.target.files[0])}
              className="sr-only"
            />
          </label>
          {importMessage && (
            <Alert tone="success" className="mt-4">
              {importMessage}
            </Alert>
          )}
          {importDiagnostics && (
            <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <span>Karakter: {importDiagnostics.characters}</span>
              <span>Baris: {importDiagnostics.lines}</span>
              <span>Email: {importDiagnostics.hasEmail ? 'terdeteksi' : 'belum terdeteksi'}</span>
              <span>
                Heading: {importDiagnostics.hasSectionHeading ? 'terdeteksi' : 'perlu dicek'}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <Badge tone="slate">Setup & AI assistant</Badge>
          <h3 className="mt-3 text-lg font-black">Rapikan konten dengan AI</h3>
          <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-500">
            {aiMessage || 'AI akan membaca teks import dan membantu menyusun section CV.'}
          </p>
          <div className="mt-4 grid gap-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Bahasa dokumen
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['id', 'ID'],
                  ['en', 'EN'],
                  ['bilingual', 'ID+EN'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDocumentLanguageMode(value)}
                    className={`min-h-9 rounded-lg border text-xs font-black ${
                      documentLanguageMode === value
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={onOpenTemplate} className="w-full">
              {selectedTemplate ? 'Ganti Template' : 'Pilih Template'}
            </Button>
          </div>
          <Button
            type="button"
            onClick={onEnhance}
            disabled={aiLoading || !canEnhance}
            variant={canEnhance ? 'primary' : 'secondary'}
            className="mt-5 w-full"
          >
            {aiLoading ? 'Memproses AI...' : 'Tingkatkan dengan AI'}
          </Button>
          {aiReview && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-black text-emerald-950">
                Review hasil AI dari {aiReview.provider}
                {aiReview.model ? ` (${aiReview.model})` : ''}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900/70">
                Section yang diterapkan akan mengganti isi section terkait, tetapi data profil hanya
                mengisi field kosong.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[firstSection, ...otherSections.slice(0, 5)].filter(Boolean).map((section) => (
                  <span
                    key={section}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-800"
                  >
                    {section}
                  </span>
                ))}
                {otherSections.length > 5 && (
                  <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-800">
                    +{otherSections.length - 5}
                  </span>
                )}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={() => onApplyAiReview(reviewSections)}>
                  Terapkan hasil AI
                </Button>
                <Button type="button" variant="secondary" onClick={onDiscardAiReview}>
                  Batalkan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
