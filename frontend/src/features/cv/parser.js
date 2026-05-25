const sectionHeadingPatterns = [
  {
    key: 'summary',
    lang: 'en',
    re: /^\s*(profile|professional\s+summary|summary|about\s+me)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'summary',
    lang: 'id',
    re: /^\s*(profil|ringkasan|tentang\s+saya)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'workExperience',
    lang: 'en',
    re: /^\s*(work\s+experience|professional\s+experience|employment|career\s+history)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'workExperience',
    lang: 'id',
    re: /^\s*(pengalaman\s+kerja|riwayat\s+pekerjaan)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'experience',
    lang: 'en',
    re: /^\s*(organization\s+experience|organizational\s+experience|leadership\s+experience|experience)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'experience',
    lang: 'id',
    re: /^\s*(pengalaman\s+organisasi|pengalaman)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'education',
    lang: 'en',
    re: /^\s*(e\s*d\s*u\s*c\s*a\s*t\s*i\s*o\s*n|education|academic\s+background)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'education',
    lang: 'id',
    re: /^\s*(pendidikan|riwayat\s+pendidikan)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'projects',
    lang: 'en',
    re: /^\s*(projects|selected\s+projects|portfolio)\s*[:-]?\s*(.*)$/i,
  },
  { key: 'projects', lang: 'id', re: /^\s*(proyek|projek)\s*[:-]?\s*(.*)$/i },
  {
    key: 'certifications',
    lang: 'en',
    re: /^\s*(certification|certifications|certificates|licenses)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'certifications',
    lang: 'id',
    re: /^\s*(sertifikasi|lisensi)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'achievements',
    lang: 'en',
    re: /^\s*(achievements|awards|accomplishments)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'achievements',
    lang: 'id',
    re: /^\s*(pencapaian|prestasi|penghargaan)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'skills',
    lang: 'en',
    re: /^\s*(software\s+skills|hard\s+skills|soft\s+skills|language\s+skills|skills|technical\s+skills|core\s+skills)\s*[:-]?\s*(.*)$/i,
  },
  {
    key: 'skills',
    lang: 'id',
    re: /^\s*(keahlian|keterampilan|kemampuan|bahasa)\s*[:-]?\s*(.*)$/i,
  },
  { key: 'references', lang: 'en', re: /^\s*(references|referees)\s*[:-]?\s*(.*)$/i },
  { key: 'references', lang: 'id', re: /^\s*(referensi)\s*[:-]?\s*(.*)$/i },
];

function normalizeLine(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/([A-Za-z])\s+-\s+([A-Za-z])/g, '$1-$2')
    .replace(/\s*([/@|])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanCvText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[▪●◦]/g, '•')
    .replace(/([A-Za-z])\s+-\s+([A-Za-z])/g, '$1-$2')
    .replace(/\bundefined\b/gi, '')
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function matchSectionHeading(line) {
  const normalized = normalizeLine(line);
  for (const pattern of sectionHeadingPatterns) {
    const match = normalized.match(pattern.re);
    if (match) {
      return {
        key: pattern.key,
        lang: pattern.lang,
        rest: normalizeLine(match[2] || ''),
      };
    }
  }
  return null;
}

export function segmentCvText(text) {
  const lines = cleanCvText(text).split(/\r?\n/).filter(Boolean);
  const sections = {};
  const sectionLangMap = {};
  const preamble = [];
  let currentKey = null;

  for (const line of lines) {
    const heading = matchSectionHeading(line);
    if (heading) {
      currentKey = heading.key;
      sectionLangMap[currentKey] = sectionLangMap[currentKey] || heading.lang;
      sections[currentKey] = sections[currentKey] || [];
      if (heading.rest) sections[currentKey].push(heading.rest);
      continue;
    }
    if (currentKey) sections[currentKey].push(line);
    else preamble.push(line);
  }

  return { preamble, sections, sectionLangMap, lines };
}

