export default function SkeletonCard({ className = 'h-40' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}
