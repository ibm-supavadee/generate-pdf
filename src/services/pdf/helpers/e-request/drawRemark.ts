import { FONT_SIZE, PDF_COLORS } from "../../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  label: string;
  fontSize?: number;
  topSpacing?: number;
  ensureSpace: (height: number) => void;
};

export function drawRemark({
  doc,
  y,
  margin,
  contentWidth,
  label,
  fontSize = FONT_SIZE,
  topSpacing = 15,
  ensureSpace,
}: Params): number {
  const remarkHeight = doc.heightOfString(label, {
    width: contentWidth,
  });

  ensureSpace(remarkHeight + topSpacing);

  y = doc.y;

  y += topSpacing;

  doc
    .font("regular")
    .fontSize(fontSize)
    .fillColor(PDF_COLORS.GRAY)
    .text(label, margin, y, {
      width: contentWidth,
      lineGap: 2,
    });

  return doc.y;
}
