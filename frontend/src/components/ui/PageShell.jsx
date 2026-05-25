export default function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = '',
}) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-6 text-slate-950 sm:px-6 md:py-8 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/10">
          <div className="border-b border-white/10 bg-blue-600/10 px-5 py-3">
            {eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
                {eyebrow}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
