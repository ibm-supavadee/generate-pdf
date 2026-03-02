import type PDFDocument from "pdfkit";

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
  ensureSpace: (height: number) => void;
  green: string;
  gray: string;
  options?: Options;
};

export function drawSectionHeader({
  doc,
  y,
  margin,
  contentWidth,
  title,
  ensureSpace,
  green,
  gray,
  options,
}: Params): number {
  const { withDivider = false, fullWidth = false, width } = options || {};

  ensureSpace(40);

  const paddingX = 16;
  const boxHeight = 32;

  doc.font("bold").fontSize(16);

  const textWidth = doc.widthOfString(title);
  const textHeight = doc.currentLineHeight();

  let boxWidth: number;

  if (width) boxWidth = width;
  else if (fullWidth) boxWidth = contentWidth;
  else boxWidth = textWidth + paddingX * 2;

  doc.rect(margin, y, boxWidth, boxHeight).fill(green);

  doc.fillColor("white").font("bold");

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
      .strokeColor(green)
      .lineWidth(1)
      .stroke();
  }

  y += boxHeight;

  doc.font("regular").fontSize(11).fillColor(gray);

  return y;
}
