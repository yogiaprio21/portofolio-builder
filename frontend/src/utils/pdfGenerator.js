function normalizePdfOptions(input) {
  if (typeof input === 'string') return { filename: input }
  return input || {}
}

async function withPdfSafeClass(element, task) {
  if (!element) return task()
  element.classList.add('pdf-safe')
  try {
    return await task()
  } finally {
    element.classList.remove('pdf-safe')
  }
}

export async function downloadPdfFromElement(element, opts = {}) {
  const options = normalizePdfOptions(opts)
  const [{ default: jsPDF }, { toCanvas }] = await Promise.all([
    import('jspdf'),
    import('html-to-image')
  ])

  const {
    filename = 'portfolio.pdf',
    marginMm = 0,
    scale = 2,
    useCORS = true,
    backgroundColor = '#ffffff'
  } = options

  return await withPdfSafeClass(element, async () => {
    // Force A4 width in pixels (~794px at 96 DPI) so the inner canvas
    // is captured exactly at the right proportions, regardless of the parent window size.
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    element.style.width = '794px';
    element.style.maxWidth = '794px';

    let canvas;
    try {
      canvas = await toCanvas(element, {
        pixelRatio: scale,
        cacheBust: true,
        useCORS,
        backgroundColor,
        width: 794 // explicitly tell html-to-image the capture width
      });
    } finally {
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate margins
    const mTop = Array.isArray(marginMm) ? (marginMm[0] || 0) : marginMm;
    const mRight = Array.isArray(marginMm) ? (marginMm[1] || mTop) : marginMm;
    const mBottom = Array.isArray(marginMm) ? (marginMm[2] || mTop) : marginMm;
    const mLeft = Array.isArray(marginMm) ? (marginMm[3] || mRight) : marginMm;

    const contentWidth = pdfWidth - mLeft - mRight;
    const contentHeight = pdfHeight - mTop - mBottom;

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // The width of the image in the PDF should fill the content width
    const ratio = contentWidth / imgWidthPx;
    // The total height of the image in mm
    const totalHeightMm = imgHeightPx * ratio;

    // Calculate how many pages we need
    const pages = Math.ceil(totalHeightMm / contentHeight);

    for (let i = 0; i < pages; i++) {
      if (i > 0) pdf.addPage();

      // Calculate how much height (in mm) we are taking from the image for this page
      const srcYMm = i * contentHeight;
      const sliceHeightMm = Math.min(contentHeight, totalHeightMm - srcYMm);

      // Convert mm values back to pixels for canvas slicing
      const srcYPx = srcYMm / ratio;
      const sliceHeightPx = sliceHeightMm / ratio;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidthPx;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

      ctx.drawImage(
        canvas,
        0, srcYPx, imgWidthPx, sliceHeightPx,
        0, 0, imgWidthPx, sliceHeightPx
      );

      const dataUrl = sliceCanvas.toDataURL('image/jpeg', 0.95);

      // Add the sliced image to the PDF
      pdf.addImage(dataUrl, 'JPEG', mLeft, mTop, contentWidth, sliceHeightMm);
    }

    pdf.save(filename);
  });
}

export async function generateA4PdfFromElement(element, opts = {}) {
  const [{ default: jsPDF }, htmlToImage] = await Promise.all([
    import('jspdf'),
    import('html-to-image')
  ])
  const {
    filename = 'portfolios.pdf',
    header = '',
    footer = '',
    marginMm = 20,
    pixelRatio = 2,
    quality = 0.85,
    useCORS = true,
    backgroundColor = '#ffffff'
  } = opts
  const toCanvas = htmlToImage.toCanvas
  const canvas = await withPdfSafeClass(element, () =>
    toCanvas(element, { pixelRatio, cacheBust: true, useCORS, backgroundColor })
  )
  const imgWidthPx = canvas.width
  const imgHeightPx = canvas.height
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = Math.max(10, pageW - marginMm * 2)
  const contentH = Math.max(10, pageH - marginMm * 2)
  const totalHeightMm = contentW * (imgHeightPx / imgWidthPx)
  const pages = Math.max(1, Math.ceil(totalHeightMm / contentH))
  const sliceHeightPx = Math.ceil(imgHeightPx / pages)
  for (let i = 0; i < pages; i++) {
    if (i > 0) pdf.addPage()
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = imgWidthPx
    sliceCanvas.height = Math.min(sliceHeightPx, imgHeightPx - i * sliceHeightPx)
    const ctx = sliceCanvas.getContext('2d')
    ctx.drawImage(
      canvas,
      0, i * sliceHeightPx, imgWidthPx, sliceCanvas.height,
      0, 0, imgWidthPx, sliceCanvas.height
    )
    const dataUrl = sliceCanvas.toDataURL('image/jpeg', quality)
    const sliceHeightMm = contentW * (sliceCanvas.height / imgWidthPx)
    pdf.addImage(dataUrl, 'JPEG', marginMm, marginMm, contentW, sliceHeightMm)
    pdf.setFontSize(10)
    if (header) {
      pdf.text(header, marginMm, marginMm - 8 < 8 ? 12 : marginMm - 8)
    }
    const pageLabel = `Halaman ${i + 1} dari ${pages}`
    if (footer) {
      pdf.text(footer, marginMm, pageH - 10)
      pdf.text(pageLabel, pageW - marginMm, pageH - 10, { align: 'right' })
    } else {
      pdf.text(pageLabel, pageW - marginMm, pageH - 10, { align: 'right' })
    }
  }
  pdf.save(filename)
}

export async function generateA4PdfFromCards(cardElements, opts = {}) {
  const [{ default: jsPDF }, htmlToImage] = await Promise.all([
    import('jspdf'),
    import('html-to-image')
  ])
  const {
    filename = 'portfolios.pdf',
    header = 'Portfolios',
    footer = 'Generated by Portfolio Builder',
    marginMm = 20,
    pixelRatio = 2,
    gapMm = 6,
    quality = 0.85,
    useCORS = true,
    backgroundColor = '#ffffff'
  } = opts
  const toCanvas = htmlToImage.toCanvas
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = Math.max(10, pageW - marginMm * 2)
  const contentH = Math.max(10, pageH - marginMm * 2)
  let currentY = 0
  let pageIndex = 0
  const ensurePage = () => {
    if (pageIndex > 0) pdf.addPage()
    pageIndex += 1
    pdf.setFontSize(11)
    if (header) pdf.text(header, marginMm, marginMm - 8)
    const pageLabel = `Halaman ${pageIndex}`
    if (footer) {
      pdf.text(footer, marginMm, pageH - marginMm / 2)
      pdf.text(pageLabel, pageW - marginMm, pageH - marginMm / 2, { align: 'right' })
    } else {
      pdf.text(pageLabel, pageW - marginMm, pageH - marginMm / 2, { align: 'right' })
    }
    currentY = 0
  }
  ensurePage()
  for (const el of cardElements) {
    const canvas = await withPdfSafeClass(el, () =>
      toCanvas(el, { pixelRatio, cacheBust: true, useCORS, backgroundColor })
    )
    const imgWidthPx = canvas.width
    const imgHeightPx = canvas.height
    const sliceHeightMm = contentW * (imgHeightPx / imgWidthPx)
    if (currentY + sliceHeightMm > contentH) {
      ensurePage()
    }
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    pdf.addImage(dataUrl, 'JPEG', marginMm, marginMm + currentY, contentW, sliceHeightMm)
    currentY += sliceHeightMm + gapMm
  }
  pdf.save(filename)
}
