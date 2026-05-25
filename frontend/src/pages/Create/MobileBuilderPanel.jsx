import Badge from '../../components/ui/Badge.jsx';
import SectionOrderControl from './SectionOrderControl.jsx';
import ThemeControls from './ThemeControls.jsx';

export default function MobileBuilderPanel({
  progressPercent,
  stepperItems,
  activeStepIndex,
  onSelectStep,
  sectionsOrder,
  stepLabels,
  dragKey,
  onDragStart,
  onDrop,
  theme,
  setTheme,
  fontOptions,
}) {
  return (
    <div className="space-y-4 xl:hidden">
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-white shadow-xl shadow-slate-950/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="blue">Builder</Badge>
            <h1 className="mt-3 text-2xl font-black tracking-tight">Buat CV</h1>
            <p className="mt-1 text-sm leading-relaxed text-white/68">
              Isi langkah aktif, lalu cek preview di bawah form.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-center">
            <div className="text-lg font-black text-blue-200">{progressPercent}%</div>
            <div className="text-[11px] font-bold text-white/58">lengkap</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {stepperItems.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelectStep(index)}
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-bold ${
                index === activeStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {index + 1}. {step.label}
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-lg border border-blue-100 bg-blue-50/85 p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-black text-slate-900">
          Atur tampilan dan section
        </summary>
        <div className="mt-4 grid gap-4">
          <ThemeControls theme={theme} setTheme={setTheme} fontOptions={fontOptions} compact />
          <div>
            <h4 className="mb-2 text-sm font-black">Urutan Section</h4>
            <SectionOrderControl
              sectionsOrder={sectionsOrder}
              stepLabels={stepLabels}
              dragKey={dragKey}
              onDragStart={onDragStart}
              onDrop={onDrop}
              compact
            />
          </div>
        </div>
      </details>
    </div>
  );
}
