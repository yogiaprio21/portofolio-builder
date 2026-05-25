export default function MetricCard({ label, value, helper, tone = 'blue' }) {
  const toneClass = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className={`rounded-lg border ${toneClass} p-4 shadow-sm`}>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-950">{value}</div>
      {helper && <div className="mt-1 text-xs leading-relaxed text-slate-500">{helper}</div>}
    </div>
  );
}
