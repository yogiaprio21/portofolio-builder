const tones = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
  dark: 'border-white/10 bg-white/10 text-white/80',
};

export default function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-black',
        tones[tone] || tones.slate,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
