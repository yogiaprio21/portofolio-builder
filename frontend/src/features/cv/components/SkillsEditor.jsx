import { resolveText } from '../../../shared/lib/text';

export default function SkillsEditor({
  lang,
  languageOptions,
  setSectionLanguage,
  items,
  addGroup,
  updateLocalizedField,
  updateEntry,
  removeEntry,
  addEntry,
  removeGroup,
  errors,
  attemptSubmit,
  markIfError,
  levelOptions,
}) {
  const sectionKey = 'skills';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Keahlian</h3>
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
          onClick={() => addGroup({ category: '', items: [] })}
          className="px-3 py-1 rounded-lg bg-blue-600 text-sm"
        >
          Tambah
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={`skill-${index}`}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-sm text-slate-700">Kategori</label>
              <input
                value={resolveText(item.category, lang)}
                onChange={(e) => updateLocalizedField(index, 'category', lang, e.target.value)}
                className="w-full p-2 rounded text-black border border-slate-200 mt-1"
                placeholder="Kategori"
              />
            </div>
            <button onClick={() => removeGroup(index)} className="text-xs text-red-500">
              Hapus Kategori
            </button>
          </div>
          <div className="space-y-4">
            {(Array.isArray(item.items) ? item.items : []).map((skill, skillIndex) => {
              const normalizedSkill =
                typeof skill === 'string'
                  ? { name: { [lang]: skill }, level: '', proof: { [lang]: '' } }
                  : skill || { name: { [lang]: '' }, level: '', proof: { [lang]: '' } };
              const skillName = resolveText(normalizedSkill?.name, lang);
              return (
                <div
                  key={`skill-${index}-${skillIndex}`}
                  className="bg-white rounded-lg border border-slate-200 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">
                      Keahlian {skillIndex + 1}
                    </div>
                    <button
                      onClick={() => removeEntry(index, skillIndex)}
                      className="text-xs text-red-500"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-700">Nama Keahlian*</label>
                      <input
                        value={skillName}
                        onChange={(e) =>
                          updateEntry(index, skillIndex, 'name', e.target.value, lang)
                        }
                        aria-required="true"
                        className={`w-full p-2 rounded text-black border ${markIfError(
                          `skills.${index}.items.${skillIndex}.name`,
                        )}`}
                        placeholder="Nama Keahlian"
                      />
                      {attemptSubmit && errors[`skills.${index}.items.${skillIndex}.name`] && (
                        <div className="text-xs text-red-600 mt-1">
                          {errors[`skills.${index}.items.${skillIndex}.name`]}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Tingkat</label>
                      <select
                        value={normalizedSkill?.level || ''}
                        onChange={(e) => updateEntry(index, skillIndex, 'level', e.target.value)}
                        className="w-full p-2 rounded text-black border border-slate-200"
                      >
                        <option value="">{lang === 'en' ? 'Level' : 'Tingkat'}</option>
                        {levelOptions[lang].map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-700">
                        {lang === 'en' ? 'Usage or Certificate' : 'Contoh penggunaan / Sertifikat'}
                      </label>
                      <input
                        value={resolveText(normalizedSkill?.proof, lang)}
                        onChange={(e) =>
                          updateEntry(index, skillIndex, 'proof', e.target.value, lang)
                        }
                        className="w-full p-2 rounded text-black border border-slate-200"
                        placeholder={
                          lang === 'en' ? 'Contoh: Sertifikasi AWS' : 'Contoh: Sertifikasi AWS'
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end">
              <button
                onClick={() => addEntry(index)}
                className="px-3 py-1 rounded-lg bg-slate-900 text-white text-sm"
              >
                Tambah Keahlian
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
