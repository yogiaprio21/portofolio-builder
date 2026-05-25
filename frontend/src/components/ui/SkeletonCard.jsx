export default function SkeletonCard({ className = 'h-40' }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
}
