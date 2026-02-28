import { resolveText } from "../../../shared/lib/text";

export default function ProjectsList({
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
  const sectionKey = "projects";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Proyek</h3>
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
              name: "",
              role: "",
              description: "",
              tech: "",
              link: "",
            })
          }
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={`proj-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">Nama Proyek*</label>
            <input
              value={resolveText(item.name, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "name", lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `projects.${index}.name`,
              )}`}
              placeholder="Nama Proyek"
            />
            {attemptSubmit && errors[`projects.${index}.name`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`projects.${index}.name`]}
              </div>
            )}
            <input
              value={resolveText(item.role, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "role", lang, e.target.value)
              }
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Peran"
            />
            <input
              value={resolveText(item.tech, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "tech", lang, e.target.value)
              }
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Teknologi"
            />
            <input
              value={item.link}
              onChange={(e) => updateListField(sectionKey, index, "link", e.target.value)}
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Link"
            />
          </div>
          <textarea
            value={resolveText(item.description, lang)}
            onChange={(e) =>
              updateLocalizedField(sectionKey, index, "description", lang, e.target.value)
            }
            className="w-full p-2 rounded text-black border border-slate-200"
            rows={3}
            placeholder="Deskripsi proyek (pisahkan dengan titik .)"
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
