const baseSections = [
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'achievements',
  'references',
  'additional'
];

const palettes = [
  { accent: '#2563eb', background: '#ffffff', text: '#0f172a', heading: '#0f172a' },
  { accent: '#0ea5e9', background: '#f8fafc', text: '#0f172a', heading: '#0f172a' },
  { accent: '#16a34a', background: '#ffffff', text: '#111827', heading: '#111827' },
  { accent: '#9333ea', background: '#ffffff', text: '#111827', heading: '#111827' },
  { accent: '#f97316', background: '#fff7ed', text: '#111827', heading: '#111827' },
  { accent: '#ef4444', background: '#ffffff', text: '#111827', heading: '#111827' },
  { accent: '#14b8a6', background: '#f0fdfa', text: '#0f172a', heading: '#0f172a' },
  { accent: '#111827', background: '#f9fafb', text: '#111827', heading: '#111827' },
  { accent: '#1f2937', background: '#ffffff', text: '#111827', heading: '#111827' },
  { accent: '#4f46e5', background: '#ffffff', text: '#111827', heading: '#111827' }
];

const fonts = [
  'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Merriweather, Georgia, serif',
  'Lato, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Source Sans 3, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
];

const layouts = [
  'single',
  'sidebar-left',
  'sidebar-right',
  'split'
];

const categories = [
  { name: 'Classic', tags: ['ATS', 'Minimal', 'Formal'] },
  { name: 'Modern', tags: ['Clean', 'Bold', 'Tech'] },
  { name: 'Professional', tags: ['Corporate', 'Executive', 'Structured'] },
  { name: 'Creative', tags: ['Design', 'Color', 'Portfolio'] },
  { name: 'Minimal', tags: ['Simple', 'Elegant', 'Compact'] }
];

const templates = [];
let id = 1;

for (let c = 0; c < categories.length; c += 1) {
  for (let i = 0; i < 6; i += 1) {
    const palette = palettes[(c * 2 + i) % palettes.length];
    const fontFamily = fonts[(c + i) % fonts.length];
    const layout = layouts[(i + c) % layouts.length];
    templates.push({
      id,
      name: `${categories[c].name} ${i + 1}`,
      category: categories[c].name,
      layout,
      style: {
        accentColor: palette.accent,
        backgroundColor: palette.background,
        textColor: palette.text,
        headingColor: palette.heading,
        fontFamily,
        sectionGap: 20
      },
      sections: baseSections,
      tags: categories[c].tags
    });
    id += 1;
  }
}

module.exports = templates;
