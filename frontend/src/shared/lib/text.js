export const resolveText = (value, lang) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.id || value.en || '';
  return '';
};

export const resolveArray = (value, lang) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value[lang] || value.id || value.en || [];
  return [];
};

export const hasText = (value) => {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => String(item || '').trim().length > 0);
  if (typeof value === 'object') {
    const idText = typeof value.id === 'string' ? value.id.trim() : '';
    const enText = typeof value.en === 'string' ? value.en.trim() : '';
    const idArray = Array.isArray(value.id) ? value.id : [];
    const enArray = Array.isArray(value.en) ? value.en : [];
    return (
      idText.length > 0 ||
      enText.length > 0 ||
      idArray.some((item) => String(item || '').trim().length > 0) ||
      enArray.some((item) => String(item || '').trim().length > 0)
    );
  }
  return Boolean(value);
};

export const renderDuration = (start, end) => {
  if (!start && !end) return '';
  if (start && end) return `${start} - ${end}`;
  return start || end;
};
