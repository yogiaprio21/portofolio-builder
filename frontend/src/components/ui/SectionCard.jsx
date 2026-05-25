export default function SectionCard({ children, className = '', tone = 'dark' }) {
  const toneClass =
    tone === 'light'
      ? 'border-slate-200 bg-white text-slate-900'
      : 'border-white/10 bg-white/[0.05] text-white';

  return (
    <section className={`rounded-xl border ${toneClass} ${className}`}>
      {children}
    </section>
  );
}
