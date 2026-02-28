import { useParams, useSearchParams } from "react-router-dom";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
const TemplateRenderer = lazy(() => import("../templates/TemplateRenderer"));
import { getPortfolio, getTemplate } from "../api";
import { downloadPdfFromElement } from "../utils/pdfGenerator";

export default function Preview() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState(null);
  const [template, setTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(searchParams.get("mode") || "web");
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const previewRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPortfolio(id);
        if (data?.error) {
          setError(data.error || "Gagal memuat portfolio");
          return;
        }
        setPortfolio(data);
        if (data.templateId) {
          const templateData = await getTemplate(data.templateId);
          if (!templateData?.error) setTemplate(templateData);
        }
      } catch {
        setError("Gagal memuat portfolio");
      }
    }
    load();
  }, [id]);

  const sectionsOrder = useMemo(() => {
    if (portfolio?.sectionsOrder?.length) return portfolio.sectionsOrder;
    return template?.sections || [];
  }, [portfolio, template]);

  const previewWidth =
    previewMode === "mobile"
      ? "max-w-[420px]"
      : previewMode === "pdf"
        ? "max-w-[794px]"
        : "max-w-4xl";

  const downloadPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    try {
      setPdfError("");
      setPdfLoading(true);

      // Give some time for TemplateRenderer to finish styling/rendering
      await new Promise(r => setTimeout(r, 500));

      await downloadPdfFromElement(element, {
        filename: `portfolio-${id}.pdf`,
        marginMm: [20, 15, 20, 15],
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setPdfError("Gagal generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center mt-24">
        <div className="w-full max-w-5xl">
          {error && <div className="mb-6 text-red-500">{error}</div>}
          <div className="flex justify-between items-center mb-6 animate-pulse">
            <div className="h-8 w-40 bg-slate-200 rounded" />
            <div className="h-10 w-32 bg-slate-200 rounded" />
          </div>
          <div className="bg-white rounded-[12px] shadow-[0_0_35px_rgba(0,0,0,0.12)] p-10 w-full border border-gray-200 animate-pulse">
            <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center mt-24">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {["web", "pdf", "mobile"].map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${previewMode === mode ? "bg-blue-600 text-white" : "bg-white border"
                }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          className={`px-6 py-3 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95 ${pdfLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4m0 0l4-4m-4 4V4"
            />
          </svg>
          {pdfLoading ? "Membuat PDF…" : "Download PDF"}
        </button>
      </div>
      {pdfError && <div className="w-full max-w-5xl mb-4 text-red-500">{pdfError}</div>}

      <div
        className={`bg-white rounded-[12px] shadow-[0_0_35px_rgba(0,0,0,0.12)] w-full transition-all ${previewMode === 'pdf' ? 'p-0 border-0 shadow-none' : 'p-10 border border-gray-200'
          } ${previewWidth}`}
        style={{ minHeight: "1123px" }}
      >
        <div ref={previewRef} className="w-full h-full bg-white relative">
          <Suspense fallback={<div className="h-[1123px] flex items-center justify-center text-slate-500">Memuat preview…</div>}>
            <TemplateRenderer
              data={{ ...portfolio, theme: portfolio.theme || {} }}
              template={template || {}}
              sectionsOrder={sectionsOrder}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
