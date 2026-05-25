export default function ProgressRing({ value = 0, label = 'progress' }) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#2563eb ${normalized * 3.6}deg, #e2e8f0 0deg)`,
      }}
      aria-label={`${label} ${normalized}%`}
    >
      <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white">
        <span className="text-xl font-extrabold text-slate-950">{normalized}%</span>
      </div>
    </div>
  );
}
