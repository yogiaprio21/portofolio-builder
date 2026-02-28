export default function ImportPanel({
  importMessage,
  onFileSelected,
  aiMessage,
  aiLoading,
  canEnhance,
  onEnhance,
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Import CV dari File</h3>
          <p className="text-sm text-slate-500">Dukung .json dan .txt sederhana</p>
        </div>
        <input
          type="file"
          accept=".json,.txt,.pdf"
          onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          className="text-sm"
        />
      </div>
      {importMessage && <div className="text-xs text-emerald-600">{importMessage}</div>}
      <div className="flex items-center justify-between gap-3">
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
