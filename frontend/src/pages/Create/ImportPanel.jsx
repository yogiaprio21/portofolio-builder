import Alert from '../../components/ui/Alert.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ImportPanel({
  importMessage,
  onFileSelected,
  aiMessage,
  aiLoading,
  canEnhance,
  onEnhance,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-5">
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
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <Badge tone="slate">AI assistant</Badge>
          <h3 className="mt-3 text-lg font-black">Rapikan konten dengan AI</h3>
          <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-500">
            {aiMessage || 'AI akan membaca teks import dan membantu menyusun section CV.'}
          </p>
          <Button
            type="button"
            onClick={onEnhance}
            disabled={aiLoading || !canEnhance}
            variant={canEnhance ? 'primary' : 'secondary'}
            className="mt-5 w-full"
          >
            {aiLoading ? 'Memproses AI...' : 'Tingkatkan dengan AI'}
          </Button>
        </div>
      </div>
    </section>
  );
}
