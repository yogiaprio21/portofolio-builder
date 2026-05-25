export default function SectionCard({ children, className = '', tone = 'light' }) {
  const toneClass =
    tone === 'light'
      ? 'border-slate-200 bg-white/95 text-slate-900'
      : tone === 'dark'
        ? 'border-white/10 bg-slate-950 text-white'
        : tone === 'tint'
          ? 'border-blue-100 bg-blue-50/80 text-slate-900'
          : 'border-slate-200 bg-white text-slate-900';

  return (
    <section className={`rounded-xl border shadow-sm ${toneClass} ${className}`}>
      {children}
    </section>
  );
}
