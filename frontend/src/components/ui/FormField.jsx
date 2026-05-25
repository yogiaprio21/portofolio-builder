export default function FormField({ id, label, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-slate-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      {error && (
        <div id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
