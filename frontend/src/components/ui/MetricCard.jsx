export default function MetricCard({ label, value, helper, tone = 'blue' }) {
  const toneClass = {
    blue: 'border-blue-100 from-blue-600/14 to-cyan-500/12 text-blue-700',
    emerald: 'border-emerald-100 from-emerald-600/14 to-teal-500/12 text-emerald-700',
    amber: 'border-amber-100 from-amber-500/18 to-orange-500/12 text-amber-700',
  }[tone];

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${toneClass} p-4 shadow-sm`}>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-950">{value}</div>
      {helper && <div className="mt-1 text-xs leading-relaxed text-slate-500">{helper}</div>}
    </div>
  );
}
