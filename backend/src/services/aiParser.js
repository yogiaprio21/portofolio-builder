const config = require('../config/env');
const logger = require('../utils/logger');

const emptyCv = {
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  },
  summary: { id: '', en: '' },
  workExperience: [],
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  references: [],
  languageBySection: {
    summary: 'id',
    workExperience: 'id',
    experience: 'id',
    education: 'id',
    skills: 'id',
    projects: 'id',
    certifications: 'id',
    achievements: 'id',
    references: 'id',
    additional: 'id'
  },
  additional: {
    languages: { id: '', en: '' },
    interests: { id: '', en: '' },
    awards: { id: '', en: '' },
    volunteer: { id: '', en: '' },
    publications: { id: '', en: '' }
  }
};

const sectionAliases = {
  summary: ['summary', 'profile', 'professional summary', 'ringkasan', 'profil', 'tentang saya', 'about'],
  workExperience: ['work experience', 'professional experience', 'employment', 'career history', 'pengalaman kerja', 'riwayat pekerjaan'],
  experience: ['experience', 'pengalaman'],
  education: ['education', 'academic background', 'pendidikan', 'riwayat pendidikan'],
  skills: ['skills', 'technical skills', 'core skills', 'competencies', 'keahlian', 'keterampilan', 'kemampuan'],
  projects: ['projects', 'selected projects', 'portfolio', 'proyek', 'projek'],
  certifications: ['certifications', 'certificates', 'licenses', 'sertifikasi', 'lisensi'],
  achievements: ['achievements', 'awards', 'accomplishments', 'pencapaian', 'prestasi', 'penghargaan'],
  references: ['references', 'referees', 'referensi'],
  languages: ['languages', 'language', 'bahasa'],
  interests: ['interests', 'hobbies', 'minat', 'hobi'],
  volunteer: ['volunteer', 'volunteering', 'relawan', 'organisasi'],
  publications: ['publications', 'publikasi']
};

function normalizeLine(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[▪●◦]/g, '•')
    .replace(/([A-Za-z])\s+-\s+([A-Za-z])/g, '$1-$2')
    .replace(/\bundefined\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(items) {
  return [...new Set(items.map((item) => normalizeLine(item)).filter(Boolean))];
}

function detectLanguage(text) {
  const value = String(text || '').toLowerCase();
  const idScore = ['pengalaman', 'pendidikan', 'keahlian', 'proyek', 'sertifikasi', 'pencapaian', 'bahasa'].filter((word) => value.includes(word)).length;
  const enScore = ['experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'languages'].filter((word) => value.includes(word)).length;
  return idScore > enScore ? 'id' : 'en';
}

function matchSection(line) {
  const value = normalizeLine(line).toLowerCase().replace(/[:\-]+$/, '');
  const compact = value.replace(/\s+/g, '');
  if (/^education/.test(compact)) return 'education';
  if (/^workexperience|^professionalexperience/.test(compact)) return 'workExperience';
  if (/^profile|^professionalsummary|^summary/.test(compact)) return 'summary';
  if (/^certification|^certifications|^certificate/.test(compact)) return 'certifications';
  if (/^additionalinformation/.test(compact)) return 'additional';
  for (const [key, aliases] of Object.entries(sectionAliases)) {
    if (aliases.some((alias) => value === alias || value.startsWith(`${alias}:`))) {
      return key;
    }
  }
  return null;
}

function splitLines(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[▪●◦]/g, '•')
    .replace(/([A-Za-z])\s+-\s+([A-Za-z])/g, '$1-$2')
    .replace(/\bundefined\b/gi, '')
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
}

function detectSectionIndices(lines) {
  const indices = {};
  const languageBySection = {};
  lines.forEach((line, idx) => {
    const key = matchSection(line);
    if (!key || indices[key] != null) return;
    indices[key] = idx;
    languageBySection[key] = detectLanguage(line);
  });
  return { indices, languageBySection };
}

function sliceSections(lines, indices) {
  const sorted = Object.entries(indices).sort((a, b) => a[1] - b[1]);
  const sections = {};
  sorted.forEach(([key, start], idx) => {
    const end = sorted[idx + 1]?.[1] ?? lines.length;
    sections[key] = lines.slice(start + 1, end).filter((line) => !matchSection(line));
  });
  return sections;
}

function stripBullet(value) {
  return normalizeLine(value).replace(/^[-*•\u2022]\s*/, '').trim();
}

function parseBullets(lines) {
  return unique(lines.map(stripBullet));
}

function extractPersonal(lines) {
  const firstLines = lines.slice(0, 12);
  const joined = firstLines.join(' ');
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = joined.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || '';
  const urls = unique(joined.match(/https?:\/\/[^\s)]+|(?:www\.)[^\s)]+/gi) || []);
  const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || '';
  const github = urls.find((url) => /github\.com/i.test(url)) || '';
  const website = urls.find((url) => url !== linkedin && url !== github) || '';
  const name = firstLines.find((line) => {
    if (line.length > 80) return false;
    if (email && line.includes(email)) return false;
    if (phone && line.includes(phone)) return false;
    if (matchSection(line)) return false;
    return /[A-Za-z]/.test(line);
  }) || '';
  const headline = firstLines.find((line) => line !== name && line.length < 100 && !line.includes('@') && !matchSection(line)) || '';

  return {
    fullName: name,
    headline,
    email,
    phone,
    location: '',
    website,
    linkedin,
    github
  };
}

