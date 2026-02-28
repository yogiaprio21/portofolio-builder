import { memo, useMemo } from 'react';
import { resolveText, resolveArray, renderDuration } from '../shared/lib/text';
const defaultSections = [
  'summary',
  'workExperience',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'achievements',
  'references',
  'additional'
];

const sectionTitles = {
  id: {
    summary: 'Ringkasan',
    workExperience: 'Pengalaman Kerja',
    experience: 'Pengalaman',
    education: 'Pendidikan',
    skills: 'Keahlian',
    certifications: 'Sertifikasi',
    projects: 'Proyek',
    achievements: 'Pencapaian',
    references: 'Referensi',
    additional: 'Informasi Tambahan'
  },
  en: {
    summary: 'Summary',
    workExperience: 'Work Experience',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    certifications: 'Certifications',
    projects: 'Projects',
    achievements: 'Achievements',
    references: 'References',
    additional: 'Additional Info'
  }
};

function TemplateRenderer({
  data = {},
  template = {},
  sectionsOrder = []
}) {
  const cv = data.cv ? data.cv : data;
  const theme = useMemo(() => data.theme || {}, [data.theme]);
  const layout = theme.layout || template.layout || 'single';
  const style = useMemo(() => ({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    headingColor: '#0f172a',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    sectionGap: 20,
    ...(template.style || {}),
    ...(theme || {})
  }), [template.style, theme]);
  const cssVars = useMemo(() => ({
    '--accent-color': style.accentColor,
    '--heading-color': style.headingColor,
    '--text-color': style.textColor,
    '--bg-color': style.backgroundColor
  }), [style]);

  const order =
    sectionsOrder.length > 0
      ? sectionsOrder
      : template.sections && template.sections.length
      ? template.sections
      : defaultSections;

  const personal = cv.personal || {};
  const languageBySection = data.languageBySection || cv.languageBySection || {};
  const getLang = (key) => languageBySection[key] || 'id';

  const sectionWrapperStyle = {
    marginBottom: style.sectionGap
  };
  const splitByDot = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => String(item || '').trim()).filter(Boolean);
    }
    return String(value)
      .split('.')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const renderSection = (key) => {
    if (key === 'summary') {
      const lang = getLang(key);
      const summaryText = resolveText(cv.summary, lang);
      if (!summaryText) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-2">
            {sectionTitles[lang]?.summary || sectionTitles.id.summary}
          </h3>
          <p className="text-sm leading-relaxed">{summaryText}</p>
        </section>
      );
    }

    if (key === 'workExperience') {
      const lang = getLang(key);
      if (!Array.isArray(cv.workExperience) || cv.workExperience.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.workExperience || sectionTitles.id.workExperience}
          </h3>
          <div className="space-y-4">
            {cv.workExperience.map((item, idx) => {
              const highlightValue = item?.highlights;
              const highlightList = (() => {
                if (Array.isArray(highlightValue)) return highlightValue;
                if (typeof highlightValue === 'string') {
                  return highlightValue
                    .split('.')
                    .map((value) => value.trim())
                    .filter(Boolean);
                }
                if (typeof highlightValue === 'object') {
                  const resolved = resolveArray(highlightValue, lang);
                  if (Array.isArray(resolved)) return resolved;
                  if (typeof resolved === 'string') {
                    return resolved
                      .split('.')
                      .map((value) => value.trim())
                      .filter(Boolean);
                  }
                }
                return [];
              })();
              return (
              <div key={`${resolveText(item.company, lang)}-${idx}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {resolveText(item.role, lang) || resolveText(item.title, lang)}
                    </div>
                    <div className="text-sm opacity-80">
                      {[resolveText(item.company, lang), resolveText(item.location, lang)]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  <div className="text-xs opacity-70">{renderDuration(item.startDate, item.endDate)}</div>
                </div>
                {highlightList.length > 0 && (
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    {highlightList.map((h, hIdx) => (
                      <li key={`${h}-${hIdx}`}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'experience') {
      const lang = getLang(key);
      if (!Array.isArray(cv.experience) || cv.experience.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.experience || sectionTitles.id.experience}
          </h3>
          <div className="space-y-4">
            {cv.experience.map((item, idx) => {
              const highlightValue = item?.highlights;
              const highlightList = (() => {
                if (Array.isArray(highlightValue)) return highlightValue;
                if (typeof highlightValue === 'string') {
                  return highlightValue
                    .split('.')
                    .map((value) => value.trim())
                    .filter(Boolean);
                }
                if (typeof highlightValue === 'object') {
                  const resolved = resolveArray(highlightValue, lang);
                  if (Array.isArray(resolved)) return resolved;
                  if (typeof resolved === 'string') {
                    return resolved
                      .split('.')
                      .map((value) => value.trim())
                      .filter(Boolean);
                  }
                }
                return [];
              })();
              return (
              <div key={`${resolveText(item.company, lang)}-${idx}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {resolveText(item.role, lang) || resolveText(item.title, lang)}
                    </div>
                    <div className="text-sm opacity-80">
                      {[resolveText(item.company, lang), resolveText(item.location, lang)]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  <div className="text-xs opacity-70">{renderDuration(item.startDate, item.endDate)}</div>
                </div>
                {highlightList.length > 0 && (
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    {highlightList.map((h, hIdx) => (
                      <li key={`${h}-${hIdx}`}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'education') {
      const lang = getLang(key);
      if (!Array.isArray(cv.education) || cv.education.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.education || sectionTitles.id.education}
          </h3>
          <div className="space-y-4">
            {cv.education.map((item, idx) => (
              <div key={`${resolveText(item.institution, lang)}-${idx}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{resolveText(item.degree, lang)}</div>
                    <div className="text-sm opacity-80">
                      {[resolveText(item.institution, lang), resolveText(item.location, lang)]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  <div className="text-xs opacity-70">{renderDuration(item.startDate, item.endDate)}</div>
                </div>
                {item.gpa && <div className="text-xs opacity-70 mt-1">GPA: {item.gpa}</div>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'skills') {
      const lang = getLang(key);
      if (!Array.isArray(cv.skills) || cv.skills.length === 0) return null;
      const levelLabel = {
        id: { advanced: 'Mahir', intermediate: 'Menengah', beginner: 'Pemula' },
        en: { advanced: 'Advanced', intermediate: 'Intermediate', beginner: 'Beginner' }
      };
      const levelOrder = { advanced: 0, intermediate: 1, beginner: 2 };
      const normalizeSkillItems = (items) => {
        const list = Array.isArray(items) ? items : resolveArray(items, lang);
        const hasStructured = Array.isArray(list) && list.some((entry) => entry && typeof entry === 'object');
        if (!hasStructured) {
          return list
            .map((item) => (typeof item === 'string' ? item.trim() : resolveText(item, lang)))
            .filter(Boolean)
            .map((name) => ({ name, level: '', proof: '' }));
        }
        return list
          .map((entry) => {
            const name = resolveText(entry?.name, lang);
            const proof = resolveText(entry?.proof, lang);
            const level = entry?.level || '';
            return { name, proof, level };
          })
          .filter((entry) => entry.name)
          .sort((a, b) => {
            const aOrder = levelOrder[a.level] ?? 9;
            const bOrder = levelOrder[b.level] ?? 9;
            return aOrder - bOrder;
          });
      };
      const grouped = cv.skills
        .map((item) => {
          const category = resolveText(item.category, lang);
          const entries = normalizeSkillItems(item.items);
          return { category, entries };
        })
        .filter((group) => group.entries.length > 0);
      if (grouped.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.skills || sectionTitles.id.skills}
          </h3>
          <div className="space-y-3">
            {grouped.map((group, groupIndex) => (
              <div key={`${group.category || 'skill'}-${groupIndex}`}>
                {group.category && (
                  <div className="text-sm font-semibold mb-1">{group.category}</div>
                )}
                <ul className="list-disc list-inside text-sm space-y-1">
                  {group.entries.map((entry, entryIndex) => (
                    <li key={`${entry.name}-${entryIndex}`}>
                      <span className="font-semibold">{entry.name}</span>
                      {entry.level && (
                        <span className="opacity-80"> • {levelLabel[lang]?.[entry.level] || entry.level}</span>
                      )}
                      {entry.proof && <span className="opacity-80"> • {entry.proof}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'certifications') {
      const lang = getLang(key);
      if (!Array.isArray(cv.certifications) || cv.certifications.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.certifications || sectionTitles.id.certifications}
          </h3>
          <div className="space-y-3">
            {cv.certifications.map((item, idx) => (
              <div key={`${resolveText(item.name, lang)}-${idx}`}>
                <div className="font-semibold">{resolveText(item.name, lang)}</div>
                <div className="text-sm opacity-80">
                  {[resolveText(item.issuer, lang), item.date].filter(Boolean).join(' • ')}
                </div>
                {item.credentialUrl && (
                  <div className="text-xs opacity-70">{item.credentialUrl}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'projects') {
      const lang = getLang(key);
      if (!Array.isArray(cv.projects) || cv.projects.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: 'var(--heading-color)' }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.projects || sectionTitles.id.projects}
          </h3>
          <div className="space-y-4">
            {cv.projects.map((item, idx) => (
              <div key={`${resolveText(item.name, lang)}-${idx}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{resolveText(item.name, lang)}</div>
                    <div className="text-sm opacity-80">
                      {[resolveText(item.role, lang), resolveText(item.tech, lang)]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  <div className="text-xs opacity-70">{resolveText(item.link, lang)}</div>
                </div>
                {(() => {
                  const description = resolveText(item.description, lang);
                  const lines = splitByDot(description);
                  if (lines.length === 0) return null;
                  if (lines.length === 1) {
                    return <p className="text-sm mt-1">{lines[0]}</p>;
                  }
                  return (
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      {lines.map((line, lineIndex) => (
                        <li key={`${line}-${lineIndex}`}>{line}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'achievements') {
      const lang = getLang(key);
      if (!Array.isArray(cv.achievements) || cv.achievements.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: style.headingColor }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.achievements || sectionTitles.id.achievements}
          </h3>
          <div className="space-y-3">
            {cv.achievements.map((item, idx) => (
              <div key={`${resolveText(item.title, lang)}-${idx}`}>
                <div className="font-semibold">{resolveText(item.title, lang)}</div>
                <div className="text-xs opacity-70">{item.date || ''}</div>
                {(() => {
                  const description = resolveText(item.description, lang);
                  const lines = splitByDot(description);
                  if (lines.length === 0) return null;
                  if (lines.length === 1) {
                    return <p className="text-sm mt-1">{lines[0]}</p>;
                  }
                  return (
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      {lines.map((line, lineIndex) => (
                        <li key={`${line}-${lineIndex}`}>{line}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'references') {
      const lang = getLang(key);
      if (!Array.isArray(cv.references) || cv.references.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: style.headingColor }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.references || sectionTitles.id.references}
          </h3>
          <div className="space-y-3">
            {cv.references.map((item, idx) => (
              <div key={`${resolveText(item.name, lang)}-${idx}`}>
                <div className="font-semibold">{resolveText(item.name, lang)}</div>
                <div className="text-sm opacity-80">
                  {[resolveText(item.title, lang), resolveText(item.company, lang)]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
                {item.contact && <div className="text-xs opacity-70">{item.contact}</div>}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'additional') {
      const lang = getLang(key);
      const additional = cv.additional || {};
      const rows = [
        [lang === 'en' ? 'Languages' : 'Bahasa', resolveText(additional.languages, lang)],
        [lang === 'en' ? 'Interests' : 'Minat', resolveText(additional.interests, lang)],
        [lang === 'en' ? 'Awards' : 'Penghargaan', resolveText(additional.awards, lang)],
        [lang === 'en' ? 'Volunteer' : 'Volunteer', resolveText(additional.volunteer, lang)],
        [lang === 'en' ? 'Publications' : 'Publikasi', resolveText(additional.publications, lang)]
      ].filter(([, value]) => value);
      if (rows.length === 0) return null;
      return (
        <section className="pdf-avoid-break" style={sectionWrapperStyle}>
          <h3 style={{ color: style.headingColor }} className="text-lg font-semibold mb-3">
            {sectionTitles[lang]?.additional || sectionTitles.id.additional}
          </h3>
          <div className="space-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <div className="font-semibold min-w-[110px]">{label}</div>
                <div className="opacity-80">{value}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return null;
  };

  const header = (
    <header className="mb-6 pb-4 border-b pdf-avoid-break" style={{ borderColor: `${style.accentColor}40` }}>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {personal.fullName || 'Nama Lengkap'}
      </h1>
      {personal.headline && <div className="text-sm mt-1">{personal.headline}</div>}
      <div className="text-sm mt-2 flex flex-wrap gap-x-4 gap-y-1 opacity-80">
        {[personal.email, personal.phone, personal.location, personal.website, personal.linkedin, personal.github]
          .filter(Boolean)
          .map((item) => (
            <span key={item}>{item}</span>
          ))}
      </div>
    </header>
  );

  const leftSections = ['skills', 'certifications', 'references', 'additional'];
  const rightSections = order.filter((section) => !leftSections.includes(section));

  const content = (() => {
    if (layout === 'single') {
      return (
        <div>
          {order.map((section) => (
            <div key={section}>{renderSection(section)}</div>
          ))}
        </div>
      );
    }

    if (layout === 'split') {
      const mid = Math.ceil(order.length / 2);
      const left = order.slice(0, mid);
      const right = order.slice(mid);
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>{left.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
          <div>{right.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
        </div>
      );
    }

    if (layout === 'sidebar-right') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          <div>{rightSections.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
          <div>{leftSections.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        <div>{leftSections.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
        <div>{rightSections.map((section) => <div key={section}>{renderSection(section)}</div>)}</div>
      </div>
    );
  })();

  return (
    <div
      className="w-full"
      style={{
        fontFamily: style.fontFamily,
        color: 'var(--text-color)',
        backgroundColor: 'var(--bg-color)',
        ...cssVars
      }}
    >
      {header}
      {content}
    </div>
  );
}
export default memo(TemplateRenderer);
