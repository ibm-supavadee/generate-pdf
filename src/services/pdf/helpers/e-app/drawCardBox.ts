import { PDF_COLORS } from "../../constants/pdf.constants";
import { drawSectionHeader } from "../e-request/drawSectionHeader";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  title: string;
  imageBase64?: string;
};

export function drawCardBox({
  doc,
  y,
  margin,
  contentWidth,
  height,
  title,
  imageBase64,
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
    .rect(margin + 0.5, y + 0.5, contentWidth - 1, boxHeight - 1)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1)
    .stroke();
  /* IMAGE */

  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(
      /^data:image\/[a-zA-Z]+;base64,/,
      "",
    );

    const buffer = Buffer.from(cleanBase64, "base64");

    const padding = 10;

    const maxW = contentWidth - padding * 2;
    const maxH = boxHeight - padding * 2;

    const img = (doc as any).openImage(buffer);

    const scale = Math.min(maxW / img.width, maxH / img.height);

    const finalW = img.width * scale;
    const finalH = img.height * scale;

    // คำนวณตำแหน่ง center
    const imgX = margin + (contentWidth - finalW) / 2;
    const imgY = y + (boxHeight - finalH) / 2;

    doc.image(buffer, imgX, imgY, {
      width: finalW,
      height: finalH,
    });
  }

  return startY + height;
}
