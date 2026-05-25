import { useState } from 'react';
import { aiEnhanceCv } from '../api';
import { mergeImportedCv, normalizeCvLocalization } from '../features/cv/localization';
import { notify } from '../components/ui/notify.js';

const reviewableSections = [
  'summary',
  'workExperience',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'references',
  'additional',
];

export default function useAiEnhance(cv, setCv, { documentLanguageMode = 'id' } = {}) {
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState(null);

  const enhance = async (text) => {
    setAiMessage('');
    setAiReview(null);
    if (!text || text.length < 20) {
      setAiMessage('Import PDF/TXT terlebih dahulu untuk diproses AI.');
      notify.warning('Import PDF/TXT terlebih dahulu untuk diproses AI.');
      return;
    }
    setAiLoading(true);
    try {
      const payload = {
        text,
        hintLanguageBySection: cv.languageBySection,
        targetLanguageMode: documentLanguageMode,
        currentCv: cv,
      };
      const result = await aiEnhanceCv(payload);
      if (result && !result.error) {
        const lang =
          result.languageBySection?.summary ||
          result.cv?.languageBySection?.summary ||
          (documentLanguageMode === 'en' ? 'en' : 'id');
        const normalized = normalizeCvLocalization(
          {
            ...(result.cv || {}),
            languageBySection: {
              ...(result.cv?.languageBySection || {}),
              ...(result.languageBySection || {}),
            },
          },
          lang,
        );
        const availableSections = reviewableSections.filter((section) => {
          if (section === 'summary')
            return Boolean(normalized.summary?.id || normalized.summary?.en);
          if (section === 'additional') return normalized.additional;
          return Array.isArray(normalized[section]) && normalized[section].length > 0;
        });
        setAiReview({
          cv: normalized,
          provider: result.provider || 'ai',
          model: result.model || '',
          sections: availableSections,
          languageBySection: normalized.languageBySection,
        });
        setAiMessage(
          `AI selesai membaca dokumen. Review ${availableSections.length} section sebelum diterapkan.`,
        );
        notify.success('AI selesai membaca dokumen. Review hasil sebelum diterapkan.');
      } else {
        setAiMessage('Endpoint AI belum aktif. Menggunakan hasil import heuristik.');
        notify.warning('Endpoint AI belum aktif. Gunakan hasil import manual dulu.');
      }
    } catch {
      setAiMessage('Gagal memproses AI. Coba lagi nanti.');
      notify.error('Gagal memproses AI. Coba lagi nanti.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyReview = (sections) => {
    if (!aiReview?.cv) return;
    const selectedSections =
      Array.isArray(sections) && sections.length ? sections : aiReview.sections;
    setCv((prev) => mergeImportedCv(prev, aiReview.cv, { replaceSections: selectedSections }));
    setAiMessage('Hasil AI sudah diterapkan ke section terpilih.');
    notify.success('Hasil AI sudah diterapkan ke CV.');
    setAiReview(null);
  };

  const discardReview = () => {
    setAiReview(null);
    setAiMessage('Hasil AI dibatalkan. Data CV tidak berubah.');
    notify.info('Hasil AI dibatalkan. Data CV tidak berubah.');
  };

  return { aiMessage, setAiMessage, aiLoading, aiReview, enhance, applyReview, discardReview };
}
