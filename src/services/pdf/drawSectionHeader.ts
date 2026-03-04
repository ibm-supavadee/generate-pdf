import { PDF_COLORS } from "./constants";

type Options = {
  withDivider?: boolean;
  fullWidth?: boolean;
  width?: number;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  title: string;
  options?: Options;
};

export function drawSectionHeader({
  doc,
  y,
  margin,
  contentWidth,
  title,
  options,
}: Params): number {
  const { withDivider = false, fullWidth = false, width } = options || {};

  const paddingX = 10;
  const boxHeight = 24;

  doc.font("regular").fontSize(16);

  const textWidth = doc.widthOfString(title);
  const textHeight = doc.currentLineHeight();

  let boxWidth: number;

  if (width) boxWidth = width;
  else if (fullWidth) boxWidth = contentWidth;
  else boxWidth = textWidth + paddingX * 2;

  doc.rect(margin, y, boxWidth, boxHeight).fill(PDF_COLORS.GREEN);

  doc.fillColor("white").font("regular");

  if (fullWidth) {
    doc.text(title, margin + paddingX, y + (boxHeight - textHeight) / 2);
  } else {
    doc.text(
      title,
      margin + (boxWidth - textWidth) / 2,
      y + (boxHeight - textHeight) / 2,
    );
  }

  if (withDivider) {
    const dividerY = y + boxHeight + 0.5;

    doc
      .moveTo(margin, dividerY)
      .lineTo(margin + contentWidth, dividerY)
      .strokeColor(PDF_COLORS.GREEN)
      .lineWidth(1)
      .stroke();
  }

  y += boxHeight;

  doc.font("regular").fontSize(11).fillColor(PDF_COLORS.GRAY);

  return y;
}
