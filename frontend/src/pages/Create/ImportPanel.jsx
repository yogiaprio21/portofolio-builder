export default function ImportPanel({
  importMessage,
  onFileSelected,
  aiMessage,
  aiLoading,
  canEnhance,
  onEnhance,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl sm:p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Import CV dari File</h3>
          <p className="text-sm text-slate-500">Dukung .json, .txt, dan .pdf sederhana</p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold hover:bg-slate-100">
          Pilih File
          <input
            type="file"
            accept=".json,.txt,.pdf"
            onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
            className="sr-only"
          />
        </label>
      </div>
      {importMessage && <div className="text-xs text-emerald-600">{importMessage}</div>}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="text-sm text-slate-500">{aiMessage}</div>
        <button
          onClick={onEnhance}
          disabled={aiLoading || !canEnhance}
          className={`px-3 py-2 rounded-lg text-sm font-semibold ${
            aiLoading || !canEnhance
              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {aiLoading ? 'Memproses AI…' : 'Tingkatkan dengan AI'}
        </button>
      </div>
    </div>
  );
}
