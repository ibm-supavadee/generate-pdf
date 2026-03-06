import { PDF_COLORS } from "../pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: any;
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

  const rowPadding = 12;

  const drawPackageRow = (label: string, items: any[]) => {
    const rowStartY = y;

    doc
      .font("bold")
      .fillColor(PDF_COLORS.GRAY)
      .text(label, margin + 10, y + rowPadding);

    let contentY = y + rowPadding;

    items?.forEach((item: any) => {
      doc
        .font("regular")
        .fillColor(PDF_COLORS.GREEN)
        .text(item.text, contentX, contentY, {
          width: contentWidthPkg,
        });

      contentY = doc.y + 4;

      if (item.description) {
        doc
          .font("regular")
          .fillColor(PDF_COLORS.GREEN)
          .text(item.description, contentX, contentY, {
            width: contentWidthPkg,
          });

        contentY = doc.y + 4;
      }
    });

    const rowHeight = contentY - rowStartY + rowPadding;

    y = rowStartY + rowHeight;

    return rowHeight;
  };

  drawPackageRow(
    "แพ็กเกจหลัก",
    data.packages?.flatMap((p: any) => p.detail) || [],
  );

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(0.5)
    .stroke();

  drawPackageRow(
    "แพ็กเกจเสริม",
    data.extensions?.flatMap((e: any) => e.detail) || [],
  );

  doc
    .rect(margin + 0.5, pkgStartY + 0.5, contentWidth - 1, y - pkgStartY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 3;

  return y;
}
