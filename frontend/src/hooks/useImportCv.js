import { useState } from 'react';
import { cleanCvText, extractSectionsFromText, parsePdfToText } from '../features/cv/parser';
import {
  detectDocumentLanguage,
  mergeImportedCv,
  normalizeCvLocalization,
} from '../features/cv/localization';
import { notify } from '../components/ui/notify.js';

export default function useImportCv(setCv, { documentLanguageMode = 'id' } = {}) {
  const [importMessage, setImportMessage] = useState('');
  const [lastImportedText, setLastImportedText] = useState('');
  const [importDiagnostics, setImportDiagnostics] = useState(null);

  const tryImportJson = (obj) => {
    const source = obj?.cv || obj || {};
    const sourceLang =
      source.languageMode === 'en' ? 'en' : documentLanguageMode === 'en' ? 'en' : 'id';
    setCv((prev) => mergeImportedCv(prev, normalizeCvLocalization(source, sourceLang)));
  };

  const tryImportText = (text) => {
    const cleanText = cleanCvText(text);
    const lang = detectDocumentLanguage(cleanText);
    const lines = cleanText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const name = lines[0] || '';
    const emailLine =
      (cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
    const summary = lines.slice(1, Math.min(lines.length, 8)).join(' ');
    const imported = normalizeCvLocalization(
      {
        personal: {
          fullName: name,
          email: emailLine,
        },
        summary: { [lang]: summary },
        languageBySection: { summary: lang },
      },
      lang,
    );
    setCv((prev) => mergeImportedCv(prev, imported));
  };

  const handleImportFile = async (file) => {
    setImportMessage('');
    try {
      if (file.name.endsWith('.pdf')) {
        const parsedPdf = await parsePdfToText(file);
        const pdfText = cleanCvText(parsedPdf.text);
        setImportDiagnostics(parsedPdf.diagnostics);
        setLastImportedText(pdfText);
        if (!parsedPdf.diagnostics.textLayerReadable) {
          setImportMessage(
            'PDF terbaca sangat sedikit. Kemungkinan file berupa scan/gambar, gunakan PDF text-based, TXT, atau JSON.',
          );
          notify.warning('PDF terbaca sangat sedikit. Gunakan PDF text-based, TXT, atau JSON.');
          return;
        }
        const lang = detectDocumentLanguage(pdfText);
        const emailMatch = pdfText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phoneMatch = pdfText.match(/(\+?\d[\d\s-]{7,}\d)/);
        const lines = pdfText
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const nameCandidate = lines[0] || '';
        const summaryText = lines.slice(1, Math.min(lines.length, 25)).join(' ');
        const structured = extractSectionsFromText(pdfText);
        const imported = normalizeCvLocalization(
          {
            personal: {
              fullName: nameCandidate,
              email: emailMatch ? emailMatch[0] : '',
              phone: phoneMatch ? phoneMatch[0] : '',
            },
            summary: { [lang]: summaryText },
            workExperience: structured.workExperience,
            experience: structured.experience,
            education: structured.education,
            skills: structured.skills,
            projects: structured.projects,
            certifications: structured.certifications,
            achievements: structured.achievements,
            languageBySection: {
              ...Object.fromEntries(
                Object.keys(structured.sectionLangMap || {}).map((k) => [
                  k,
                  structured.sectionLangMap[k],
                ]),
              ),
              summary: lang,
            },
          },
          lang,
        );
        setCv((prev) => mergeImportedCv(prev, imported));
        setImportMessage(
          parsedPdf.diagnostics.hasSectionHeading
            ? 'Berhasil mengimpor dari PDF. Silakan cek hasil section dan lanjutkan review AI.'
            : 'PDF berhasil dibaca, tetapi heading section kurang jelas. Cek hasil import sebelum menyimpan.',
        );
        notify.success('CV berhasil diimpor dari PDF.');
      } else {
        const text = cleanCvText(await file.text());
        setImportDiagnostics({
          pages: file.name.endsWith('.txt') ? 1 : 0,
          characters: text.length,
          lines: text.split(/\r?\n/).filter(Boolean).length,
          hasEmail: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
          hasSectionHeading: /(experience|pengalaman|education|pendidikan|skills|keahlian)/i.test(
            text,
          ),
          textLayerReadable: text.length >= 20,
        });
        if (file.name.endsWith('.json')) {
          const obj = JSON.parse(text);
          tryImportJson(obj);
          setImportMessage('Berhasil mengimpor data dari JSON.');
          notify.success('Data CV berhasil diimpor dari JSON.');
        } else {
          tryImportText(text);
          setImportMessage('Berhasil mengimpor ringkasan dan identitas dari teks.');
          setLastImportedText(text);
          notify.success('Ringkasan dan identitas berhasil diimpor dari teks.');
        }
      }
    } catch {
      setImportMessage('Gagal mengimpor file. Pastikan format benar.');
      setImportDiagnostics(null);
      notify.error('Gagal mengimpor file. Pastikan format benar.');
    }
  };

  return {
    importMessage,
    setImportMessage,
    lastImportedText,
    setLastImportedText,
    importDiagnostics,
    handleImportFile,
  };
}
