import { resolveText } from '../../../shared/lib/text';

export default function EducationList({
  lang,
  languageOptions,
  setSectionLanguage,
  items,
  addItem,
  updateLocalizedField,
  updateListField,
  removeItem,
  errors,
  attemptSubmit,
  markIfError,
}) {
  const sectionKey = 'education';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Pendidikan</h3>
          <select
            value={lang}
            onChange={(e) => setSectionLanguage(sectionKey, e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() =>
            addItem(sectionKey, {
              degree: '',
              institution: '',
              location: '',
              startDate: '',
              endDate: '',
              gpa: '',
            })
          }
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={`edu-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">Gelar*</label>
            <input
              value={resolveText(item.degree, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, 'degree', lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `education.${index}.degree`,
              )}`}
              placeholder="Gelar"
            />
            {attemptSubmit && errors[`education.${index}.degree`] && (
              <div className="text-xs text-red-600 mt-1">{errors[`education.${index}.degree`]}</div>
            )}
            <label className="text-sm text-slate-700">Institusi*</label>
            <input
              value={resolveText(item.institution, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, 'institution', lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `education.${index}.institution`,
              )}`}
              placeholder="Institusi"
            />
            {attemptSubmit && errors[`education.${index}.institution`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`education.${index}.institution`]}
              </div>
            )}
            <input
              value={resolveText(item.location, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, 'location', lang, e.target.value)
              }
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Lokasi"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.startDate}
                onChange={(e) => updateListField(sectionKey, index, 'startDate', e.target.value)}
                className="w-full p-2 rounded text-black border border-slate-200"
                placeholder="Mulai"
              />
              <input
                value={item.endDate}
                onChange={(e) => updateListField(sectionKey, index, 'endDate', e.target.value)}
                className="w-full p-2 rounded text-black border border-slate-200"
                placeholder="Selesai"
              />
            </div>
            <input
              value={item.gpa}
              onChange={(e) => updateListField(sectionKey, index, 'gpa', e.target.value)}
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="GPA (opsional)"
            />
          </div>
          <button onClick={() => removeItem(sectionKey, index)} className="text-xs text-red-500">
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