export const extractSectionsFromText = (text) => {
  const { sections, sectionLangMap } = segmentCvText(text);
  const parseBullets = (arr) => {
    const items = [];
    arr.forEach((l) => {
      if (!l) return;
      const m = l.match(/^[-*\u2022]\s*(.+)/);
      items.push(m ? m[1].trim() : l.trim());
    });
    return items.filter((x) => x.length > 0);
  };
  const parseDateRange = (value) => {
    const month =
      '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)';
    const year = '(?:19|20)\\d{2}';
    const date = `(?:${month}\\s+)?${year}`;
    const regex = new RegExp(
      `(${date})\\s*(?:-|–|—|to|s/d|hingga|sampai)\\s*(${date}|present|current|now|sekarang)`,
      'i',
    );
    const match = normalizeLine(value).match(regex);
    return match ? { startDate: match[1], endDate: match[2] } : { startDate: '', endDate: '' };
  };
  const looksLikeHeader = (line) => {
    if (!line || /^[-*•\u2022]/.test(line)) return false;
    return Boolean(parseDateRange(line).startDate) || /(\s+-\s+|\s+—\s+|\s+@\s+|\s+at\s+)/i.test(line);
  };
  const splitHeader = (line) => {
    const dates = parseDateRange(line);
    const datePattern = dates.startDate
      ? `${dates.startDate}\\s*(?:-|–|—|to|s/d|hingga|sampai)\\s*${dates.endDate}`
      : '';
    const withoutDate = datePattern
      ? normalizeLine(line).replace(new RegExp(datePattern, 'i'), '').trim()
      : normalizeLine(line);
    const parts = withoutDate
      .split(/\s+-\s+|\s+—\s+|\s+@\s+|\s+at\s+/i)
      .map(normalizeLine)
      .filter(Boolean);
    return { role: parts[0] || withoutDate, company: parts[1] || '', ...dates };
  };
  const parseExperience = (arr) => {
    const out = [];
    let current = null;
    arr.forEach((l) => {
      const line = normalizeLine(l);
      if (looksLikeHeader(line)) {
        if (current) out.push(current);
        const { role, company, startDate, endDate } = splitHeader(line);
        current = { role, company, location: '', startDate, endDate, highlights: [] };
      } else if (/^[-*•\u2022]/.test(line)) {
        if (!current)
          current = {
            role: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            highlights: [],
          };
        const bullet = line.replace(/^[-*•\u2022]\s*/, '').trim();
        if (bullet) current.highlights.push(bullet);
      } else if (current && line) {
        current.highlights.push(line);
      }
    });
    if (current) out.push(current);
    return out;
  };
  const parseEducation = (arr) => {
    const out = [];
    let current = null;
    arr.forEach((l) => {
      const line = normalizeLine(l);
      const dates = parseDateRange(line);
      if (!current || /university|universitas|school|college|academy|institut|politeknik/i.test(line) || dates.startDate) {
        if (current) out.push(current);
        const parts = line.split(/\s+-\s+|\s+—\s+|,\s*/).map(normalizeLine).filter(Boolean);
        current = {
          degree: parts.find((part) => /s1|s2|s3|bachelor|master|diploma|engineering|teknik/i.test(part)) || parts[0] || '',
          institution: parts.find((part) => /university|universitas|school|college|academy|institut|politeknik/i.test(part)) || '',
          location: '',
          startDate: dates.startDate,
          endDate: dates.endDate,
          gpa: line.match(/(?:GPA|IPK)[:\s]+([0-9.]+\s*\/\s*[0-9.]+|[0-9.]+)/i)?.[1] || '',
        };
      }
    });
    if (current) out.push(current);
    return out;
  };
  const parseSkills = (arr) => {
    const textJoined = arr.join(' ');
    const items = textJoined
      .split(/[\n;,•\u2022]/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    return items.length ? [{ category: '', items }] : [];
  };
  const parseProjects = (arr) => {
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
          out.push({
            name: l.trim(),
            role: '',
            description: '',
            tech: '',
            link: '',
          });
        }
      }
    });
    if (current) out.push(current);
    return out;
  };
  const parseCertifications = (arr) => {
    return arr
      .map((l) => {
        const parts = l
          .split(/[•—-]/)
          .map((x) => x.trim())
          .filter(Boolean);
        if (parts.length >= 2)
          return {
            name: parts[0],
            issuer: parts[1],
            date: '',
            credentialUrl: '',
          };
        return null;
      })
      .filter(Boolean);
  };
  const parseAchievements = (arr) => {
    const items = parseBullets(arr);
    return items.map((t) => ({ title: t, date: '', description: '' }));
  };
  return {
    experience: parseExperience(sections.experience || []),
    workExperience: parseExperience(sections.workExperience || []),
    education: parseEducation(sections.education || []),
    skills: parseSkills(sections.skills || []),
    projects: parseProjects(sections.projects || []),
    certifications: parseCertifications(sections.certifications || []),
    achievements: parseAchievements(sections.achievements || []),
    references: [],
    sectionLangMap,
  };
};

export const parsePdfToText = async (file) => {
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.mjs?url'),
  ]);
  const workerSrc = typeof worker.default === 'string' ? worker.default : '';
  if (workerSrc) GlobalWorkerOptions.workerSrc = workerSrc;
  const buffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const rows = new Map();
    for (const item of content.items) {
      const value = String(item.str || '').trim();
      if (!value) continue;
      const [, , , , x, y] = item.transform || [0, 0, 0, 0, 0, 0];
      const rowKey = Math.round(y / 4) * 4;
      const row = rows.get(rowKey) || [];
      row.push({ x, width: Number(item.width || 0), value });
      rows.set(rowKey, row);
    }
    const rowSegments = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .flatMap(([y, row]) => {
        const sorted = row.sort((a, b) => a.x - b.x);
        const segments = [];
        let current = [];
        let lastEnd = 0;
        for (const item of sorted) {
          const gap = item.x - lastEnd;
          if (current.length && gap > Math.max(28, viewport.width * 0.045)) {
            segments.push(current);
            current = [];
          }
          current.push(item);
          lastEnd = item.x + item.width;
        }
        if (current.length) segments.push(current);
        return segments.map((segment) => {
          const xStart = Math.min(...segment.map((item) => item.x));
          const xEnd = Math.max(...segment.map((item) => item.x + item.width));
          return {
            y,
            xStart,
            xEnd,
            text: normalizeLine(segment.map((item) => item.value).join(' ')),
          };
        });
      })
      .filter((segment) => segment.text);
    const pageText = rowSegments
      .sort((a, b) => (Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.xStart - b.xStart))
      .map((segment) => segment.text)
      .join('\n');
    pages.push(pageText);
  }
  const text = cleanCvText(pages.join('\n\n'));
  return {
    text,
    diagnostics: {
      pages: pdf.numPages,
      characters: text.length,
      lines: text.split(/\r?\n/).filter(Boolean).length,
      hasEmail: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
      hasSectionHeading: /(experience|pengalaman|education|pendidikan|skills|keahlian)/i.test(text),
      textLayerReadable: text.length >= 80,
    },
  };
};
