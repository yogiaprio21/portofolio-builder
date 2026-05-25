import { resolveArrayStrict, resolveTextStrict } from '../../../shared/lib/text';
import LanguageTabs from './LanguageTabs';

export default function ExperienceList({
  sectionKey,
  title,
  lang,
  setSectionLanguage,
  items,
  addItem,
  updateLocalizedField,
  updateListField,
  updateHighlightsByDot,
  removeItem,
  errors,
  attemptSubmit,
  markIfError,
  languageStatus,
  onCopyLanguage,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <LanguageTabs
            lang={lang}
            onChange={(value) => setSectionLanguage(sectionKey, value)}
            status={languageStatus}
            onCopy={onCopyLanguage}
          />
        </div>
        <button
          onClick={() =>
            addItem(sectionKey, {
              role: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              highlights: [],
            })
          }
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {(items || []).map((item, index) => (
        <div
          key={`${sectionKey}-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">Posisi*</label>
            <input
              value={resolveTextStrict(item.role, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, 'role', lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `${sectionKey}.${index}.role`,
              )}`}
              placeholder="Posisi"
            />
            {attemptSubmit && errors[`${sectionKey}.${index}.role`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`${sectionKey}.${index}.role`]}
              </div>
            )}
            <label className="text-sm text-slate-700">Perusahaan*</label>
            <input
              value={resolveTextStrict(item.company, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, 'company', lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `${sectionKey}.${index}.company`,
              )}`}
              placeholder="Perusahaan"
            />
            {attemptSubmit && errors[`${sectionKey}.${index}.company`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`${sectionKey}.${index}.company`]}
              </div>
            )}
            <input
              value={resolveTextStrict(item.location, lang)}
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
          </div>
          <textarea
            value={resolveArrayStrict(item.highlights, lang).join('. ')}
            onChange={(e) =>
              updateHighlightsByDot(sectionKey, index, 'highlights', lang, e.target.value)
            }
            className="w-full p-2 rounded text-black border border-slate-200"
            rows={3}
            placeholder="Pencapaian (pisahkan dengan titik .)"
          />
          <button onClick={() => removeItem(sectionKey, index)} className="text-xs text-red-500">
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
