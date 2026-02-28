import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useNavigate, useParams } from "react-router-dom";
import { createPortfolio, getTemplates, getPortfolio, updatePortfolio, getTemplate } from "../api";
import { resolveText, hasText } from "../shared/lib/text";
import { toast } from "react-hot-toast";
import useImportCv from "../hooks/useImportCv";
import useAiEnhance from "../hooks/useAiEnhance";
import PersonalForm from "../features/cv/components/PersonalForm";
import SummaryForm from "../features/cv/components/SummaryForm";
import ExperienceList from "../features/cv/components/ExperienceList";
import EducationList from "../features/cv/components/EducationList";
import SkillsEditor from "../features/cv/components/SkillsEditor";
import ImportPanel from "./Create/ImportPanel";
import ProjectsList from "../features/cv/components/ProjectsList";
import CertificationsList from "../features/cv/components/CertificationsList";
import AchievementsList from "../features/cv/components/AchievementsList";
import ReferencesList from "../features/cv/components/ReferencesList";
import AdditionalForm from "../features/cv/components/AdditionalForm";
const TemplateRenderer = lazy(() => import("../templates/TemplateRenderer"));

const defaultSections = [
  "summary",
  "workExperience",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
  "achievements",
  "references",
  "additional"
];

const emptyCv = {
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: ""
  },
  summary: {
    id: "",
    en: ""
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
    summary: "id",
    workExperience: "id",
    experience: "id",
    education: "id",
    skills: "id",
    certifications: "id",
    projects: "id",
    achievements: "id",
    references: "id",
    additional: "id"
  },
  additional: {
    languages: { id: "", en: "" },
    interests: { id: "", en: "" },
    awards: { id: "", en: "" },
    volunteer: { id: "", en: "" },
    publications: { id: "", en: "" }
  }
};

const fontOptions = [
  "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  "Merriweather, Georgia, serif",
  "Lato, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  "Source Sans 3, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
];

