import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

export default function FormWorkspace({
  activeStepIndex,
  stepKeys,
  activeStepKey,
  stepLabels,
  remainingSteps,
  progressPercent,
  completion,
  completionLabel,
  isAnimating,
  renderStepContent,
  onSelectStep,
  onBack,
  onNext,
}) {
  return (
    <section className="cv-editor-surface rounded-lg border border-slate-200 bg-white/95 p-4 text-slate-900 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone={completion.isComplete ? 'emerald' : 'amber'}>
            {completion.isComplete ? 'Siap disimpan' : 'Masih perlu dilengkapi'}
          </Badge>
          <h2 className="mt-3 text-xl font-black">{stepLabels[activeStepKey] || activeStepKey}</h2>
          <p className="text-sm text-slate-500">
            Auto-save aktif. Error hanya muncul saat diperlukan.
          </p>
        </div>
        <div className="max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-600">
          {completionLabel}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>
            Langkah {activeStepIndex + 1} dari {stepKeys.length}
          </span>
          <span>{remainingSteps} langkah tersisa</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stepKeys.map((key, index) => (
            <button
              key={`${key}-${index}`}
              type="button"
              onClick={() => onSelectStep(index)}
              className={`min-h-8 shrink-0 rounded-full px-3 text-xs font-bold ${
                index === activeStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {index + 1}. {stepLabels[key] || key}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mt-5 transform-gpu rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all duration-300 sm:p-5 ${
          isAnimating ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        {renderStepContent()}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="light" onClick={onBack} disabled={activeStepIndex === 0}>
          Kembali
        </Button>
        <Button type="button" onClick={onNext}>
          {activeStepIndex === stepKeys.length - 1 ? 'Simpan & Lanjutkan' : 'Selanjutnya'}
        </Button>
      </div>
    </section>
  );
}
