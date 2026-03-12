import fs from "fs";
import { PDF_COLORS } from "../../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  title: string;
  imagePath?: string;
};

export function drawCardBox({
  doc,
  y,
  margin,
  contentWidth,
  height,
  title,
  imagePath,
}: Params): number {
  const startY = y;

  const headerHeight = 40;
  const boxHeight = height - headerHeight;

  /* HEADER */
  console.log("IMAGE PATH card box:", imagePath);

  doc.rect(margin, y, contentWidth, headerHeight).fill(PDF_COLORS.GREEN);

  doc
    .fillColor("white")
    .font("bold")
    .fontSize(12)
    .text(title, margin + 15, y + 12);

  y += headerHeight;

  /* BOX */

  doc
    .rect(margin + 0.5, y + 0.5, contentWidth - 1, boxHeight)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1.5)
    .stroke();

  /* IMAGE */

  if (imagePath) {
    if (fs.existsSync(imagePath)) {
      const imageWidth = 160;

      const centerX = margin + contentWidth / 2 - imageWidth / 2;
      const centerY = y + boxHeight / 2 - 60;

      doc.image(imagePath, centerX, centerY, {
        width: imageWidth,
      });
    }
  }

  return startY + headerHeight + boxHeight + 10;
}