const languageOptions = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" }
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
    accentColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    headingColor: "#0f172a",
    fontFamily: fontOptions[0],
    layout: "single"
  });
  const [previewMode, setPreviewMode] = useState("web");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

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
          setCv(p.cv || emptyCv);
          setSectionsOrder(Array.isArray(p.sectionsOrder) ? p.sectionsOrder : defaultSections);
          setSelectedId(p.templateId || null);
          setTheme({ ...(p.theme || {}), layout: (p.theme?.layout || 'single') });
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
      layout: template.layout || prev.layout
    }));
    const sectionList =
      Array.isArray(template.sections) && template.sections.length
        ? template.sections
        : defaultSections;
    const injectWorkExp = (() => {
      const list = [...sectionList];
      const idx = list.indexOf("experience");
      if (!list.includes("workExperience")) {
        if (idx >= 0) list.splice(idx, 0, "workExperience");
        else list.unshift("workExperience");
      }
      return list;
    })();
    setSectionsOrder(injectWorkExp);
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedId),
    [templates, selectedId]
  );

  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({});
  const [attemptSubmit, setAttemptSubmit] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    GlobalWorkerOptions.workerSrc = workerUrl;
  }, []);

  const mergedErrors = useMemo(() => ({ ...errors, ...formatErrors }), [errors, formatErrors]);
  const markIfError = (path) =>
    mergedErrors[path] ? "border-red-500 focus:border-red-500" : "border-slate-200";

  const [previewCv, setPreviewCv] = useState(cv);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCv(cv), 200);
    return () => clearTimeout(t);
  }, [cv]);

  const { importMessage, lastImportedText, handleImportFile } = useImportCv(cv, setCv);
  const { aiMessage, aiLoading, enhance } = useAiEnhance(cv, setCv);

  const handleEnhanceWithAI = async () => {
    await enhance(lastImportedText);
  };

  const activeSections = useMemo(() => sectionsOrder, [sectionsOrder]);
  const stepLabels = useMemo(
    () => ({
      personal: "Profil",
      summary: "Ringkasan",
      workExperience: "Pengalaman Kerja",
      experience: "Pengalaman",
      education: "Pendidikan",
      skills: "Keahlian",
      certifications: "Sertifikasi",
      projects: "Proyek",
      achievements: "Pencapaian",
      references: "Referensi",
      additional: "Informasi Tambahan"
    }),
    []
  );
  const stepKeys = useMemo(() => {
    const ordered = activeSections.filter((key) => key !== "summary");
    return ["personal", "summary", ...ordered];
  }, [activeSections]);
  const activeStepKey = stepKeys[activeStepIndex];
  const remainingSteps = Math.max(stepKeys.length - activeStepIndex - 1, 0);
  const totalSteps = Math.max(stepKeys.length, 1);
  const progressPercent = Math.round(((activeStepIndex + 1) / totalSteps) * 100);

  const updatePersonal = (key, value) => {
    setCv((prev) => ({
      ...prev,
      personal: { ...prev.personal, [key]: value }
    }));
  };

  const getSectionLanguage = (section) => cv.languageBySection?.[section] || "id";

  const setSectionLanguage = (section, lang) => {
    setCv((prev) => ({
      ...prev,
      languageBySection: { ...prev.languageBySection, [section]: lang }
    }));
  };

  const updateSummary = (lang, value) => {
    setCv((prev) => ({ ...prev, summary: { ...prev.summary, [lang]: value } }));
  };

  const updateAdditional = (key, lang, value) => {
    setCv((prev) => ({
      ...prev,
      additional: { ...prev.additional, [key]: { ...prev.additional[key], [lang]: value } }
    }));
  };

  const notify = useCallback((type, message) => {
    if (!message) return;
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else if (type === "info") toast(message, { icon: "ℹ️" });
    else if (type === "warning") toast(message, { icon: "⚠️" });
    else toast(message);
  }, []);

  const isValidEmail = useCallback((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), []);
  const isValidPhone = useCallback((value) => /^\+?[0-9\s()-]{6,}$/.test(value), []);
  const isValidUrl = useCallback((value) => {
    try {
      const normalized = value.startsWith("http") ? value : `https://${value}`;
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
      if (email && !isValidEmail(email)) next["personal.email"] = "Format email tidak valid.";
      else delete next["personal.email"];
      if (phone && !isValidPhone(phone)) next["personal.phone"] = "Format telepon tidak valid.";
      else delete next["personal.phone"];
      if (website && !isValidUrl(website)) next["personal.website"] = "Format website tidak valid.";
      else delete next["personal.website"];
      if (linkedin && !isValidUrl(linkedin)) next["personal.linkedin"] = "Format LinkedIn tidak valid.";
      else delete next["personal.linkedin"];
      if (github && !isValidUrl(github)) next["personal.github"] = "Format GitHub tidak valid.";
      else delete next["personal.github"];
      return next;
    });
  }, [cv.personal, isValidEmail, isValidPhone, isValidUrl]);

  const hasItemWithFields = useCallback((items, fields) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.some((item) =>
      fields.some((field) => {
        const value = item?.[field];
        return hasText(value);
      })
    );
  }, []);

  const hasSkillEntries = useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.some((group) => {
      const entries = Array.isArray(group?.items) ? group.items : [];
      return entries.some((entry) => (typeof entry === "string" ? hasText(entry) : hasText(entry?.name)));
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
        current[key] && typeof current[key] === "object" && !Array.isArray(current[key])
          ? current[key]
          : { id: "", en: "" };
      items[index] = { ...current, [key]: { ...existing, [lang]: value } };
      return { ...prev, [section]: items };
    });
  };

  const updateLocalizedArrayFieldByDot = (section, index, key, lang, value) => {
    const items = value
      .split(".")
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
        typeof rawCurrent === "string"
          ? { name: { id: rawCurrent, en: rawCurrent }, level: "", proof: { id: "", en: "" } }
          : rawCurrent || { name: { id: "", en: "" }, level: "", proof: { id: "", en: "" } };
      if (key === "name" || key === "proof") {
        const existing =
          current[key] && typeof current[key] === "object" && !Array.isArray(current[key])
            ? current[key]
            : { id: "", en: "" };
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
      entries.push({ name: { id: "", en: "" }, level: "", proof: { id: "", en: "" } });
      groups[groupIndex] = { ...group, items: entries };
      return { ...prev, skills: groups };
    });
  };

  const removeSkillEntry = (groupIndex, entryIndex) => {
    setCv((prev) => {
      const groups = [...prev.skills];
      const group = groups[groupIndex] || {};
      const entries = Array.isArray(group.items) ? group.items.filter((_, idx) => idx !== entryIndex) : [];
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
      [section]: prev[section].filter((_, idx) => idx !== index)
    }));
  };

  const addSkillGroup = (group) => {
    setCv((prev) => ({ ...prev, skills: [...prev.skills, group] }));
  };

  const removeSkillGroup = (index) => {
    setCv((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index)
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
    previewMode === "mobile"
      ? "max-w-[420px]"
      : previewMode === "pdf"
      ? "max-w-[794px]"
      : "max-w-4xl";

  const completion = useMemo(() => {
    const missing = [];
    if (!cv.personal.fullName.trim()) missing.push("Nama Lengkap");
    if (!cv.personal.headline.trim()) missing.push("Headline");
    if (!cv.personal.email.trim()) missing.push("Email");
    if (!hasText(cv.summary)) missing.push("Ringkasan");
    if (activeSections.includes("workExperience") && !hasItemWithFields(cv.workExperience, ["role", "company", "highlights"])) {
      missing.push("Pengalaman Kerja");
    }
    if (activeSections.includes("experience") && !hasItemWithFields(cv.experience, ["role", "company", "highlights"])) {
      missing.push("Pengalaman");
    }
    if (activeSections.includes("education") && !hasItemWithFields(cv.education, ["degree", "institution"])) {
      missing.push("Pendidikan");
    }
    if (activeSections.includes("skills") && !hasSkillEntries(cv.skills)) {
      missing.push("Keahlian");
    }
    if (activeSections.includes("certifications") && !hasItemWithFields(cv.certifications, ["name", "issuer"])) {
      missing.push("Sertifikasi");
    }
    if (activeSections.includes("projects") && !hasItemWithFields(cv.projects, ["name", "role", "description", "tech"])) {
      missing.push("Proyek");
    }
    if (activeSections.includes("achievements") && !hasItemWithFields(cv.achievements, ["title", "description"])) {
      missing.push("Pencapaian");
    }
    if (activeSections.includes("references") && !hasItemWithFields(cv.references, ["name", "title", "company"])) {
      missing.push("Referensi");
    }
    if (activeSections.includes("additional")) {
      const additional = cv.additional || {};
      const hasAdditional =
        hasText(additional.languages) ||
        hasText(additional.interests) ||
        hasText(additional.awards) ||
        hasText(additional.volunteer) ||
        hasText(additional.publications);
      if (!hasAdditional) missing.push("Informasi Tambahan");
    }
    return { isComplete: missing.length === 0, missing };
  }, [cv, activeSections, hasItemWithFields, hasSkillEntries]);

  const skillLevelOptions = useMemo(
    () => ({
      id: [
        { value: "advanced", label: "Mahir" },
        { value: "intermediate", label: "Menengah" },
        { value: "beginner", label: "Pemula" }
      ],
      en: [
        { value: "advanced", label: "Advanced" },
        { value: "intermediate", label: "Intermediate" },
        { value: "beginner", label: "Beginner" }
      ]
    }),
    []
  );

  const completionLabel = completion.isComplete
    ? "Form sudah lengkap"
    : `Lengkapi: ${completion.missing.slice(0, 3).join(", ")}${
        completion.missing.length > 3 ? ` +${completion.missing.length - 3} lainnya` : ""
      }`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("portfolio-builder.create-draft");
    if (!raw) {
      setDraftLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.cv) setCv(parsed.cv);
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
    if (!draftLoaded || typeof window === "undefined") return;
    const payload = {
      cv,
      theme,
      sectionsOrder,
      selectedId,
      previewMode,
      activeStepIndex
    };
    const t = setTimeout(() => {
      window.localStorage.setItem("portfolio-builder.create-draft", JSON.stringify(payload));
    }, 350);
    return () => clearTimeout(t);
  }, [cv, theme, sectionsOrder, selectedId, previewMode, activeStepIndex, draftLoaded]);

  useEffect(() => {
    if (!stepKeys.length) return;
    setActiveStepIndex((prev) => Math.min(prev, stepKeys.length - 1));
  }, [stepKeys.length]);

  useEffect(() => {
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 20);
    return () => clearTimeout(t);
  }, [activeStepIndex]);

  const summaryLang = getSectionLanguage("summary");
  const experienceLang = getSectionLanguage("experience");
  const workExperienceLang = getSectionLanguage("workExperience");
  const educationLang = getSectionLanguage("education");
  const skillsLang = getSectionLanguage("skills");
  const certificationsLang = getSectionLanguage("certifications");
  const projectsLang = getSectionLanguage("projects");
  const achievementsLang = getSectionLanguage("achievements");
  const referencesLang = getSectionLanguage("references");
  const additionalLang = getSectionLanguage("additional");

  const validateStep = useCallback(
    (stepKey) => {
      const nextErrors = {};
      if (stepKey === "personal") {
        if (!cv.personal.fullName.trim()) nextErrors["personal.fullName"] = "Nama lengkap wajib diisi.";
        if (!cv.personal.email.trim()) nextErrors["personal.email"] = "Email wajib diisi.";
        if (cv.personal.email.trim() && !isValidEmail(cv.personal.email.trim())) {
          nextErrors["personal.email"] = "Format email tidak valid.";
        }
        if (cv.personal.phone.trim() && !isValidPhone(cv.personal.phone.trim())) {
          nextErrors["personal.phone"] = "Format telepon tidak valid.";
        }
        if (cv.personal.website.trim() && !isValidUrl(cv.personal.website.trim())) {
          nextErrors["personal.website"] = "Format website tidak valid.";
        }
        if (cv.personal.linkedin.trim() && !isValidUrl(cv.personal.linkedin.trim())) {
          nextErrors["personal.linkedin"] = "Format LinkedIn tidak valid.";
        }
        if (cv.personal.github.trim() && !isValidUrl(cv.personal.github.trim())) {
          nextErrors["personal.github"] = "Format GitHub tidak valid.";
        }
      }
      if (stepKey === "summary") {
        if (!hasText(cv.summary)) nextErrors.summary = "Ringkasan wajib diisi.";
      }
      if (stepKey === "workExperience") {
        (cv.workExperience || []).forEach((item, idx) => {
          const anyPresence =
            [item.role, item.company, item.location, item.startDate, item.endDate, item.highlights].some((v) =>
              v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.length : true)
            );
          if (anyPresence) {
            if (!resolveText(item.role, workExperienceLang).trim()) nextErrors[`workExperience.${idx}.role`] = "Posisi wajib diisi.";
            if (!resolveText(item.company, workExperienceLang).trim()) nextErrors[`workExperience.${idx}.company`] = "Perusahaan wajib diisi.";
          }
        });
      }
      if (stepKey === "experience") {
        (cv.experience || []).forEach((item, idx) => {
          const anyPresence =
            [item.role, item.company, item.location, item.startDate, item.endDate, item.highlights].some((v) =>
              v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.length : true)
            );
          if (anyPresence) {
            if (!resolveText(item.role, experienceLang).trim()) nextErrors[`experience.${idx}.role`] = "Posisi wajib diisi.";
            if (!resolveText(item.company, experienceLang).trim()) nextErrors[`experience.${idx}.company`] = "Perusahaan wajib diisi.";
          }
        });
      }
      if (stepKey === "education") {
        (cv.education || []).forEach((item, idx) => {
          const anyPresence = [item.degree, item.institution, item.location, item.startDate, item.endDate, item.gpa].some(
            (v) => v && (typeof v === "string" ? v.trim() : true)
          );
          if (anyPresence) {
            if (!resolveText(item.degree, educationLang).trim()) nextErrors[`education.${idx}.degree`] = "Gelar wajib diisi.";
            if (!resolveText(item.institution, educationLang).trim()) nextErrors[`education.${idx}.institution`] = "Institusi wajib diisi.";
          }
        });
      }
      if (stepKey === "skills") {
        (cv.skills || []).forEach((group, gIdx) => {
          const entries = Array.isArray(group.items) ? group.items : [];
          entries.forEach((entry, eIdx) => {
            const name = typeof entry === "string" ? entry : resolveText(entry?.name, skillsLang);
            const level = typeof entry === "object" ? entry?.level : "";
            const anyPresence = (name && name.trim()) || level;
            if (anyPresence) {
              if (!name || !name.trim()) nextErrors[`skills.${gIdx}.items.${eIdx}.name`] = "Nama keahlian wajib diisi.";
            }
          });
        });
      }
      if (stepKey === "certifications") {
        (cv.certifications || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.issuer, item.date, item.credentialUrl].some(
            (v) => v && (typeof v === "string" ? v.trim() : true)
          );
          if (anyPresence) {
            if (!resolveText(item.name, certificationsLang).trim()) nextErrors[`certifications.${idx}.name`] = "Nama sertifikasi wajib diisi.";
            if (!resolveText(item.issuer, certificationsLang).trim()) nextErrors[`certifications.${idx}.issuer`] = "Penerbit wajib diisi.";
          }
        });
      }
      if (stepKey === "projects") {
        (cv.projects || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.role, item.description, item.tech, item.link].some(
            (v) => v && (typeof v === "string" ? v.trim() : true)
          );
          if (anyPresence) {
            if (!resolveText(item.name, projectsLang).trim()) nextErrors[`projects.${idx}.name`] = "Nama proyek wajib diisi.";
          }
        });
      }
      if (stepKey === "achievements") {
        (cv.achievements || []).forEach((item, idx) => {
          const anyPresence = [item.title, item.date, item.description].some(
            (v) => v && (typeof v === "string" ? v.trim() : true)
          );
          if (anyPresence) {
            if (!resolveText(item.title, achievementsLang).trim()) nextErrors[`achievements.${idx}.title`] = "Judul wajib diisi.";
          }
        });
      }
      if (stepKey === "references") {
        (cv.references || []).forEach((item, idx) => {
          const anyPresence = [item.name, item.title, item.company, item.contact].some(
            (v) => v && (typeof v === "string" ? v.trim() : true)
          );
          if (anyPresence) {
            if (!resolveText(item.name, referencesLang).trim()) nextErrors[`references.${idx}.name`] = "Nama wajib diisi.";
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
      isValidUrl
    ]
  );

  const validateAllSteps = useCallback(() => {
    return stepKeys.reduce((acc, stepKey) => ({ ...acc, ...validateStep(stepKey) }), {});
  }, [stepKeys, validateStep]);

  const handleSubmit = async () => {
    setAttemptSubmit(true);
    const allErrors = validateAllSteps();
    const submitErrors = { ...allErrors, ...formatErrors };
    setErrors(allErrors);
    if (Object.keys(submitErrors).length > 0) {
      const firstMessage = Object.values(submitErrors)[0];
      notify("warning", firstMessage || "Lengkapi field wajib yang belum diisi.");
      return;
    }
    if (!selectedId) {
      notify("info", "Pilih template terlebih dahulu.");
      return;
    }
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ACCESS_TOKEN") : "";
    if (!token) {
      notify("warning", "Silakan login terlebih dahulu.");
      navigate("/app/login?next=/app/create");
      return;
    }
    try {
      const payload = {
        cv,
        templateId: selectedId,
        theme,
        sectionsOrder
      };
      const data = id ? await updatePortfolio(id, payload) : await createPortfolio(payload);
      const targetId = data.id || id;
      if (targetId) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("portfolio-builder.create-draft");
        }
        notify("success", id ? "Portofolio berhasil diperbarui." : "Portofolio berhasil disimpan.");
        navigate(`/app/preview/${targetId}`);
      } else {
        notify("error", data.error || "Gagal menyimpan.");
      }
    } catch (err) {
      console.error(err);
      notify("error", "Terjadi kesalahan.");
    }
  };

  const handleStepNext = async () => {
    setAttemptSubmit(true);
    const stepErrors = validateStep(activeStepKey);
    const nextErrors = { ...stepErrors, ...formatErrors };
    setErrors(stepErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = Object.values(nextErrors)[0];
      notify("warning", firstMessage || "Lengkapi field wajib yang belum diisi.");
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

  const renderStepContent = () => {
    if (activeStepKey === "personal") {
      return (
        <PersonalForm
          value={cv.personal}
          onChange={updatePersonal}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
        />
      );
    }
    if (activeStepKey === "summary") {
      return (
        <SummaryForm
          value={cv.summary}
          lang={summaryLang}
          onChangeLanguage={(lang) => setSectionLanguage("summary", lang)}
          languageOptions={languageOptions}
          onChangeText={updateSummary}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
        />
      );
    }
    if (activeStepKey === "workExperience") {
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
        />
      );
    }
    if (activeStepKey === "experience") {
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
        />
      );
    }
    if (activeStepKey === "education") {
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
    if (activeStepKey === "skills") {
      return (
        <SkillsEditor
          lang={skillsLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          items={cv.skills}
          addGroup={addSkillGroup}
          updateLocalizedField={(index, key, lang, value) =>
            updateLocalizedField("skills", index, key, lang, value)
          }
          updateEntry={updateSkillEntry}
          removeEntry={removeSkillEntry}
          addEntry={addSkillEntry}
          removeGroup={removeSkillGroup}
          errors={mergedErrors}
          attemptSubmit={attemptSubmit}
          markIfError={markIfError}
          levelOptions={skillLevelOptions}
        />
      );
    }
    if (activeStepKey === "certifications") {
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
        />
      );
    }
    if (activeStepKey === "projects") {
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
        />
      );
    }
    if (activeStepKey === "achievements") {
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
        />
      );
    }
    if (activeStepKey === "references") {
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
        />
      );
    }
    if (activeStepKey === "additional") {
      return (
        <AdditionalForm
          value={cv.additional}
          lang={additionalLang}
          languageOptions={languageOptions}
          setSectionLanguage={setSectionLanguage}
          onChange={updateAdditional}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 to-slate-800 p-6 pt-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.1fr_1.9fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10">
            <h4 className="font-semibold text-blue-300 mb-4">Urutan Section</h4>
            <div className="space-y-2">
              {sectionsOrder.map((key) => (
                <div
                  key={key}
                  draggable
                  onDragStart={() => handleDragStart(key)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(key)}
                  className={`px-4 py-2 rounded-lg border cursor-move ${
                    dragKey === key ? "border-blue-400 bg-blue-500/20" : "border-white/20 bg-white/5"
                  }`}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10 space-y-4">
            <h4 className="font-semibold text-blue-300">Kustomisasi</h4>
            <div className="grid gap-3">
              <label className="text-sm text-gray-300">
                Warna Aksen
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-full h-10 mt-2 rounded"
                />
              </label>
              <label className="text-sm text-gray-300">
                Warna Latar
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 mt-2 rounded"
                />
              </label>
              <label className="text-sm text-gray-300">
                Warna Teks
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-10 mt-2 rounded"
                />
              </label>
              <label className="text-sm text-gray-300">
                Font
                <select
                  value={theme.fontFamily}
                  onChange={(e) => setTheme((prev) => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full mt-2 p-2 rounded text-black"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font.split(",")[0]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-300">
                Layout
                <select
                  value={theme.layout}
                  onChange={(e) => setTheme((prev) => ({ ...prev, layout: e.target.value }))}
                  className="w-full mt-2 p-2 rounded text-black"
                >
                  <option value="single">Single Column</option>
                  <option value="sidebar-left">Sidebar Left</option>
                  <option value="sidebar-right">Sidebar Right</option>
                  <option value="split">Split</option>
                </select>
              </label>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10">
            <h4 className="font-semibold text-blue-300 mb-4">Mode Preview</h4>
            <div className="grid grid-cols-3 gap-2">
              {["web", "pdf", "mobile"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`py-2 rounded-lg text-sm font-semibold ${
                    previewMode === mode ? "bg-blue-600" : "bg-white/10"
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-blue-300">Template</h2>
                <p className="text-sm text-blue-100/80">
                  {selectedTemplate
                    ? `${selectedTemplate.name} • ${
                        selectedTemplate.category || "Template"
                      }`
                    : "Belum ada template dipilih"}
                </p>
              </div>
              <button
                onClick={() => setShowTemplatePicker((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
              >
                {showTemplatePicker ? "Tutup Pilihan" : "Pilih Template"}
              </button>
            </div>
            {showTemplatePicker && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.length === 0 && (
                  <div className="text-sm text-blue-100/80">Template belum tersedia.</div>
                )}
                {templates.map((template) => {
                  const isSelected = template.id === selectedId;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        applyTemplate(template);
                        setShowTemplatePicker(false);
                      }}
                      className={`text-left rounded-xl border p-4 transition ${
                        isSelected
                          ? "border-blue-400 bg-blue-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{template.name}</div>
                      <div className="text-xs text-blue-100/80">{template.category}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-300">Preview</h2>
                <p className="text-sm text-blue-100/80">
                  {selectedTemplate
                    ? `${selectedTemplate.name} • ${
                        selectedTemplate.category || "Template"
                      }`
                    : "Belum ada template dipilih"}
                </p>
              </div>
            </div>
            <div className={`bg-white rounded-xl p-6 shadow-inner border ${previewWidth}`}>
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse" />
                }
              >
                <TemplateRenderer
                  data={{ cv: previewCv, theme }}
                  template={selectedTemplate || {}}
                  sectionsOrder={sectionsOrder}
                />
              </Suspense>
            </div>
          </div>
          <ImportPanel
            importMessage={importMessage}
            onFileSelected={handleImportFile}
            aiMessage={aiMessage}
            aiLoading={aiLoading}
            canEnhance={Boolean(lastImportedText)}
            onEnhance={handleEnhanceWithAI}
          />
          <div className="bg-white rounded-xl p-6 text-slate-900 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Form Editor</h2>
                <p className="text-sm text-slate-500">Auto-save aktif agar data tetap aman.</p>
              </div>
              <div className="text-xs text-slate-500">{completionLabel}</div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>Langkah {activeStepIndex + 1} dari {stepKeys.length}</span>
                <span>{remainingSteps} langkah tersisa</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {stepKeys.map((key, index) => (
                  <div
                    key={`${key}-${index}`}
                    className={`px-3 py-1 rounded-full text-xs ${
                      index === activeStepIndex
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}. {stepLabels[key] || key}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all duration-300 transform-gpu ${
                isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
              }`}
            >
              <div className="mb-4">
                <div className="text-lg font-semibold text-slate-900">
                  {stepLabels[activeStepKey] || activeStepKey}
                </div>
                <div className="text-xs text-slate-500">
                  Lengkapi bagian ini sebelum melanjutkan.
                </div>
              </div>
              {renderStepContent()}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleStepBack}
                disabled={activeStepIndex === 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  activeStepIndex === 0
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900 text-white"
                }`}
              >
                Kembali
              </button>
              <button
                onClick={handleStepNext}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
              >
                {activeStepIndex === stepKeys.length - 1 ? "Simpan & Lanjutkan" : "Selanjutnya"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