function parseDateRange(value) {
  const text = normalizeLine(value);
  const month = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)';
  const year = '(?:19|20)\\d{2}';
  const date = `(?:${month}\\s+)?${year}`;
  const regex = new RegExp(`(${date})\\s*(?:-|–|—|to|s/d|hingga| sampai )\\s*((?:${date})|present|current|now|sekarang)`, 'i');
  const match = text.match(regex);
  if (!match) return { startDate: '', endDate: '' };
  return { startDate: match[1], endDate: match[2] };
}

function looksLikeEntryHeader(line) {
  if (!line) return false;
  if (/^[-*•\u2022]/.test(line)) return false;
  if (parseDateRange(line).startDate) return true;
  return /(\s+-\s+|\s+—\s+|\s+@\s+|\s+ at\s+)/i.test(line);
}

function splitHeader(line) {
  const withoutDate = normalizeLine(line).replace(/\(?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)?\s*(?:19|20)\d{2}\s*(?:-|–|—|to|s\/d|hingga|sampai)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)?\s*(?:19|20)\d{2}|present|current|now|sekarang))\)?/i, '').trim();
  const parts = withoutDate.split(/\s+-\s+|\s+—\s+|\s+@\s+|\s+ at\s+/i).map(normalizeLine).filter(Boolean);
  return { first: parts[0] || withoutDate, second: parts[1] || '' };
}

function parseExperience(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    if (looksLikeEntryHeader(line)) {
      if (current) entries.push(current);
      const { first, second } = splitHeader(line);
      const dates = parseDateRange(line);
      current = {
        role: first,
        company: second,
        location: '',
        startDate: dates.startDate,
        endDate: dates.endDate,
        highlights: []
      };
      continue;
    }

    if (!current && line) {
      current = { role: line, company: '', location: '', startDate: '', endDate: '', highlights: [] };
      continue;
    }

    if (current && line) {
      current.highlights.push(stripBullet(line));
    }
  }

  if (current) entries.push(current);
  return entries.filter((entry) => entry.role || entry.company || entry.highlights.length);
}

function parseEducation(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    const dates = parseDateRange(line);
    const clean = line.replace(`${dates.startDate}`, '').replace(`${dates.endDate}`, '').replace(/\s*(-|–|—|to|s\/d|hingga|sampai)\s*/i, ' ').trim();
    if (!current || looksLikeEntryHeader(line) || /university|universitas|school|college|academy|institut|politeknik/i.test(line)) {
      if (current) entries.push(current);
      const parts = clean.split(/\s+-\s+|\s+—\s+|,\s*/).map(normalizeLine).filter(Boolean);
      current = {
        degree: parts[0] || clean,
        institution: parts[1] || '',
        location: '',
        startDate: dates.startDate,
        endDate: dates.endDate,
        gpa: line.match(/(?:GPA|IPK)[:\s]+([0-9.]+)/i)?.[1] || ''
      };
    }
  }

  if (current) entries.push(current);
  return entries.filter((entry) => entry.degree || entry.institution);
}

function parseSkills(lines) {
  const text = lines.join('\n');
  const groups = [];
  for (const line of text.split(/\n/)) {
    const cleaned = stripBullet(line);
    if (!cleaned) continue;
    const categoryMatch = cleaned.match(/^([^:]{2,40}):\s*(.+)$/);
    if (categoryMatch) {
      groups.push({
        category: categoryMatch[1].trim(),
        items: unique(categoryMatch[2].split(/[,;|/•\u2022]/))
      });
    } else {
      const items = unique(cleaned.split(/[,;|/•\u2022]/));
      if (items.length) groups.push({ category: '', items });
    }
  }
  const flat = groups.flatMap((group) => group.items);
  return groups.length > 1 ? groups : (flat.length ? [{ category: '', items: unique(flat) }] : []);
}

