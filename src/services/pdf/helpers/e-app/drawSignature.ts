import fs from "fs";
import { PDF_COLORS } from "../../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  title: string;
  dateTh: string;
  dateEn: string;
  signaturePath?: string;
};

export function drawSignatureSection({
  doc,
  y,
  margin,
  contentWidth,
  height,
  title,
  dateTh,
  dateEn,
  signaturePath,
}: Params): number {
  const startY = y;
  const centerX = margin + contentWidth / 2;

  /* TITLE */

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GREEN)
    .fontSize(14)
    .text(title, margin, startY, {
      width: contentWidth,
      align: "center",
    });

  /* SIGNATURE IMAGE */

  const imageY = startY + height / 2 - 70;

  if (signaturePath && fs.existsSync(signaturePath)) {
    const width = 100;

    doc.image(signaturePath, centerX - width / 2, imageY, {
      width,
    });
  }

  /* LINE */

  const lineY = startY + height - 70;

  doc
    .moveTo(margin + 40, lineY)
    .lineTo(margin + contentWidth - 40, lineY)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1)
    .stroke();

  /* DATE TH */

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GREEN)
    .fontSize(12)
    .text(dateTh, margin, lineY + 8, {
      width: contentWidth,
      align: "center",
    });

  /* DATE EN */

  doc
    .font("regular")
    .fillColor(PDF_COLORS.GRAY)
    .fontSize(11)
    .text(dateEn, margin, lineY + 24, {
      width: contentWidth,
      align: "center",
    });

  return startY + height;
}
