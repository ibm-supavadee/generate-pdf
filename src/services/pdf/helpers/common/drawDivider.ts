import { PDF_COLORS } from "../../constants/pdf.constants";

export function drawDivider({
  doc,
  y,
  margin,
  contentWidth,
  spaceBefore = 10,
  spaceAfter = 0,
}: {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  spaceBefore?: number;
  spaceAfter?: number;
}) {
  y = doc.y + spaceBefore;

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1)
    .stroke();

  doc.y = y + spaceAfter;

  return doc.y;
}