function parseProjects(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    const cleaned = stripBullet(line);
    if (!cleaned) continue;
    const url = cleaned.match(/https?:\/\/[^\s)]+/)?.[0] || '';
    if (!/^[-*•\u2022]/.test(line) && (!current || looksLikeEntryHeader(cleaned))) {
      if (current) entries.push(current);
      current = { name: cleaned.replace(url, '').trim(), role: '', description: '', tech: '', link: url };
    } else {
      if (!current) current = { name: '', role: '', description: '', tech: '', link: '' };
      if (/tech|stack|tools|teknologi/i.test(cleaned)) current.tech = cleaned.replace(/^[^:]+:\s*/, '');
      else current.description = current.description ? `${current.description} ${cleaned}` : cleaned;
      if (url && !current.link) current.link = url;
    }
  }

  if (current) entries.push(current);
  return entries.filter((entry) => entry.name || entry.description);
}

function parseCertifications(lines) {
  return parseBullets(lines).map((line) => {
    const parts = line.split(/\s+-\s+|\s+—\s+|,\s*/).map(normalizeLine).filter(Boolean);
    return {
      name: parts[0] || line,
      issuer: parts[1] || '',
      date: line.match(/(?:19|20)\d{2}/)?.[0] || '',
      credentialUrl: line.match(/https?:\/\/[^\s)]+/)?.[0] || ''
    };
  });
}

function parseAchievements(lines) {
  return parseBullets(lines).map((line) => ({
    title: line,
    date: line.match(/(?:19|20)\d{2}/)?.[0] || '',
    description: ''
  }));
}

function normalizeCv(cv, languageBySection = {}) {
  const source = cv || {};
  return {
    ...emptyCv,
    ...source,
    personal: { ...emptyCv.personal, ...(source.personal || {}) },
    summary: typeof source.summary === 'object' ? { ...emptyCv.summary, ...source.summary } : { id: source.summary || '', en: '' },
    workExperience: asArray(source.workExperience),
    experience: asArray(source.experience),
    education: asArray(source.education),
    skills: asArray(source.skills),
    projects: asArray(source.projects),
    certifications: asArray(source.certifications),
    achievements: asArray(source.achievements),
    references: asArray(source.references),
    languageBySection: { ...emptyCv.languageBySection, ...(source.languageBySection || {}), ...languageBySection },
    additional: { ...emptyCv.additional, ...(source.additional || {}) }
  };
}

function cleanAiScalar(value) {
  const text = normalizeLine(value);
  if (!text || /^(undefined|null|n\/a|unknown)$/i.test(text)) return '';
  return text;
}

