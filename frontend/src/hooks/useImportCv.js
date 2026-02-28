import { useState } from "react";
import { extractSectionsFromText, parsePdfToText } from "../features/cv/parser";

export default function useImportCv(cv, setCv) {
  const [importMessage, setImportMessage] = useState("");
  const [lastImportedText, setLastImportedText] = useState("");

  const tryImportJson = (obj) => {
    setCv((prev) => ({
      ...prev,
      ...(obj?.cv || obj || {}),
    }));
  };

  const tryImportText = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const name = lines[0] || "";
    const emailLine = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "";
    const summary = lines.slice(1, Math.min(lines.length, 25)).join(" ");
    setCv((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        fullName: prev.personal.fullName || name,
        email: prev.personal.email || emailLine,
      },
      summary: { id: summary, en: summary },
    }));
  };

  const handleImportFile = async (file) => {
    setImportMessage("");
    try {
      if (file.name.endsWith(".pdf")) {
        const pdfText = await parsePdfToText(file);
        setLastImportedText(pdfText);
        const emailMatch = pdfText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phoneMatch = pdfText.match(/(\+?\d[\d\s-]{7,}\d)/);
        const lines = pdfText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const nameCandidate = lines[0] || "";
        const summaryText = lines.slice(1, Math.min(lines.length, 25)).join(" ");
        const structured = extractSectionsFromText(pdfText);
        setCv((prev) => ({
          ...prev,
          personal: {
            ...prev.personal,
            fullName: prev.personal.fullName || nameCandidate,
            email: prev.personal.email || (emailMatch ? emailMatch[0] : ""),
            phone: prev.personal.phone || (phoneMatch ? phoneMatch[0] : ""),
          },
          summary: { id: summaryText, en: summaryText },
          workExperience: prev.workExperience?.length ? prev.workExperience : structured.workExperience,
          experience: prev.experience.length ? prev.experience : structured.experience,
          education: prev.education.length ? prev.education : structured.education,
          skills: prev.skills.length ? prev.skills : structured.skills,
          projects: prev.projects.length ? prev.projects : structured.projects,
          certifications: prev.certifications.length ? prev.certifications : structured.certifications,
          achievements: prev.achievements.length ? prev.achievements : structured.achievements,
          languageBySection: {
            ...prev.languageBySection,
            ...Object.fromEntries(Object.keys(structured.sectionLangMap || {}).map((k) => [k, structured.sectionLangMap[k]])),
          },
        }));
        setImportMessage("Berhasil mengimpor dari PDF. Silakan cek dan lengkapi field.");
      } else {
        const text = await file.text();
        if (file.name.endsWith(".json")) {
          const obj = JSON.parse(text);
          tryImportJson(obj);
          setImportMessage("Berhasil mengimpor data dari JSON.");
        } else {
          tryImportText(text);
          setImportMessage("Berhasil mengimpor ringkasan dan identitas dari teks.");
          setLastImportedText(text);
        }
      }
    } catch {
      setImportMessage("Gagal mengimpor file. Pastikan format benar.");
    }
  };

  return {
    importMessage,
    setImportMessage,
    lastImportedText,
    setLastImportedText,
    handleImportFile,
  };
}
