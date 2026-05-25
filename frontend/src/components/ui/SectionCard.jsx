export default function SectionCard({ children, className = '', tone = 'light' }) {
  const toneClass =
    tone === 'light'
      ? 'border-slate-200 bg-white/96 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)]'
      : tone === 'dark'
        ? 'border-slate-800 bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]'
        : tone === 'tint'
          ? 'border-blue-100 bg-blue-50/80 text-slate-900 shadow-[0_10px_30px_rgba(37,99,235,0.08)]'
          : 'border-slate-200 bg-white text-slate-900 shadow-sm';

  return <section className={`rounded-lg border ${toneClass} ${className}`}>{children}</section>;
}
