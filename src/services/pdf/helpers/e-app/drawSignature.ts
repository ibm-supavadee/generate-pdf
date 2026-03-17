import { PDF_COLORS } from "../../constants/pdf.constants";
import { PdfEAppData } from "../../models/pdf-eapp-data.model";
import { getDisplayDate } from "../common/displayDate";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  title: string;
  date: string;
  lang: string;
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
  lang,
  signatureBase64,
}: Params): number {
  const startY = y;
  const centerX = margin + contentWidth / 2;

  /* ---------- HEADER ---------- */

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GREEN)
    .fontSize(14)
    .text(title, margin, startY, {
      width: contentWidth,
      align: "center",
    });

  const headerBottomY = doc.y; // ตำแหน่งจริงหลัง header

  /* ---------- FOOTER ---------- */

  const bottomY = startY + height;
  const LINE_MARGIN_BOTTOM = 25;

  const lineY = bottomY - LINE_MARGIN_BOTTOM;

  doc
    .moveTo(margin + 40, lineY)
    .lineTo(margin + contentWidth - 40, lineY)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1)
    .stroke();

  /* ---------- DATE ---------- */

  const displayDate = getDisplayDate(date, lang);
  doc
    .font("bold")
    .fillColor(PDF_COLORS.GREEN)
    .fontSize(12)
    .text(displayDate, margin, lineY + 6, {
      width: contentWidth,
      align: "center",
    });
  /* ---------- SIGNATURE CENTER ---------- */

  if (signatureBase64) {
    const cleanBase64 = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const boxWidth = 120;
    const boxHeight = 100;

    const availableTop = headerBottomY;
    const availableBottom = lineY;

    const availableHeight = availableBottom - availableTop;

    const centerY = availableTop + availableHeight / 2 - boxHeight / 2;

    doc.image(buffer, centerX - boxWidth / 2, centerY, {
      fit: [boxWidth, boxHeight],
      align: "center",
    });
  }
  return startY + height;
}
