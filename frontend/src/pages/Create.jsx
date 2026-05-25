import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createPortfolio,
  getTemplates,
  getPortfolio,
  updatePortfolio,
  getTemplate,
  getStoredToken,
} from '../api';
import { resolveTextStrict, hasText } from '../shared/lib/text';
import { notify as notifyUser } from '../components/ui/notify.js';
import useImportCv from '../hooks/useImportCv';
import useAiEnhance from '../hooks/useAiEnhance';
import PersonalForm from '../features/cv/components/PersonalForm';
import SummaryForm from '../features/cv/components/SummaryForm';
import ExperienceList from '../features/cv/components/ExperienceList';
import EducationList from '../features/cv/components/EducationList';
import SkillsEditor from '../features/cv/components/SkillsEditor';
import ImportPanel from './Create/ImportPanel';
import ProjectsList from '../features/cv/components/ProjectsList';
import CertificationsList from '../features/cv/components/CertificationsList';
import AchievementsList from '../features/cv/components/AchievementsList';
import ReferencesList from '../features/cv/components/ReferencesList';
import AdditionalForm from '../features/cv/components/AdditionalForm';
import BuilderTopBar from './Create/BuilderTopBar.jsx';
import PreviewPanel from './Create/PreviewPanel.jsx';
import FormWorkspace from './Create/FormWorkspace.jsx';
import TemplatePickerDialog from './Create/TemplatePickerDialog.jsx';
import SectionOrderControl from './Create/SectionOrderControl.jsx';
import ThemeControls from './Create/ThemeControls.jsx';
import {
  copySectionLanguage,
  normalizeCvLocalization,
  sectionLanguageStatus,
} from '../features/cv/localization';
const TemplateRenderer = lazy(() => import('../templates/TemplateRenderer'));

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
  'additional',
];

const emptyCv = {
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  },
  summary: {
    id: '',
    en: '',
  },
  workExperience: [],
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  achievements: [],
  references: [],
  languageBySection: {
    summary: 'id',
    workExperience: 'id',
    experience: 'id',
    education: 'id',
    skills: 'id',
    certifications: 'id',
    projects: 'id',
    achievements: 'id',
    references: 'id',
    additional: 'id',
  },
  additional: {
    languages: { id: '', en: '' },
    interests: { id: '', en: '' },
    awards: { id: '', en: '' },
    volunteer: { id: '', en: '' },
    publications: { id: '', en: '' },
  },
};

const fontOptions = [
  'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Merriweather, Georgia, serif',
  'Lato, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  'Source Sans 3, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
];

const languageOptions = [
  { value: 'id', label: 'ID' },
  { value: 'en', label: 'EN' },
];

// removed RequiredMark; indicators now inline in child components when needed

