const tones = {
  info: 'border-blue-400/25 bg-blue-400/10 text-blue-100',
  success: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  warning: 'border-yellow-400/25 bg-yellow-400/10 text-yellow-100',
  error: 'border-red-400/25 bg-red-400/10 text-red-100',
};

export default function Alert({ tone = 'info', title, children, className = '' }) {
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${tones[tone] || tones.info} ${className}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
