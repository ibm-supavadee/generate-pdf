import { PDF_COLORS } from "../../constants/pdf.constants";
import { PdfEAppData } from "../../models/pdf-eapp-data.model";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  title: string;
  date: string;
  data: PdfEAppData;
  signatureBase64: string;
};

export function drawSignatureSection({
  doc,
  y,
  margin,
  contentWidth,
  height,
  title,
  date,
  data,
  signatureBase64,
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

  console.log("signatureBase64", signatureBase64);
  if (signatureBase64) {
    const width = 100;

    const cleanBase64 = signatureBase64.replace(/^data:image\/\w+;base64,/, "");

    const buffer = Buffer.from(cleanBase64, "base64");

    doc.image(buffer, centerX - width / 2, imageY, {
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

  /* DATE */

  const displayDate = data.lang === "TH" ? `วันที่ ${date}` : date;

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GREEN)
    .fontSize(12)
    .text(displayDate, margin, lineY + 8, {
      width: contentWidth,
      align: "center",
    });

  return startY + height;
}
