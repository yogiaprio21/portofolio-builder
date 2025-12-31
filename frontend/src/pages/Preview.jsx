import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

// TEMPLATE IMPORT
import Template1 from "../templates/Template1";
import Template2 from "../templates/Template2";
import Template3 from "../templates/Template3";

// Library aman OKLCH
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function Preview() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);

  const previewRef = useRef(null);

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3000/portfolios/${id}`);
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-gray-900">
        Loading...
      </div>
    );
  }

  const Template =
    portfolio.template === 1
      ? Template1
      : portfolio.template === 2
      ? Template2
      : Template3;

  // === DOWNLOAD PDF TANPA ERROR OKLCH ===
  const downloadPDF = async () => {
    const element = previewRef.current;

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 3, // high resolution
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const ratio = img.height / img.width;
        const pdfHeight = pdfWidth * ratio;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`portfolio-${id}.pdf`);
      };
    } catch (error) {
      console.error("Gagal generate PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center mt-24">

      {/* PREVIEW WRAPPER */}
      <div
        ref={previewRef}
        className="
          bg-white 
          rounded-[12px] 
          shadow-[0_0_35px_rgba(0,0,0,0.12)] 
          p-10 
          max-w-4xl 
          w-full 
          border border-gray-200
        "
        style={{
          minHeight: "1123px", // mendekati ukuran A4
        }}
      >
        <Template data={portfolio} />
      </div>

      {/* DOWNLOAD BUTTON DI BAWAH */}
      <div className="mt-8 flex justify-center w-full">
        <button
          onClick={downloadPDF}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
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
          Download PDF
        </button>
      </div>
    </div>
  );
}
