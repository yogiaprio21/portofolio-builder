import { useState } from 'react';
import { aiEnhanceCv } from '../api';

export default function useAiEnhance(cv, setCv) {
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const enhance = async (text) => {
    setAiMessage('');
    if (!text || text.length < 20) {
      setAiMessage('Import PDF/TXT terlebih dahulu untuk diproses AI.');
      return;
    }
    setAiLoading(true);
    try {
      const payload = { text, hintLanguageBySection: cv.languageBySection };
      const result = await aiEnhanceCv(payload);
      if (result && !result.error) {
        const s = result.cv || {};
        setCv((prev) => ({
          ...prev,
          summary: s.summary || prev.summary,
          workExperience:
            Array.isArray(s.workExperience) && s.workExperience.length
              ? prev.workExperience?.length
                ? prev.workExperience
                : s.workExperience
              : prev.workExperience,
          experience:
            Array.isArray(s.experience) && s.experience.length
              ? prev.experience.length
                ? prev.experience
                : s.experience
              : prev.experience,
          education:
            Array.isArray(s.education) && s.education.length
              ? prev.education.length
                ? prev.education
                : s.education
              : prev.education,
          skills:
            Array.isArray(s.skills) && s.skills.length
              ? prev.skills.length
                ? prev.skills
                : s.skills
              : prev.skills,
          projects:
            Array.isArray(s.projects) && s.projects.length
              ? prev.projects.length
                ? prev.projects
                : s.projects
              : prev.projects,
          certifications:
            Array.isArray(s.certifications) && s.certifications.length
              ? prev.certifications.length
                ? prev.certifications
                : s.certifications
              : prev.certifications,
          achievements:
            Array.isArray(s.achievements) && s.achievements.length
              ? prev.achievements.length
                ? prev.achievements
                : s.achievements
              : prev.achievements,
        }));
        setAiMessage('Berhasil ditingkatkan dengan AI.');
      } else {
        setAiMessage('Endpoint AI belum aktif. Menggunakan hasil import heuristik.');
      }
    } catch {
      setAiMessage('Gagal memproses AI. Coba lagi nanti.');
    } finally {
      setAiLoading(false);
    }
  };

  return { aiMessage, setAiMessage, aiLoading, enhance };
}
