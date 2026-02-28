export const addListItem = (cv, section, item) => {
  return { ...cv, [section]: [...(cv[section] || []), item] };
};

export const removeListItem = (cv, section, index) => {
  return { ...cv, [section]: (cv[section] || []).filter((_, i) => i !== index) };
};

export const updateListSection = (cv, section, index, key, value) => {
  const items = [...(cv[section] || [])];
  items[index] = { ...(items[index] || {}), [key]: value };
  return { ...cv, [section]: items };
};

export const updateLocalizedField = (cv, section, index, key, lang, value) => {
  const items = [...(cv[section] || [])];
  const current = items[index] || {};
  const existing =
    current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])
      ? current[key]
      : { id: '', en: '' };
  items[index] = { ...current, [key]: { ...existing, [lang]: value } };
  return { ...cv, [section]: items };
};

export const updateLocalizedArrayFieldByDot = (cv, section, index, key, lang, value) => {
  const items = value
    .split('.')
    .map((v) => v.trim())
    .filter(Boolean);
  return updateLocalizedField(cv, section, index, key, lang, items);
};

export const updateSkillEntry = (cv, groupIndex, entryIndex, key, value, lang) => {
  const groups = [...(cv.skills || [])];
  const group = groups[groupIndex] || {};
  const entries = Array.isArray(group.items) ? [...group.items] : [];
  const rawCurrent = entries[entryIndex];
  const current =
    typeof rawCurrent === 'string'
      ? { name: { id: rawCurrent, en: rawCurrent }, level: '', proof: { id: '', en: '' } }
      : rawCurrent || { name: { id: '', en: '' }, level: '', proof: { id: '', en: '' } };
  if (key === 'name' || key === 'proof') {
    const existing =
      current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])
        ? current[key]
        : { id: '', en: '' };
    entries[entryIndex] = { ...current, [key]: { ...existing, [lang]: value } };
  } else {
    entries[entryIndex] = { ...current, [key]: value };
  }
  groups[groupIndex] = { ...group, items: entries };
  return { ...cv, skills: groups };
};

export const addSkillEntry = (cv, groupIndex) => {
  const groups = [...(cv.skills || [])];
  const group = groups[groupIndex] || { items: [] };
  const entries = Array.isArray(group.items) ? [...group.items] : [];
  entries.push({ name: { id: '', en: '' }, level: '', proof: { id: '', en: '' } });
  groups[groupIndex] = { ...group, items: entries };
  return { ...cv, skills: groups };
};

export const removeSkillEntry = (cv, groupIndex, entryIndex) => {
  const groups = [...(cv.skills || [])];
  const group = groups[groupIndex] || { items: [] };
  const entries = Array.isArray(group.items) ? [...group.items] : [];
  groups[groupIndex] = { ...group, items: entries.filter((_, i) => i !== entryIndex) };
  return { ...cv, skills: groups };
};

export const setSkillGroupItemsFromBullets = (cv, groupIndex, text) => {
  const bullets = text
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
  const groups = [...(cv.skills || [])];
  const group = groups[groupIndex] || { items: [] };
  groups[groupIndex] = { ...group, items: bullets };
  return { ...cv, skills: groups };
};
