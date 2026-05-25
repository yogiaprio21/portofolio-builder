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
    <section className="rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-sm sm:p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">Import opsional</Badge>
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500">
            Upload CV
            <input
              type="file"
              accept=".json,.txt,.pdf"
              onChange={(event) => event.target.files?.[0] && onFileSelected(event.target.files[0])}
              className="sr-only"
            />
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {[
              ['id', 'ID'],
              ['en', 'EN'],
              ['bilingual', 'ID+EN'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDocumentLanguageMode(value)}
                className={`min-h-8 rounded-md px-2 text-xs font-black ${
                  documentLanguageMode === value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={onEnhance}
            disabled={aiLoading || !canEnhance}
            variant={canEnhance ? 'primary' : 'secondary'}
            size="sm"
          >
            {aiLoading ? 'Memproses...' : 'Rapikan AI'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onOpenTemplate}>
            {selectedTemplate ? 'Template siap' : 'Pilih Template'}
          </Button>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {aiReview
            ? `${reviewSections.length} section siap direview`
            : importDiagnostics
              ? `${importDiagnostics.lines} baris terbaca`
              : aiMessage || 'Upload PDF/TXT/JSON jika ingin mulai dari CV lama.'}
        </div>
      </div>

      {(importMessage || importDiagnostics || aiMessage) && (
        <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="text-sm text-slate-600">
            {importMessage || aiMessage || 'Dokumen berhasil dibaca. Cek hasil section sebelum disimpan.'}
          </div>
          {importDiagnostics && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{importDiagnostics.characters} karakter</span>
              <span>{importDiagnostics.hasEmail ? 'Email terdeteksi' : 'Email belum terdeteksi'}</span>
              <span>{importDiagnostics.hasSectionHeading ? 'Heading terdeteksi' : 'Heading perlu cek'}</span>
            </div>
          )}
        </div>
      )}

      {aiReview && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-emerald-950">
                Review AI dari {aiReview.provider}
                {aiReview.model ? ` (${aiReview.model})` : ''}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[firstSection, ...otherSections.slice(0, 5)].filter(Boolean).map((section) => (
                  <span
                    key={section}
                    className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800"
                  >
                    {section}
                  </span>
                ))}
                {otherSections.length > 5 && (
                  <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-800">
                    +{otherSections.length - 5}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => onApplyAiReview(reviewSections)}>
                Terapkan
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={onDiscardAiReview}>
                Batalkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
