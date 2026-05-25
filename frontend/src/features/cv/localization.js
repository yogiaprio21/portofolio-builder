import { hasText } from '../../shared/lib/text';

const localizedFields = {
  workExperience: ['role', 'company', 'location', 'highlights'],
  experience: ['role', 'company', 'location', 'highlights'],
  education: ['degree', 'institution', 'location'],
  skills: ['category'],
  certifications: ['name', 'issuer'],
  projects: ['name', 'role', 'description', 'tech'],
  achievements: ['title', 'description'],
  references: ['name', 'title', 'company'],
};

const localizedAdditionalFields = ['languages', 'interests', 'awards', 'volunteer', 'publications'];

const listSections = [
  'workExperience',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'achievements',
  'references',
];

export const languageLabels = {
  id: 'Indonesia',
  en: 'English',
};

export function detectDocumentLanguage(text) {
  const value = String(text || '').toLowerCase();
  const idScore = [
    'pengalaman',
    'pendidikan',
    'keahlian',
    'proyek',
    'sertifikasi',
    'pencapaian',
    'bahasa',
  ].filter((word) => value.includes(word)).length;
  const enScore = [
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'achievements',
    'languages',
  ].filter((word) => value.includes(word)).length;
  return enScore > idScore ? 'en' : 'id';
}

export function localizedText(value, lang = 'id') {
  if (!value) return { id: '', en: '' };
  if (typeof value === 'string')
    return { id: lang === 'id' ? value : '', en: lang === 'en' ? value : '' };
  if (typeof value === 'object' && !Array.isArray(value)) {
    return { id: value.id || '', en: value.en || '' };
  }
  return { id: '', en: '' };
}

export function localizedArray(value, lang = 'id') {
  if (!value) return { id: [], en: [] };
  if (Array.isArray(value))
    return { id: lang === 'id' ? value : [], en: lang === 'en' ? value : [] };
  if (typeof value === 'object') {
    return {
      id: Array.isArray(value.id) ? value.id : [],
      en: Array.isArray(value.en) ? value.en : [],
    };
  }
  return { id: [], en: [] };
}

function normalizeListItem(section, item, lang) {
  const next = { ...(item || {}) };
  for (const field of localizedFields[section] || []) {
    if (field === 'highlights') next[field] = localizedArray(next[field], lang);
    else next[field] = localizedText(next[field], lang);
  }
  if (section === 'skills') {
    next.items = Array.isArray(next.items)
      ? next.items.map((entry) => {
          if (typeof entry === 'string') {
            return { name: localizedText(entry, lang), level: '', proof: localizedText('', lang) };
          }
          return {
            ...(entry || {}),
            name: localizedText(entry?.name, lang),
            proof: localizedText(entry?.proof, lang),
          };
        })
      : [];
  }
  return next;
}

export function normalizeCvLocalization(cv, lang = 'id') {
  const source = cv || {};
  const next = {
    ...source,
    summary: localizedText(source.summary, lang),
    languageBySection: { ...(source.languageBySection || {}) },
    additional: { ...(source.additional || {}) },
  };

  for (const section of listSections) {
    next[section] = Array.isArray(source[section])
      ? source[section].map((item) => normalizeListItem(section, item, lang))
      : [];
  }

  for (const field of localizedAdditionalFields) {
    next.additional[field] = localizedText(next.additional[field], lang);
  }

  return next;
}

function keepExisting(current, incoming) {
  if (hasText(current)) return current;
  return incoming;
}

function mergeObjectEmptyOnly(current = {}, incoming = {}) {
  const next = { ...current };
  for (const [key, value] of Object.entries(incoming || {})) {
    next[key] = keepExisting(next[key], value);
  }
  return next;
}

export function mergeImportedCv(current, imported, { replaceSections = [] } = {}) {
  const source = imported || {};
  const replaceSet = new Set(replaceSections);
  const next = {
    ...current,
    personal: mergeObjectEmptyOnly(current.personal, source.personal),
    summary: replaceSet.has('summary')
      ? source.summary || current.summary
      : keepExisting(current.summary, source.summary),
    additional: { ...(current.additional || {}) },
    languageBySection: {
      ...(current.languageBySection || {}),
      ...(source.languageBySection || {}),
    },
  };

  for (const section of listSections) {
    const incoming = Array.isArray(source[section]) ? source[section] : [];
    const existing = Array.isArray(current[section]) ? current[section] : [];
    next[section] = replaceSet.has(section) || !existing.length ? incoming : existing;
  }

  for (const field of localizedAdditionalFields) {
    next.additional[field] = replaceSet.has('additional')
      ? source.additional?.[field] || current.additional?.[field]
      : keepExisting(current.additional?.[field], source.additional?.[field]);
  }

  return next;
}

export function sectionLanguageStatus(cv, section) {
  const source = cv || {};
  const values = [];
  if (section === 'summary') values.push(source.summary);
  else if (section === 'additional')
    values.push(...localizedAdditionalFields.map((field) => source.additional?.[field]));
  else if (Array.isArray(source[section])) {
    for (const item of source[section]) {
      for (const field of localizedFields[section] || []) values.push(item?.[field]);
      if (section === 'skills') {
        for (const entry of item.items || []) {
          values.push(entry?.name, entry?.proof);
        }
      }
    }
  }

  const status = { id: false, en: false };
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'string') status.id = status.id || value.trim().length > 0;
    if (Array.isArray(value))
      status.id = status.id || value.some((item) => String(item || '').trim());
    if (typeof value === 'object' && !Array.isArray(value)) {
      status.id = status.id || hasText(value.id);
      status.en = status.en || hasText(value.en);
    }
  }
  return status;
}

function copyValueLanguage(value, fromLang, toLang) {
  if (!value) return value;
  if (typeof value === 'string') {
    return {
      id: fromLang === 'id' ? value : '',
      en: fromLang === 'en' ? value : '',
      [toLang]: value,
    };
  }
  if (Array.isArray(value)) {
    return {
      id: fromLang === 'id' ? value : [],
      en: fromLang === 'en' ? value : [],
      [toLang]: value,
    };
  }
  if (typeof value === 'object') {
    const source = value[fromLang] || (Array.isArray(value[toLang]) ? [] : '');
    return { ...value, [toLang]: Array.isArray(source) ? [...source] : source };
  }
  return value;
}

export function copySectionLanguage(cv, section, fromLang, toLang) {
  if (!section || fromLang === toLang) return cv;
  const next = {
    ...cv,
    languageBySection: { ...(cv.languageBySection || {}), [section]: toLang },
  };

  if (section === 'summary') {
    next.summary = copyValueLanguage(cv.summary, fromLang, toLang);
    return next;
  }

  if (section === 'additional') {
    next.additional = { ...(cv.additional || {}) };
    for (const field of localizedAdditionalFields) {
      next.additional[field] = copyValueLanguage(next.additional[field], fromLang, toLang);
    }
    return next;
  }

  next[section] = Array.isArray(cv[section])
    ? cv[section].map((item) => {
        const nextItem = { ...item };
        for (const field of localizedFields[section] || []) {
          nextItem[field] = copyValueLanguage(nextItem[field], fromLang, toLang);
        }
        if (section === 'skills') {
          nextItem.items = Array.isArray(nextItem.items)
            ? nextItem.items.map((entry) => ({
                ...(entry || {}),
                name: copyValueLanguage(entry?.name, fromLang, toLang),
                proof: copyValueLanguage(entry?.proof, fromLang, toLang),
              }))
            : [];
        }
        return nextItem;
      })
    : [];
  return next;
}
