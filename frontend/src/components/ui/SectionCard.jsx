export default function SectionCard({ children, className = '', tone = 'dark' }) {
  const toneClass =
    tone === 'light'
      ? 'border-slate-200 bg-white text-slate-900'
      : tone === 'dark'
        ? 'border-white/10 bg-slate-950 text-white'
        : 'border-slate-200 bg-white text-slate-900';

  return (
    <section className={`rounded-xl border shadow-sm ${toneClass} ${className}`}>
      {children}
    </section>
  );
}
