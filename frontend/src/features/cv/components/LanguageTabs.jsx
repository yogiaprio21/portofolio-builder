import { languageLabels } from '../localization';

export default function LanguageTabs({ lang, onChange, status, onCopy, className = '' }) {
  const sourceLang = lang === 'id' ? 'en' : 'id';
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {['id', 'en'].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`min-h-9 rounded-lg border px-3 text-xs font-black transition ${
            lang === value
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50'
          }`}
        >
          {languageLabels[value]}
          <span
            className={`ml-2 inline-flex h-2 w-2 rounded-full ${
              status?.[value] ? 'bg-emerald-400' : 'bg-slate-300'
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
      {onCopy && (
        <button
          type="button"
          onClick={() => onCopy(sourceLang, lang)}
          disabled={!status?.[sourceLang]}
          className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Salin dari {languageLabels[sourceLang]}
        </button>
      )}
    </div>
  );
}
