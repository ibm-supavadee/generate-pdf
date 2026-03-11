import { PDF_COLORS } from "../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;

  data: any;
  label: any;

  fields: {
    mainLabel: string;
    onTopLabel: string;
    mainData: string;
    onTopData: string;
  };
};

export function drawPackages({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
  fields,
}: Params): number {
  const startY = y;

  const labelWidth = 100;
  const contentX = margin + labelWidth + 10;
  const contentWidthPkg = contentWidth - labelWidth - 20;

  const rowPadding = 8;

  const drawRow = (title: string, items?: string[]) => {
    const rowStartY = y;

    doc
      .font("bold")
      .fillColor(PDF_COLORS.GRAY)
      .text(title, margin + 10, y + rowPadding);

    let contentY = y + rowPadding;

    const list = items?.length ? items : ["-"];

    list.forEach((item) => {
      doc
        .font("regular")
        .fillColor(items?.length ? PDF_COLORS.GREEN : PDF_COLORS.GRAY)
        .text(item, contentX, contentY, {
          width: contentWidthPkg,
        });

      contentY = doc.y + 2;
    });

    const rowHeight = contentY - rowStartY + rowPadding;
    y = rowStartY + rowHeight;
  };

  /* MAIN PACKAGE */

  drawRow(label[fields.mainLabel], data[fields.mainData]);

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(0.5)
    .stroke();

  /* ON TOP PACKAGE */

  drawRow(label[fields.onTopLabel], data[fields.onTopData]);

  doc
    .rect(margin + 0.5, startY + 0.5, contentWidth - 1, y - startY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 3;

  return y;
}
