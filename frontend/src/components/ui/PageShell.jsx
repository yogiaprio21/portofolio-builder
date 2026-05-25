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
      className={`mx-auto w-full max-w-6xl px-4 py-5 text-slate-950 sm:px-6 md:py-7 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-5 border-b border-slate-200 pb-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
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
