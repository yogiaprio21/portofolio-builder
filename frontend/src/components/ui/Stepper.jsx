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
                    ? 'border-blue-400 bg-blue-500/15 text-white'
                    : complete
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-white/85'
                      : 'border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.07]',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    active ? 'bg-blue-500 text-white' : complete ? 'bg-emerald-500 text-white' : 'bg-white/10',
                  ].join(' ')}
                >
                  {complete ? '✓' : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{step.label}</span>
                  {step.help && <span className="block truncate text-xs opacity-70">{step.help}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