export default function Create() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [cv, setCv] = useState(emptyCv);
  const [sectionsOrder, setSectionsOrder] = useState(defaultSections);
  const [dragKey, setDragKey] = useState(null);
  const [theme, setTheme] = useState({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    headingColor: '#0f172a',
    fontFamily: fontOptions[0],
    layout: 'single',
  });
  const [previewMode, setPreviewMode] = useState('web');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [documentLanguageMode, setDocumentLanguageMode] = useState('id');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('Semua');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadExisting() {
      if (!id) return;
      try {
        const p = await getPortfolio(id);
        if (p?.cv) {
          setCv(normalizeCvLocalization(p.cv || emptyCv, p.cv?.languageMode || 'id'));
          if (p.cv?.languageMode) setDocumentLanguageMode(p.cv.languageMode);
          setSectionsOrder(Array.isArray(p.sectionsOrder) ? p.sectionsOrder : defaultSections);
          setSelectedId(p.templateId || null);
          setTheme({ ...(p.theme || {}), layout: p.theme?.layout || 'single' });
          if (p.templateId) {
            const t = await getTemplate(p.templateId);
            if (t?.layout && !p.theme?.layout) {
              setTheme((prev) => ({ ...prev, layout: t.layout }));
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadExisting();
  }, [id]);

  const applyTemplate = useCallback((template) => {
    if (!template) return;
    setSelectedId(template.id);
    setTheme((prev) => ({
      ...prev,
      ...(template.style || {}),
      layout: template.layout || prev.layout,
    }));
    const sectionList =
      Array.isArray(template.sections) && template.sections.length
        ? template.sections
        : defaultSections;
    const injectWorkExp = (() => {
      const list = [...sectionList];
      const idx = list.indexOf('experience');
      if (!list.includes('workExperience')) {
        if (idx >= 0) list.splice(idx, 0, 'workExperience');
        else list.unshift('workExperience');
      }
      return list;
    })();
    setSectionsOrder(injectWorkExp);
    notifyUser.success(`Template "${template.name}" dipilih.`);
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedId),
    [templates, selectedId],
  );
  const templatePreviewCv = useCallback(
    (template) => template?.metadata?.previewCv || template?.previewCv || emptyCv,
    [],
  );
  const templateCategories = useMemo(
    () => ['Semua', ...new Set(templates.map((template) => template.category).filter(Boolean))],
    [templates],
  );
  const visibleTemplates = useMemo(
    () =>
      templateCategory === 'Semua'
        ? templates
        : templates.filter((template) => template.category === templateCategory),
    [templates, templateCategory],
  );

  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({});
  const [attemptSubmit, setAttemptSubmit] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const mergedErrors = useMemo(() => ({ ...errors, ...formatErrors }), [errors, formatErrors]);
  const markIfError = (path) =>
    mergedErrors[path] ? 'border-red-500 focus:border-red-500' : 'border-slate-200';

  const [previewCv, setPreviewCv] = useState(cv);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCv(cv), 200);
    return () => clearTimeout(t);
  }, [cv]);

  const { importMessage, lastImportedText, importDiagnostics, handleImportFile } = useImportCv(
    setCv,
    { documentLanguageMode },
  );
  const { aiMessage, aiLoading, aiReview, enhance, applyReview, discardReview } = useAiEnhance(
    cv,
    setCv,
    { documentLanguageMode },
  );

  const handleEnhanceWithAI = async () => {
    await enhance(lastImportedText);
  };

  const languageStatusFor = useCallback((section) => sectionLanguageStatus(cv, section), [cv]);
  const handleCopySectionLanguage = useCallback((section, fromLang, toLang) => {
    setCv((prev) => copySectionLanguage(prev, section, fromLang, toLang));
  }, []);

  const activeSections = useMemo(() => sectionsOrder, [sectionsOrder]);
  const stepLabels = useMemo(
    () => ({
      profile: 'Profil',
      experienceFlow: 'Pengalaman',
      educationSkills: 'Pendidikan & Skill',
      supporting: 'Pendukung',
      finalize: 'Finalisasi',
      personal: 'Profil',
      summary: 'Ringkasan',
      workExperience: 'Pengalaman Kerja',
      experience: 'Pengalaman',
      education: 'Pendidikan',
      skills: 'Keahlian',
      certifications: 'Sertifikasi',
      projects: 'Proyek',
      achievements: 'Pencapaian',
      references: 'Referensi',
      additional: 'Informasi Tambahan',
    }),
    [],
  );
  const builderSteps = useMemo(
    () => [
      { key: 'profile', sections: ['personal', 'summary'] },
      {
        key: 'experienceFlow',
        sections: ['workExperience', 'experience', 'projects'].filter((key) =>
          activeSections.includes(key),
        ),
      },
      {
        key: 'educationSkills',
        sections: ['education', 'skills', 'certifications'].filter((key) =>
          activeSections.includes(key),
        ),
      },
      {
        key: 'supporting',
        sections: ['achievements', 'references', 'additional'].filter((key) =>
          activeSections.includes(key),
        ),
      },
      { key: 'finalize', sections: ['finalize'] },
    ],
    [activeSections],
  );
  const stepKeys = useMemo(() => builderSteps.map((step) => step.key), [builderSteps]);
  const activeStep = builderSteps[activeStepIndex] || builderSteps[0];
  const activeStepKey = activeStep?.key || 'profile';
  const remainingSteps = Math.max(stepKeys.length - activeStepIndex - 1, 0);
  const totalSteps = Math.max(stepKeys.length, 1);
  const progressPercent = Math.round(((activeStepIndex + 1) / totalSteps) * 100);
  const updatePersonal = (key, value) => {
    setCv((prev) => ({
      ...prev,
      personal: { ...prev.personal, [key]: value },
    }));
  };

  const getSectionLanguage = (section) => cv.languageBySection?.[section] || 'id';

  const setSectionLanguage = (section, lang) => {
    setCv((prev) => ({
      ...prev,
      languageBySection: { ...prev.languageBySection, [section]: lang },
    }));
  };

  const updateSummary = (lang, value) => {
    setCv((prev) => ({ ...prev, summary: { ...prev.summary, [lang]: value } }));
  };

  const updateAdditional = (key, lang, value) => {
    setCv((prev) => ({
      ...prev,
      additional: { ...prev.additional, [key]: { ...prev.additional[key], [lang]: value } },
    }));
  };

  const notify = useCallback((type, message) => {
    if (!message) return;
    const fn = notifyUser[type] || notifyUser.info;
    fn(message);
  }, []);

  const isValidEmail = useCallback((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), []);
  const isValidPhone = useCallback((value) => /^\+?[0-9\s()-]{6,}$/.test(value), []);
  const isValidUrl = useCallback((value) => {
    try {
      const normalized = value.startsWith('http') ? value : `https://${value}`;
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const email = cv.personal.email.trim();
    const phone = cv.personal.phone.trim();
    const website = cv.personal.website.trim();
    const linkedin = cv.personal.linkedin.trim();
    const github = cv.personal.github.trim();
    setFormatErrors((prev) => {
      const next = { ...prev };
      if (email && !isValidEmail(email)) next['personal.email'] = 'Format email tidak valid.';
      else delete next['personal.email'];
      if (phone && !isValidPhone(phone)) next['personal.phone'] = 'Format telepon tidak valid.';
      else delete next['personal.phone'];
      if (website && !isValidUrl(website)) next['personal.website'] = 'Format website tidak valid.';
      else delete next['personal.website'];
      if (linkedin && !isValidUrl(linkedin))
        next['personal.linkedin'] = 'Format LinkedIn tidak valid.';
      else delete next['personal.linkedin'];
      if (github && !isValidUrl(github)) next['personal.github'] = 'Format GitHub tidak valid.';
      else delete next['personal.github'];
      return next;
    });
  }, [cv.personal, isValidEmail, isValidPhone, isValidUrl]);

  const hasItemWithFields = useCallback((items, fields) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.some((item) =>
      fields.some((field) => {
        const value = item?.[field];
        return hasText(value);
      }),
    );
  }, []);

  const hasSkillEntries = useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.some((group) => {
      const entries = Array.isArray(group?.items) ? group.items : [];
      return entries.some((entry) =>
        typeof entry === 'string' ? hasText(entry) : hasText(entry?.name),
      );
    });
  }, []);

  const updateListSection = (section, index, key, value) => {
    setCv((prev) => {
      const items = [...prev[section]];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, [section]: items };
    });
  };

  const updateLocalizedField = (section, index, key, lang, value) => {
    setCv((prev) => {
      const items = [...prev[section]];
      const current = items[index] || {};
      const existing =
        current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])
          ? current[key]
          : { id: '', en: '' };
      items[index] = { ...current, [key]: { ...existing, [lang]: value } };
      return { ...prev, [section]: items };
    });
  };

  const updateLocalizedArrayFieldByDot = (section, index, key, lang, value) => {
    const items = value
      .split('.')
      .map((v) => v.trim())
      .filter(Boolean);
    updateLocalizedField(section, index, key, lang, items);
  };

  const updateSkillEntry = (groupIndex, entryIndex, key, value, lang) => {
    setCv((prev) => {
      const groups = [...prev.skills];
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
      return { ...prev, skills: groups };
    });
  };

  const addSkillEntry = (groupIndex) => {
    setCv((prev) => {
      const groups = [...prev.skills];
      const group = groups[groupIndex] || {};
      const entries = Array.isArray(group.items) ? [...group.items] : [];
      entries.push({ name: { id: '', en: '' }, level: '', proof: { id: '', en: '' } });
      groups[groupIndex] = { ...group, items: entries };
      return { ...prev, skills: groups };
    });
  };

  const removeSkillEntry = (groupIndex, entryIndex) => {
    setCv((prev) => {
      const groups = [...prev.skills];
      const group = groups[groupIndex] || {};
      const entries = Array.isArray(group.items)
        ? group.items.filter((_, idx) => idx !== entryIndex)
        : [];
      groups[groupIndex] = { ...group, items: entries };
      return { ...prev, skills: groups };
    });
  };

  const addListItem = (section, item) => {
    setCv((prev) => ({ ...prev, [section]: [...prev[section], item] }));
  };

  const removeListItem = (section, index) => {
    setCv((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, idx) => idx !== index),
    }));
  };

  const addSkillGroup = (group) => {
    setCv((prev) => ({ ...prev, skills: [...prev.skills, group] }));
  };

  const removeSkillGroup = (index) => {
    setCv((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index),
    }));
  };

  const handleDragStart = (key) => {
    setDragKey(key);
  };

  const handleDrop = (key) => {
    if (!dragKey || dragKey === key) return;
    setSectionsOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(dragKey);
      const toIndex = next.indexOf(key);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragKey);
      return next;
    });
    setDragKey(null);
  };

  const previewWidth =
    previewMode === 'mobile'
      ? 'w-full max-w-[420px]'
      : previewMode === 'pdf'
        ? 'w-full max-w-[794px]'
        : 'w-full max-w-4xl';

  const completion = useMemo(() => {
    const missing = [];
    if (!cv.personal.fullName.trim()) missing.push('Nama Lengkap');
    if (!cv.personal.headline.trim()) missing.push('Headline');
    if (!cv.personal.email.trim()) missing.push('Email');
    if (!hasText(cv.summary)) missing.push('Ringkasan');
    if (
      activeSections.includes('workExperience') &&
      !hasItemWithFields(cv.workExperience, ['role', 'company', 'highlights'])
    ) {
      missing.push('Pengalaman Kerja');
    }
    if (
      activeSections.includes('experience') &&
      !hasItemWithFields(cv.experience, ['role', 'company', 'highlights'])
    ) {
      missing.push('Pengalaman');
    }
    if (
      activeSections.includes('education') &&
      !hasItemWithFields(cv.education, ['degree', 'institution'])
    ) {
      missing.push('Pendidikan');
    }
    if (activeSections.includes('skills') && !hasSkillEntries(cv.skills)) {
      missing.push('Keahlian');
    }
    if (
      activeSections.includes('certifications') &&
      !hasItemWithFields(cv.certifications, ['name', 'issuer'])
    ) {
      missing.push('Sertifikasi');
    }
    if (
      activeSections.includes('projects') &&
      !hasItemWithFields(cv.projects, ['name', 'role', 'description', 'tech'])
    ) {
      missing.push('Proyek');
    }
    if (
      activeSections.includes('achievements') &&
      !hasItemWithFields(cv.achievements, ['title', 'description'])
    ) {
      missing.push('Pencapaian');
    }
    if (
      activeSections.includes('references') &&
      !hasItemWithFields(cv.references, ['name', 'title', 'company'])
    ) {
      missing.push('Referensi');
    }
    if (activeSections.includes('additional')) {
      const additional = cv.additional || {};
      const hasAdditional =
        hasText(additional.languages) ||
        hasText(additional.interests) ||
        hasText(additional.awards) ||
        hasText(additional.volunteer) ||
        hasText(additional.publications);
      if (!hasAdditional) missing.push('Informasi Tambahan');
    }
    return { isComplete: missing.length === 0, missing };
  }, [cv, activeSections, hasItemWithFields, hasSkillEntries]);

  const skillLevelOptions = useMemo(
    () => ({
      id: [
        { value: 'advanced', label: 'Mahir' },
        { value: 'intermediate', label: 'Menengah' },
        { value: 'beginner', label: 'Pemula' },
      ],
      en: [
        { value: 'advanced', label: 'Advanced' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'beginner', label: 'Beginner' },
      ],
    }),
    [],
  );

  const completionLabel = completion.isComplete
    ? 'Form sudah lengkap'
    : `Lengkapi: ${completion.missing.slice(0, 3).join(', ')}${
        completion.missing.length > 3 ? ` +${completion.missing.length - 3} lainnya` : ''
      }`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('portfolio-builder.create-draft');
    if (!raw) {
      setDraftLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.cv) {
        const draftLanguageMode = parsed.documentLanguageMode || parsed.cv.languageMode || 'id';
        setCv(normalizeCvLocalization(parsed.cv, draftLanguageMode === 'en' ? 'en' : 'id'));
        setDocumentLanguageMode(draftLanguageMode);
      }
      if (parsed?.theme) setTheme((prev) => ({ ...prev, ...parsed.theme }));
      if (Array.isArray(parsed?.sectionsOrder) && parsed.sectionsOrder.length > 0) {
        setSectionsOrder(parsed.sectionsOrder);
      }
      if (parsed?.selectedId) setSelectedId(parsed.selectedId);
      if (parsed?.previewMode) setPreviewMode(parsed.previewMode);
      if (Number.isInteger(parsed?.activeStepIndex)) {
        setActiveStepIndex(parsed.activeStepIndex);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded || typeof window === 'undefined') return;
    const payload = {
      cv,
      theme,
      sectionsOrder,
      selectedId,
      previewMode,
      activeStepIndex,
      documentLanguageMode,
    };
    const t = setTimeout(() => {
      window.localStorage.setItem('portfolio-builder.create-draft', JSON.stringify(payload));
    }, 350);
    return () => clearTimeout(t);
  }, [
    cv,
    theme,
    sectionsOrder,
    selectedId,
    previewMode,
    activeStepIndex,
    documentLanguageMode,
    draftLoaded,
  ]);

  useEffect(() => {
    if (!stepKeys.length) return;
    setActiveStepIndex((prev) => Math.min(prev, stepKeys.length - 1));
  }, [stepKeys.length]);

  useEffect(() => {
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 20);
    return () => clearTimeout(t);
  }, [activeStepIndex]);

  const summaryLang = getSectionLanguage('summary');
  const experienceLang = getSectionLanguage('experience');
  const workExperienceLang = getSectionLanguage('workExperience');
  const educationLang = getSectionLanguage('education');
  const skillsLang = getSectionLanguage('skills');
  const certificationsLang = getSectionLanguage('certifications');
  const projectsLang = getSectionLanguage('projects');
  const achievementsLang = getSectionLanguage('achievements');
  const referencesLang = getSectionLanguage('references');
  const additionalLang = getSectionLanguage('additional');

  const validateSection = useCallback(
    (stepKey) => {
      const nextErrors = {};
      if (stepKey === 'personal') {
        if (!cv.personal.fullName.trim())
          nextErrors['personal.fullName'] = 'Nama lengkap wajib diisi.';
        if (!cv.personal.email.trim()) nextErrors['personal.email'] = 'Email wajib diisi.';
        if (cv.personal.email.trim() && !isValidEmail(cv.personal.email.trim())) {
          nextErrors['personal.email'] = 'Format email tidak valid.';
        }
        if (cv.personal.phone.trim() && !isValidPhone(cv.personal.phone.trim())) {
          nextErrors['personal.phone'] = 'Format telepon tidak valid.';
        }
        if (cv.personal.website.trim() && !isValidUrl(cv.personal.website.trim())) {
          nextErrors['personal.website'] = 'Format website tidak valid.';
        }
        if (cv.personal.linkedin.trim() && !isValidUrl(cv.personal.linkedin.trim())) {
          nextErrors['personal.linkedin'] = 'Format LinkedIn tidak valid.';
        }
        if (cv.personal.github.trim() && !isValidUrl(cv.personal.github.trim())) {
          nextErrors['personal.github'] = 'Format GitHub tidak valid.';
        }
      }
      if (stepKey === 'summary') {
        if (!hasText(cv.summary)) nextErrors.summary = 'Ringkasan wajib diisi.';
      }
      if (stepKey === 'workExperience') {
        (cv.workExperience || []).forEach((item, idx) => {
          const anyPresence = [
            item.role,
            item.company,
            item.location,
            item.startDate,
            item.endDate,
            item.highlights,
          ].some(
            (v) => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.role, workExperienceLang).trim())
              nextErrors[`workExperience.${idx}.role`] = 'Posisi wajib diisi.';
            if (!resolveTextStrict(item.company, workExperienceLang).trim())
              nextErrors[`workExperience.${idx}.company`] = 'Perusahaan wajib diisi.';
          }
        });
      }
      if (stepKey === 'experience') {
        (cv.experience || []).forEach((item, idx) => {
          const anyPresence = [
            item.role,
            item.company,
            item.location,
            item.startDate,
            item.endDate,
            item.highlights,
          ].some(
            (v) => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.role, experienceLang).trim())
              nextErrors[`experience.${idx}.role`] = 'Posisi wajib diisi.';
            if (!resolveTextStrict(item.company, experienceLang).trim())
              nextErrors[`experience.${idx}.company`] = 'Perusahaan wajib diisi.';
          }
        });
      }
      if (stepKey === 'education') {
        (cv.education || []).forEach((item, idx) => {
          const anyPresence = [
            item.degree,
            item.institution,
            item.location,
            item.startDate,
            item.endDate,
            item.gpa,
          ].some((v) => v && (typeof v === 'string' ? v.trim() : true));
          if (anyPresence) {
            if (!resolveTextStrict(item.degree, educationLang).trim())
              nextErrors[`education.${idx}.degree`] = 'Gelar wajib diisi.';
            if (!resolveTextStrict(item.institution, educationLang).trim())
              nextErrors[`education.${idx}.institution`] = 'Institusi wajib diisi.';
          }
        });
      }
      if (stepKey === 'skills') {
        (cv.skills || []).forEach((group, gIdx) => {
          const entries = Array.isArray(group.items) ? group.items : [];
          entries.forEach((entry, eIdx) => {
            const name =
              typeof entry === 'string' ? entry : resolveTextStrict(entry?.name, skillsLang);
            const level = typeof entry === 'object' ? entry?.level : '';
            const anyPresence = (name && name.trim()) || level;
            if (anyPresence) {
              if (!name || !name.trim())
                nextErrors[`skills.${gIdx}.items.${eIdx}.name`] = 'Nama keahlian wajib diisi.';
            }
          });
        });
      }
      if (stepKey === 'certifications') {
        (cv.certifications || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.issuer, item.date, item.credentialUrl].some(
            (v) => v && (typeof v === 'string' ? v.trim() : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.name, certificationsLang).trim())
              nextErrors[`certifications.${idx}.name`] = 'Nama sertifikasi wajib diisi.';
            if (!resolveTextStrict(item.issuer, certificationsLang).trim())
              nextErrors[`certifications.${idx}.issuer`] = 'Penerbit wajib diisi.';
          }
        });
      }
      if (stepKey === 'projects') {
        (cv.projects || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.role, item.description, item.tech, item.link].some(
            (v) => v && (typeof v === 'string' ? v.trim() : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.name, projectsLang).trim())
              nextErrors[`projects.${idx}.name`] = 'Nama proyek wajib diisi.';
          }
        });
      }
      if (stepKey === 'achievements') {
        (cv.achievements || []).forEach((item, idx) => {
          const anyPresence = [item.title, item.date, item.description].some(
            (v) => v && (typeof v === 'string' ? v.trim() : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.title, achievementsLang).trim())
              nextErrors[`achievements.${idx}.title`] = 'Judul wajib diisi.';
          }
        });
      }
      if (stepKey === 'references') {
        (cv.references || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.title, item.company, item.contact].some(
            (v) => v && (typeof v === 'string' ? v.trim() : true),
          );
          if (anyPresence) {
            if (!resolveTextStrict(item.name, referencesLang).trim())
              nextErrors[`references.${idx}.name`] = 'Nama wajib diisi.';
          }
        });
      }
      return nextErrors;
    },
    [
      cv,
      experienceLang,
      workExperienceLang,
      educationLang,
      skillsLang,
      certificationsLang,
      projectsLang,
      achievementsLang,
      referencesLang,
      isValidEmail,
      isValidPhone,
      isValidUrl,
    ],
  );

  const stepSectionsByKey = useMemo(
    () =>
      Object.fromEntries(
        builderSteps.map((step) => [
          step.key,
          step.sections.filter((section) => section !== 'finalize'),
        ]),
      ),
    [builderSteps],
  );

  const validateStep = useCallback(
    (stepKey) => {
      const sections = stepSectionsByKey[stepKey] || [stepKey];
      return sections.reduce((acc, sectionKey) => ({ ...acc, ...validateSection(sectionKey) }), {});
    },
    [stepSectionsByKey, validateSection],
  );

  const validateAllSteps = useCallback(() => {
    return stepKeys.reduce((acc, stepKey) => ({ ...acc, ...validateStep(stepKey) }), {});
  }, [stepKeys, validateStep]);

  const getStepKeyFromErrorPath = useCallback((path) => {
    if (!path) return activeStepKey;
    const sectionKey = path.startsWith('personal.')
      ? 'personal'
      : activeSections.find((key) => path === key || path.startsWith(`${key}.`)) || path;
    return (
      builderSteps.find((step) => step.sections.includes(sectionKey))?.key ||
      (stepKeys.includes(sectionKey) ? sectionKey : activeStepKey)
    );
  }, [activeSections, activeStepKey, builderSteps, stepKeys]);

  const stepErrorKeys = useMemo(() => {
    const keys = new Set();
    Object.keys(mergedErrors).forEach((path) => keys.add(getStepKeyFromErrorPath(path)));
    return keys;
  }, [getStepKeyFromErrorPath, mergedErrors]);

  const focusFirstError = useCallback(
    (submitErrors) => {
      const firstPath = Object.keys(submitErrors)[0];
      const targetStep = getStepKeyFromErrorPath(firstPath);
      const targetIndex = stepKeys.indexOf(targetStep);
      if (targetIndex >= 0) setActiveStepIndex(targetIndex);
      window.setTimeout(() => {
        const target = document.querySelector(
          '[aria-invalid="true"], input.border-red-500, textarea.border-red-500, select.border-red-500',
        );
        target?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        target?.focus?.({ preventScroll: true });
      }, 80);
    },
    [getStepKeyFromErrorPath, stepKeys],
  );

  const handleSubmit = async () => {
    if (saving) return;
    setAttemptSubmit(true);
    const allErrors = validateAllSteps();
    const submitErrors = { ...allErrors, ...formatErrors };
    setErrors(allErrors);
    if (Object.keys(submitErrors).length > 0) {
      const firstMessage = Object.values(submitErrors)[0];
      notify('warning', firstMessage || 'Lengkapi field wajib yang belum diisi.');
      focusFirstError(submitErrors);
      return;
    }
    if (!selectedId) {
      notify('info', 'Pilih template terlebih dahulu.');
      return;
    }
    const token = getStoredToken();
    if (!token) {
      notify('warning', 'Silakan login terlebih dahulu.');
      navigate('/app/login?next=/app/create');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cv: { ...cv, languageMode: documentLanguageMode },
        templateId: selectedId,
        theme,
        sectionsOrder,
      };
      const data = id ? await updatePortfolio(id, payload) : await createPortfolio(payload);
      const targetId = data.id || id;
      if (targetId) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('portfolio-builder.create-draft');
        }
        notify('success', id ? 'Portofolio berhasil diperbarui.' : 'Portofolio berhasil disimpan.');
        navigate(`/app/preview/${targetId}`);
      } else {
        notify('error', data.error || 'Gagal menyimpan.');
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleStepNext = async () => {
    setAttemptSubmit(true);
    const stepErrors = validateStep(activeStepKey);
    const nextErrors = { ...stepErrors, ...formatErrors };
    setErrors(stepErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = Object.values(nextErrors)[0];
      notify('warning', firstMessage || 'Lengkapi field wajib yang belum diisi.');
      focusFirstError(nextErrors);
      return;
    }
    if (activeStepIndex < stepKeys.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
      setAttemptSubmit(false);
      setErrors({});
      return;
    }
    await handleSubmit();
  };

  const handleStepBack = () => {
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
    setAttemptSubmit(false);
    setErrors({});
  };

  const renderSingleSection = (sectionKey) => {
    if (sectionKey === 'personal') {
      return (
        <PersonalForm
          value={cv.personal}
          onChange={updatePersonal}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('summary')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('summary', from, to)}
        />
      );
    }
    if (sectionKey === 'summary') {
      return (
        <SummaryForm
          value={cv.summary}
          lang={summaryLang}
          onChangeLanguage={(lang) => setSectionLanguage('summary', lang)}
          languageOptions={languageOptions}
          onChangeText={updateSummary}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('workExperience')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('workExperience', from, to)}
        />
      );
    }
    if (sectionKey === 'workExperience') {
      return (
        <ExperienceList
          sectionKey="workExperience"
          title="Pengalaman Kerja"
          lang={workExperienceLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.workExperience}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          updateHighlightsByDot={updateLocalizedArrayFieldByDot}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('experience')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('experience', from, to)}
        />
      );
    }
    if (sectionKey === 'experience') {
      return (
        <ExperienceList
          sectionKey="experience"
          title="Pengalaman"
          lang={experienceLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.experience}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          updateHighlightsByDot={updateLocalizedArrayFieldByDot}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('education')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('education', from, to)}
        />
      );
    }
    if (sectionKey === 'education') {
      return (
        <EducationList
          lang={educationLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.education}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
        />
      );
    }
    if (sectionKey === 'skills') {
      return (
        <SkillsEditor
          lang={skillsLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.skills}
          addGroup={addSkillGroup}
          updateLocalizedField={(index, key, lang, value) =>
            updateLocalizedField('skills', index, key, lang, value)
          }
          updateEntry={updateSkillEntry}
          removeEntry={removeSkillEntry}
          addEntry={addSkillEntry}
          removeGroup={removeSkillGroup}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          levelOptions={skillLevelOptions}
          languageStatus={languageStatusFor('skills')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('skills', from, to)}
        />
      );
    }
    if (sectionKey === 'certifications') {
      return (
        <CertificationsList
          lang={certificationsLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.certifications}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('certifications')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('certifications', from, to)}
        />
      );
    }
    if (sectionKey === 'projects') {
      return (
        <ProjectsList
          lang={projectsLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.projects}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('projects')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('projects', from, to)}
        />
      );
    }
    if (sectionKey === 'achievements') {
      return (
        <AchievementsList
          lang={achievementsLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.achievements}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('achievements')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('achievements', from, to)}
        />
      );
    }
    if (sectionKey === 'references') {
      return (
        <ReferencesList
          lang={referencesLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.references}
          addItem={addListItem}
          updateLocalizedField={updateLocalizedField}
          updateListField={updateListSection}
          removeItem={removeListItem}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          languageStatus={languageStatusFor('references')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('references', from, to)}
        />
      );
    }
    if (sectionKey === 'additional') {
      return (
        <AdditionalForm
          value={cv.additional}
          lang={additionalLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          onChange={updateAdditional}
          languageStatus={languageStatusFor('additional')}
          onCopyLanguage={(from, to) => handleCopySectionLanguage('additional', from, to)}
        />
      );
    }
    return null;
  };

  const renderFinalizeContent = () => (
    <div className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-950">Template dan tampilan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Atur visual setelah isi CV selesai agar fokus pengisian tidak terpecah.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTemplatePicker(true)}
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            {selectedTemplate ? 'Ganti Template' : 'Pilih Template'}
          </button>
        </div>
        <div className="mt-4">
          <ThemeControls theme={theme} setTheme={setTheme} fontOptions={fontOptions} compact />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-black text-slate-950">Urutan section</h3>
        <p className="mt-1 text-sm text-slate-500">
          Geser section untuk menyesuaikan prioritas isi CV sebelum disimpan.
        </p>
        <div className="mt-4">
          <SectionOrderControl
            sectionsOrder={sectionsOrder}
            stepLabels={stepLabels}
            dragKey={dragKey}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            compact
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (activeStepKey === 'finalize') return renderFinalizeContent();
    const sections = activeStep?.sections?.filter((section) => section !== 'finalize') || [];
    return (
      <div className="space-y-5">
        {sections.map((section) => (
          <section key={section} className="rounded-lg border border-slate-200 bg-white p-4">
            {renderSingleSection(section)}
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-24 pt-5 text-slate-950 sm:p-5 sm:pb-8">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <BuilderTopBar
          progressPercent={progressPercent}
          activeStepLabel={stepLabels[activeStepKey] || activeStepKey}
          remainingSteps={remainingSteps}
          completionLabel={completionLabel}
          selectedTemplate={selectedTemplate}
          onOpenTemplate={() => setShowTemplatePicker(true)}
          onOpenPreview={() => setPreviewOpen(true)}
          onSubmit={handleSubmit}
          saving={saving}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
          <main className="space-y-5 lg:min-w-0">
            <div id="create-import-panel">
              <ImportPanel
                importMessage={importMessage}
                importDiagnostics={importDiagnostics}
                onFileSelected={handleImportFile}
                aiMessage={aiMessage}
                aiLoading={aiLoading}
                canEnhance={Boolean(lastImportedText)}
                onEnhance={handleEnhanceWithAI}
                aiReview={aiReview}
                onApplyAiReview={applyReview}
                onDiscardAiReview={discardReview}
                documentLanguageMode={documentLanguageMode}
                setDocumentLanguageMode={setDocumentLanguageMode}
                selectedTemplate={selectedTemplate}
                onOpenTemplate={() => setShowTemplatePicker(true)}
              />
            </div>

            <FormWorkspace
              activeStepIndex={activeStepIndex}
              stepKeys={stepKeys}
              activeStepKey={activeStepKey}
              stepLabels={stepLabels}
              remainingSteps={remainingSteps}
              progressPercent={progressPercent}
              completion={completion}
              completionLabel={completionLabel}
              isAnimating={isAnimating}
              renderStepContent={renderStepContent}
              onSelectStep={setActiveStepIndex}
              onBack={handleStepBack}
              onNext={handleStepNext}
              stepErrorKeys={stepErrorKeys}
              saving={saving}
            />
          </main>

          <div className="hidden xl:block">
            <PreviewPanel
              TemplateRenderer={TemplateRenderer}
              previewCv={previewCv}
              theme={theme}
              selectedTemplate={selectedTemplate}
              sectionsOrder={sectionsOrder}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              previewWidth={previewWidth}
              stepLabels={stepLabels}
              dragKey={dragKey}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              setTheme={setTheme}
              fontOptions={fontOptions}
              onSubmit={handleSubmit}
              saving={saving}
            />
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">Preview CV</h2>
                <p className="text-sm text-slate-500">
                  Cek tampilan CV dalam mode web, PDF, atau mobile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <PreviewPanel
                TemplateRenderer={TemplateRenderer}
                previewCv={previewCv}
                theme={theme}
                selectedTemplate={selectedTemplate}
                sectionsOrder={sectionsOrder}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                previewWidth={previewWidth}
                stepLabels={stepLabels}
                dragKey={dragKey}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                setTheme={setTheme}
                fontOptions={fontOptions}
                onSubmit={handleSubmit}
                saving={saving}
                embedded
              />
            </div>
          </div>
        </div>
      )}

      <TemplatePickerDialog
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        templates={templates}
        visibleTemplates={visibleTemplates}
        templateCategories={templateCategories}
        templateCategory={templateCategory}
        setTemplateCategory={setTemplateCategory}
        selectedId={selectedId}
        templatePreviewCv={templatePreviewCv}
        onSelectTemplate={applyTemplate}
      />
    </div>
  );
}
