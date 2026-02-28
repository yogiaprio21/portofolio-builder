import { resolveText } from "../../../shared/lib/text";

export default function CertificationsList({
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
  const sectionKey = "certifications";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Sertifikasi</h3>
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
              issuer: "",
              date: "",
              credentialUrl: "",
            })
          }
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={`cert-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm text-slate-700">Nama Sertifikasi*</label>
            <input
              value={resolveText(item.name, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "name", lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `certifications.${index}.name`,
              )}`}
              placeholder="Nama Sertifikasi"
            />
            {attemptSubmit && errors[`certifications.${index}.name`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`certifications.${index}.name`]}
              </div>
            )}
            <label className="text-sm text-slate-700">Penerbit*</label>
            <input
              value={resolveText(item.issuer, lang)}
              onChange={(e) =>
                updateLocalizedField(sectionKey, index, "issuer", lang, e.target.value)
              }
              aria-required="true"
              className={`w-full p-2 rounded text-black border ${markIfError(
                `certifications.${index}.issuer`,
              )}`}
              placeholder="Penerbit"
            />
            {attemptSubmit && errors[`certifications.${index}.issuer`] && (
              <div className="text-xs text-red-600 mt-1">
                {errors[`certifications.${index}.issuer`]}
              </div>
            )}
            <input
              value={item.date}
              onChange={(e) => updateListField(sectionKey, index, "date", e.target.value)}
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Tanggal"
            />
            <input
              value={item.credentialUrl}
              onChange={(e) =>
                updateListField(sectionKey, index, "credentialUrl", e.target.value)
              }
              className="w-full p-2 rounded text-black border border-slate-200"
              placeholder="Link Kredensial"
            />
          </div>
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
