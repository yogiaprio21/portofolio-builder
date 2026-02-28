import { resolveText } from "../../../shared/lib/text";

export default function SummaryForm({
  value,
  lang,
  onChangeLanguage,
  languageOptions,
  onChangeText,
  errors,
  attemptSubmit,
  markIfError,
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">Ringkasan</h3>
        <select
          value={lang}
          onChange={(e) => onChangeLanguage(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={resolveText(value, lang)}
        onChange={(e) => onChangeText(lang, e.target.value)}
        className={`w-full p-3 mt-3 rounded-lg text-black border ${markIfError("summary")}`}
        rows={4}
        placeholder="Ringkasan profesional dan tujuan karier"
      />
      {attemptSubmit && errors?.summary && (
        <div className="text-xs text-red-600 mt-1">{errors.summary}</div>
      )}
    </div>
  );
}
