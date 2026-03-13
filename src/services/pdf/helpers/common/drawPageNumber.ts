export function drawPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const page = i + 1;

    doc
      .font("regular")
      .fontSize(10)
      .fillColor("gray")
      .text(`${page}/${totalPages}`, 0, doc.page.height - 25, {
        width: doc.page.width - 20,
        align: "right",
      });
  }
}
