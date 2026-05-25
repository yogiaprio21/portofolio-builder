import Badge from '../../components/ui/Badge.jsx';
import Stepper from '../../components/ui/Stepper.jsx';

const flowGroups = [
  ['Mulai', ['personal', 'summary']],
  ['Riwayat', ['workExperience', 'experience', 'education', 'projects']],
  ['Kredensial', ['skills', 'certifications', 'achievements']],
  ['Finalisasi', ['references', 'additional']],
];

export default function BuilderRail({
  stepperItems,
  activeStepIndex,
  activeStepKey,
  onSelectStep,
  selectedTemplate,
  onOpenTemplate,
  onScrollToImport,
}) {
  const activeGroup = flowGroups.find(([, keys]) => keys.includes(activeStepKey))?.[0] || 'Mulai';

  return (
    <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-auto xl:pr-1">
      <section className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Badge tone="blue">{activeGroup}</Badge>
            <h2 className="mt-3 text-lg font-black">Alur pengisian</h2>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
            <div className="text-sm font-black text-blue-700">{activeStepIndex + 1}</div>
            <div className="text-[10px] font-bold text-blue-500">step</div>
          </div>
        </div>
        <Stepper steps={stepperItems} currentIndex={activeStepIndex} onSelect={onSelectStep} />
      </section>

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-4 shadow-sm">
        <div className="text-sm font-black text-slate-900">Mulai cepat</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Import CV lama, lalu rapikan hasilnya dengan AI sebelum lanjut mengisi manual.
        </p>
        <button
          type="button"
          onClick={onScrollToImport}
          className="mt-3 min-h-9 w-full rounded-lg bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Buka Import & AI
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm">
        <div className="text-sm font-black text-slate-900">Template</div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {selectedTemplate
            ? `${selectedTemplate.name} - ${selectedTemplate.category || 'Template'}`
            : 'Belum ada template dipilih.'}
        </p>
        <button
          type="button"
          onClick={onOpenTemplate}
          className="mt-3 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
        >
          {selectedTemplate ? 'Ganti Template' : 'Pilih Template'}
        </button>
      </section>
    </aside>
  );
}
