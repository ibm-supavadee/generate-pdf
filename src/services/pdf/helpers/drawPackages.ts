import { PdfERequestData } from "../models/pdf-erequest-data.model";
import { PDF_COLORS } from "../constants/pdf.constants";
import { E_REQUEST_LABEL_EN } from "../constants/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "../constants/e-request-label-th.constant";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfERequestData;
  label: typeof E_REQUEST_LABEL_EN | typeof E_REQUEST_LABEL_TH;
};

export function drawPackages({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
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
    label.MAIN_PACKAGE,
    data.mainPackages || [],
  );

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(0.5)
    .stroke();

  drawPackageRow(
    label.EXTENSIONS,
    data.extensions || [],
  );

  doc
    .rect(margin + 0.5, pkgStartY + 0.5, contentWidth - 1, y - pkgStartY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 3;

  return y;
}
