export default function Stepper({ steps, currentIndex, onSelect }) {
  return (
    <nav aria-label="Langkah pembuatan CV">
      <ol className="grid gap-2">
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const complete = index < currentIndex;
          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelect?.(index)}
                className={[
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition',
                  active
                    ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-sm'
                    : complete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    active
                      ? 'bg-blue-600 text-white'
                      : complete
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600',
                  ].join(' ')}
                >
                  {complete ? '✓' : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{step.label}</span>
                  {step.help && (
                    <span className="block truncate text-xs opacity-70">{step.help}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
