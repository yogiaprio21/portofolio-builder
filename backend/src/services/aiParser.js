const normalizeLine = (s) => (s || '').trim();

function detectSectionIndices(lines) {
  const labelMap = {
    experience: { id: ['pengalaman'], en: ['experience'] },
    workExperience: { id: ['pengalaman kerja'], en: ['work experience'] },
    education: { id: ['pendidikan'], en: ['education'] },
    skills: { id: ['keahlian'], en: ['skills'] },
    projects: { id: ['proyek'], en: ['projects'] },
    certifications: { id: ['sertifikasi'], en: ['certifications'] },
    achievements: { id: ['pencapaian', 'prestasi'], en: ['achievements'] },
    references: { id: ['referensi'], en: ['references'] }
  };
  const indices = {};
  const sectionLangMap = {};
  lines.forEach((raw, idx) => {
    const l = normalizeLine(raw).toLowerCase();
    Object.entries(labelMap).forEach(([key, langs]) => {
      if (indices[key] != null) return;
      if (langs.id.some((p) => l === p || l.startsWith(p + ':'))) {
        indices[key] = idx;
        sectionLangMap[key] = 'id';
      } else if (langs.en.some((p) => l === p || l.startsWith(p + ':'))) {
        indices[key] = idx;
        sectionLangMap[key] = 'en';
      }
    });
  });
  return { indices, sectionLangMap };
}

function sliceSection(lines, start, end) {
  const s = start != null ? start + 1 : null;
  const e = end != null ? end : lines.length;
  if (s == null) return [];
  return lines.slice(s, e).map(normalizeLine);
}

function parseBullets(arr) {
  const items = [];
  arr.forEach((l) => {
    if (!l) return;
    const m = l.match(/^[-*\u2022]\s*(.+)/);
    items.push(m ? m[1].trim() : l.trim());
  });
  return items.filter((x) => x.length > 0);
}

function parseExperience(arr) {
  const out = [];
  let current = null;
  arr.forEach((l) => {
    const mDate =
      l.match(/([A-Za-z]+|\d{2})\s*\d{4}[^\d]+([A-Za-z]+|\d{2})?\s*(\d{4}|present|sekarang)/i) ||
      l.match(/(\d{4})(?:[^\d]+)(\d{4}|present|sekarang)/i);
    const mHeader = l.match(/^(.+?)\s[—-]\s(.+)/) || l.match(/^(.+?)\s+at\s+(.+)/i);
    if (mHeader || mDate) {
      if (current) out.push(current);
      const role = mHeader ? mHeader[1].trim() : '';
      const company = mHeader ? mHeader[2].trim() : '';
      const startDate = mDate ? (mDate[3] ? `${mDate[1]} ${mDate[2]}` : mDate[1]) : '';
      const endDate = mDate ? (mDate[3] || mDate[2] || '') : '';
      current = { role, company, location: '', startDate, endDate, highlights: [] };
    } else if (/^[-*\u2022]/.test(l)) {
      if (!current) current = { role: '', company: '', location: '', startDate: '', endDate: '', highlights: [] };
      const bullet = l.replace(/^[-*\u2022]\s*/, '').trim();
      if (bullet) current.highlights.push(bullet);
    }
  });
  if (current) out.push(current);
  return out;
}

function parseEducation(arr) {
  const out = [];
  let current = null;
  arr.forEach((l) => {
    const mDate =
      l.match(/([A-Za-z]+|\d{2})\s*\d{4}[^\d]+([A-Za-z]+|\d{2})?\s*(\d{4}|present|sekarang)/i) ||
      l.match(/(\d{4})(?:[^\d]+)(\d{4}|present|sekarang)/i);
    const mHeader = l.match(/^(.+?),\s*(.+)$/);
    if (mHeader || mDate) {
      if (current) out.push(current);
      const degree = mHeader ? mHeader[1].trim() : '';
      const institution = mHeader ? mHeader[2].trim() : '';
      const startDate = mDate ? (mDate[3] ? `${mDate[1]} ${mDate[2]}` : mDate[1]) : '';
      const endDate = mDate ? (mDate[3] || mDate[2] || '') : '';
      current = { degree, institution, location: '', startDate, endDate, gpa: '' };
    }
  });
  if (current) out.push(current);
  return out;
}

function parseSkills(arr) {
  const textJoined = arr.join(' ');
  const items = textJoined.split(/[\n;,•\u2022]/).map((x) => x.trim()).filter((x) => x.length > 0);
  return items.length ? [{ category: '', items }] : [];
}

function parseProjects(arr) {
  const out = [];
  let current = null;
  arr.forEach((l) => {
    if (/^[-*\u2022]/.test(l)) {
      if (!current) current = { name: '', role: '', description: '', tech: '', link: '' };
      const bullet = l.replace(/^[-*\u2022]\s*/, '').trim();
      current.description = current.description ? current.description + ' ' + bullet : bullet;
    } else if (l) {
      if (current) {
        out.push(current);
        current = null;
      } else {
        out.push({ name: l.trim(), role: '', description: '', tech: '', link: '' });
      }
    }
  });
  if (current) out.push(current);
  return out;
}

function parseCertifications(arr) {
  return arr
    .map((l) => {
      const parts = l.split(/[•—-]/).map((x) => x.trim()).filter(Boolean);
      if (parts.length >= 2) return { name: parts[0], issuer: parts[1], date: '', credentialUrl: '' };
      return null;
    })
    .filter(Boolean);
}

function parseAchievements(arr) {
  const items = parseBullets(arr);
  return items.map((t) => ({ title: t, date: '', description: '' }));
}

exports.enhanceCv = (text, hintLanguageBySection = {}) => {
  const lines = String(text || '').split(/\r?\n/);
  const { indices, sectionLangMap } = detectSectionIndices(lines);
  const orderKeys = ['workExperience', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'references'];
  const sorted = orderKeys.filter((k) => indices[k] != null).sort((a, b) => indices[a] - indices[b]);
  const sections = {};
  sorted.forEach((key, i) => {
    const start = indices[key];
    const end = i < sorted.length - 1 ? indices[sorted[i + 1]] : lines.length;
    sections[key] = sliceSection(lines, start, end);
  });

  const cv = {
    summary: { id: '', en: '' },
    workExperience: parseExperience(sections.workExperience || []),
    experience: parseExperience(sections.experience || []),
    education: parseEducation(sections.education || []),
    skills: parseSkills(sections.skills || []),
    projects: parseProjects(sections.projects || []),
    certifications: parseCertifications(sections.certifications || []),
    achievements: parseAchievements(sections.achievements || [])
  };

  const languageBySection = { ...(hintLanguageBySection || {}), ...(sectionLangMap || {}) };

  return { cv, languageBySection };
};
