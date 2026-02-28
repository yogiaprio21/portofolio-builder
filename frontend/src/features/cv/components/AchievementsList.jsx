import { resolveText } from "../../../shared/lib/text";

export default function AchievementsList({
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
  const sectionKey = "achievements";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Pencapaian</h3>
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
            addItem(sectionKey, { title: "", date: "", description: "" })
          }
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={`ach-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">Judul*</label>
            <input
              value={resolveText(item.title, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "title", lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `achievements.${index}.title`,
              )}`}
              placeholder="Judul"
            />
            {attemptSubmit && errors[`achievements.${index}.title`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`achievements.${index}.title`]}
              </div>
            )}
            <input
              value={item.date}
              onChange={(e) => updateListField(sectionKey, index, "date", e.target.value)}
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Tanggal"
            />
          </div>
          <textarea
            value={resolveText(item.description, lang)}
            onChange={(e) =>
              updateLocalizedField(
                sectionKey,
                index,
                "description",
                lang,
                e.target.value,
              )
            }
            className="w-full p-2 rounded text-black border border-slate-200"
            rows={3}
            placeholder="Deskripsi (pisahkan dengan titik .)"
          />
          <button
            onClick={() => removeItem(sectionKey, index)}
            className="text-xs text-red-500"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
