import { Link } from 'react-router-dom';

export default function BrandLogo({
  to = '/',
  className = '',
  markClassName = '',
  textClassName = '',
  compact = false,
}) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-950',
        className,
      ].join(' ')}
      aria-label="PortoBuilder"
    >
      <img
        src="/portobuilder-mark.svg"
        alt=""
        aria-hidden="true"
        className={['h-10 w-10 shrink-0', markClassName].join(' ')}
      />
      {!compact && (
        <span
          className={['text-xl font-extrabold tracking-tight text-white', textClassName].join(' ')}
        >
          Porto<span className="text-blue-300">Builder</span>
        </span>
      )}
    </Link>
  );
}
