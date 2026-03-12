import fs from "fs";
import { PDF_COLORS } from "../../constants/pdf.constants";
import { drawSectionHeader } from "../e-request/drawSectionHeader";

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

  /* HEADER */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title,
    options: { fullWidth: true },
  });

  const boxHeight = height - (y - startY);

  /* BOX */

  doc
    .rect(margin + 0.5, y + 0.5, contentWidth - 1, boxHeight)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1.5)
    .stroke();

  /* IMAGE */

  if (imagePath && fs.existsSync(imagePath)) {
    const imageWidth = 160;

    const centerX = margin + contentWidth / 2 - imageWidth / 2;
    const centerY = y + boxHeight / 2 - 60;

    doc.image(imagePath, centerX, centerY, {
      width: imageWidth,
    });
  }

  return startY + height;
}
