import { PdfERequestData } from "../models/pdf-erequest-data.model";
import { PDF_COLORS } from "../pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfERequestData;
};

export function drawPackages({
  doc,
  y,
  margin,
  contentWidth,
  data,
}: Params): number {
  const pkgStartY = y;

  const labelWidth = 100;
  const contentX = margin + labelWidth + 10;
  const contentWidthPkg = contentWidth - labelWidth - 20;

  const rowPadding = 8;

  const drawPackageRow = (label: string, items: string[]) => {
    const rowStartY = y;

    doc
      .font("bold")
      .fillColor(PDF_COLORS.GRAY)
      .text(label, margin + 10, y + rowPadding);

    let contentY = y + rowPadding;

    items?.forEach((item) => {
      doc
        .font("regular")
        .fillColor(PDF_COLORS.GREEN)
        .text(item, contentX, contentY, {
          width: contentWidthPkg,
        });

      contentY = doc.y + 2;
    });

    const rowHeight = contentY - rowStartY + rowPadding;

    y = rowStartY + rowHeight;

    return rowHeight;
  };

  drawPackageRow(
    data.mainPackages?.title || "แพ็กเกจหลัก",
    data.mainPackages?.details || [],
  );

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(0.5)
    .stroke();

  drawPackageRow(
    data.extensions?.title || "แพ็กเกจเสริม",
    data.extensions?.details || [],
  );

  doc
    .rect(margin + 0.5, pkgStartY + 0.5, contentWidth - 1, y - pkgStartY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 3;

  return y;
}