function cleanLocalizedText(value) {
  if (typeof value === 'string') return cleanAiScalar(value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return { ...value, id: cleanAiScalar(value.id), en: cleanAiScalar(value.en) };
}

function cleanLocalizedArray(value) {
  if (Array.isArray(value)) return unique(value.map(cleanAiScalar));
  if (!value || typeof value !== 'object') return value;
  return {
    ...value,
    id: unique(asArray(value.id).map(cleanAiScalar)),
    en: unique(asArray(value.en).map(cleanAiScalar))
  };
}

function trimSummary(value) {
  const stopPattern = /\b(education|work experience|professional experience|projects|certification|certifications|achievements|additional information|skills|pendidikan|pengalaman kerja|sertifikasi|pencapaian|keahlian)\b/i;
  const cleanOne = (text) => {
    const beforeNextSection = cleanAiScalar(text).split(stopPattern)[0].trim();
    return beforeNextSection
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .slice(0, 5)
      .join(' ')
      .trim();
  };
  if (typeof value === 'string') return cleanOne(value);
  return { id: cleanOne(value?.id), en: cleanOne(value?.en) };
}

function sanitizeListItem(section, item) {
  const next = { ...(item || {}) };
  for (const key of Object.keys(next)) {
    if (key === 'highlights') {
      next[key] = cleanLocalizedArray(next[key]);
    } else if (
      [
        'role',
        'company',
        'location',
        'degree',
        'institution',
        'category',
        'name',
        'issuer',
        'description',
        'title',
        'tech',
        'proof'
      ].includes(key)
    ) {
      next[key] = cleanLocalizedText(next[key]);
    } else if (typeof next[key] === 'string') {
      next[key] = cleanAiScalar(next[key]);
    }
  }
  if (section === 'skills') {
    next.items = asArray(next.items)
      .map((entry) => {
        if (typeof entry === 'string') return cleanAiScalar(entry);
        return {
          ...(entry || {}),
          name: cleanLocalizedText(entry?.name),
          level: cleanAiScalar(entry?.level),
          proof: cleanLocalizedText(entry?.proof)
        };
      })
      .filter((entry) =>
        typeof entry === 'string' ? entry : cleanAiScalar(entry?.name?.id || entry?.name?.en)
      );
  }
  return next;
}

function sanitizeResult(result) {
  const source = result || {};
  const cv = normalizeCv(source.cv || {}, source.languageBySection || source.cv?.languageBySection || {});
  cv.personal = Object.fromEntries(
    Object.entries(cv.personal || {}).map(([key, value]) => [key, cleanAiScalar(value)])
  );
  cv.summary = trimSummary(cv.summary);
  for (const section of [
    'workExperience',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'achievements',
    'references'
  ]) {
    cv[section] = asArray(cv[section]).map((item) => sanitizeListItem(section, item));
  }
  cv.additional = {
    ...cv.additional,
    languages: cleanLocalizedText(cv.additional?.languages),
    interests: cleanLocalizedText(cv.additional?.interests),
    awards: cleanLocalizedText(cv.additional?.awards),
    volunteer: cleanLocalizedText(cv.additional?.volunteer),
    publications: cleanLocalizedText(cv.additional?.publications)
  };
  return {
    ...source,
    cv,
    languageBySection: { ...(cv.languageBySection || {}), ...(source.languageBySection || {}) }
  };
}

function heuristicEnhanceCv(text, hintLanguageBySection = {}) {
  const lines = splitLines(text);
  const { indices, languageBySection } = detectSectionIndices(lines);
  const sectionMap = sliceSections(lines, indices);
  const docLanguage = detectLanguage(text);
  const summaryLines = sectionMap.summary || lines.slice(1, Math.min(lines.length, 5)).filter((line) => !line.includes('@') && !matchSection(line));

  const additional = { ...emptyCv.additional };
  if (sectionMap.languages) additional.languages = { [docLanguage]: parseBullets(sectionMap.languages).join(', ') };
  if (sectionMap.interests) additional.interests = { [docLanguage]: parseBullets(sectionMap.interests).join(', ') };
  if (sectionMap.volunteer) additional.volunteer = { [docLanguage]: parseBullets(sectionMap.volunteer).join(' ') };
  if (sectionMap.publications) additional.publications = { [docLanguage]: parseBullets(sectionMap.publications).join(' ') };

  const cv = normalizeCv({
    personal: extractPersonal(lines),
    summary: { [docLanguage]: summaryLines.join(' ') },
    workExperience: parseExperience(sectionMap.workExperience || []),
    experience: parseExperience(sectionMap.experience || []),
    education: parseEducation(sectionMap.education || []),
    skills: parseSkills(sectionMap.skills || []),
    projects: parseProjects(sectionMap.projects || []),
    certifications: parseCertifications(sectionMap.certifications || []),
    achievements: parseAchievements(sectionMap.achievements || []),
    references: parseBullets(sectionMap.references || []),
    additional
  }, { ...hintLanguageBySection, ...languageBySection });

  return { cv, languageBySection: cv.languageBySection, provider: 'heuristic' };
}

async function parseCvText(text, hintLanguageBySection = {}, options = {}) {
  const clippedText = splitLines(text).join('\n').slice(0, config.ai.maxInputChars);
  const chain = Array.isArray(config.ai.providerChain) && config.ai.providerChain.length
    ? config.ai.providerChain
    : [config.ai.provider];

  for (const provider of chain) {
    if (provider === 'heuristic') {
      return sanitizeResult(heuristicEnhanceCv(clippedText, hintLanguageBySection));
    }

    try {
      if (provider === 'openai') {
        const { parseWithOpenAi } = require('./openaiCvParser');
        return sanitizeResult(await parseWithOpenAi(clippedText, hintLanguageBySection, options));
      }
      if (provider === 'gemini') {
        const { parseWithGemini } = require('./geminiCvParser');
        return sanitizeResult(await parseWithGemini(clippedText, hintLanguageBySection, options));
      }
      if (provider === 'groq') {
        const { parseWithGroq } = require('./groqCvParser');
        return sanitizeResult(await parseWithGroq(clippedText, hintLanguageBySection, options));
      }
      if (provider === 'openrouter') {
        const { parseWithOpenRouter } = require('./openrouterCvParser');
        return sanitizeResult(await parseWithOpenRouter(clippedText, hintLanguageBySection, options));
      }
      logger.warn('Unknown AI provider skipped', { provider });
    } catch (err) {
      logger.warn('AI provider failed, trying next provider', { provider, error: err.message });
    }
  }

  return sanitizeResult(heuristicEnhanceCv(clippedText, hintLanguageBySection));
}

exports.enhanceCv = heuristicEnhanceCv;
exports.parseCvText = parseCvText;
exports.normalizeCv = normalizeCv;
exports.sanitizeResult = sanitizeResult;
