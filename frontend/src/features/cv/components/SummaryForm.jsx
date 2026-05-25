import { resolveTextStrict } from '../../../shared/lib/text';
import LanguageTabs from './LanguageTabs';

export default function SummaryForm({
  value,
  lang,
  onChangeLanguage,
  onChangeText,
  errors,
  attemptSubmit,
  markIfError,
  languageStatus,
  onCopyLanguage,
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-slate-900">Ringkasan</h3>
        <LanguageTabs
          lang={lang}
          onChange={onChangeLanguage}
          status={languageStatus}
          onCopy={onCopyLanguage}
        />
      </div>
      <textarea
        value={resolveTextStrict(value, lang)}
        onChange={(e) => onChangeText(lang, e.target.value)}
        className={`w-full p-3 mt-3 rounded-lg text-black border ${markIfError('summary')}`}
        rows={4}
        placeholder={
          lang === 'en'
            ? 'Professional summary in English'
            : 'Ringkasan profesional dan tujuan karier'
        }
      />
      {attemptSubmit && errors?.summary && (
        <div className="text-xs text-red-600 mt-1">{errors.summary}</div>
      )}
    </div>
  );
}
