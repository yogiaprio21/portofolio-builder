export default function PageShell({ eyebrow, title, description, actions, children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 ${className}`}>
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow && <p className="mb-2 text-sm font-semibold text-blue-300">{eyebrow}</p>}
            {title && <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>}
            {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
