import { resolveTextStrict } from '../../../shared/lib/text';
import LanguageTabs from './LanguageTabs';

export default function AdditionalForm({
  value,
  lang,
  setSectionLanguage,
  onChange,
  languageStatus,
  onCopyLanguage,
}) {
  const sectionKey = 'additional';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-slate-900">Informasi Tambahan</h3>
        <LanguageTabs
          lang={lang}
          onChange={(nextLang) => setSectionLanguage(sectionKey, nextLang)}
          status={languageStatus}
          onCopy={onCopyLanguage}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-700">Bahasa</label>
          <input
            value={resolveTextStrict(value.languages, lang)}
            onChange={(e) => onChange('languages', lang, e.target.value)}
            className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
            placeholder="Indonesia, Inggris"
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Minat</label>
          <input
            value={resolveTextStrict(value.interests, lang)}
            onChange={(e) => onChange('interests', lang, e.target.value)}
            className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
            placeholder="UI Design, AI"
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Penghargaan</label>
          <input
            value={resolveTextStrict(value.awards, lang)}
            onChange={(e) => onChange('awards', lang, e.target.value)}
            className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
            placeholder="Best Innovator 2024"
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Volunteer</label>
          <input
            value={resolveTextStrict(value.volunteer, lang)}
            onChange={(e) => onChange('volunteer', lang, e.target.value)}
            className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
            placeholder="Komunitas Teknologi"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-slate-700">Publikasi</label>
          <input
            value={resolveTextStrict(value.publications, lang)}
            onChange={(e) => onChange('publications', lang, e.target.value)}
            className="w-full p-3 mt-1 rounded-lg text-black border border-slate-200"
            placeholder="Judul publikasi"
          />
        </div>
      </div>
    </div>
  );
}
