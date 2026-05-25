import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

export default function BuilderTopBar({
  progressPercent,
  activeStepLabel,
  remainingSteps,
  completionLabel,
  selectedTemplate,
  onOpenTemplate,
  onSubmit,
}) {
  return (
    <header className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/10">
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <Badge tone="blue">CV Builder</Badge>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Buat CV</h1>
            <span className="pb-1 text-sm font-semibold text-white/58">{activeStepLabel}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/68">
            Isi satu bagian, cek preview, lalu lanjutkan. {remainingSteps} langkah tersisa.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
          <div className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-200">
                Progress
              </span>
              <span className="text-sm font-black text-white">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 max-w-64 truncate text-xs text-white/58">{completionLabel}</div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button type="button" variant="dark" onClick={onOpenTemplate}>
              {selectedTemplate ? 'Ganti Template' : 'Pilih Template'}
            </Button>
            <Button type="button" onClick={onSubmit}>
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
