export default function MetricCard({ label, value, helper, tone = 'blue' }) {
  const toneClass = {
    blue: 'from-blue-600/12 to-cyan-500/10 text-blue-700',
    emerald: 'from-emerald-600/12 to-teal-500/10 text-emerald-700',
    amber: 'from-amber-500/14 to-orange-500/10 text-amber-700',
  }[tone];

  return (
    <div className={`rounded-xl border border-slate-200 bg-gradient-to-br ${toneClass} p-4`}>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-950">{value}</div>
      {helper && <div className="mt-1 text-xs leading-relaxed text-slate-500">{helper}</div>}
    </div>
  );
}
