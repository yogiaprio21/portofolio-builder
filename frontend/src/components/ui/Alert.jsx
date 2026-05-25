const tones = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  dark: 'border-white/10 bg-white/[0.06] text-white/75',
};

export default function Alert({ tone = 'info', title, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border p-4 text-sm leading-relaxed ${tones[tone] || tones.info} ${className}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
