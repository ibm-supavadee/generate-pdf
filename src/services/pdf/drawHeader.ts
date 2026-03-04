import path from "path";
import { PDF_COLORS } from "./constants";

export function drawHeader({
  doc,
  y,
  margin,
  pageWidth,
  title,
}: {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  pageWidth: number;
  title: string;
}) {
  const headerHeight = 30;
  const radius = 8;

  const headerWidth = (pageWidth - margin * 2) * 0.75;
  const headerX = margin;

  const logoPath = path.resolve(
    process.cwd(),
    "src/assets/img/icons/png/AIS-Fibre3-FullColor-LightBG.png",
  );

  /* -------------------------
     HEADER BOX
  ------------------------- */

  doc
    .moveTo(headerX, y + headerHeight)
    .lineTo(headerX, y + radius)
    .quadraticCurveTo(headerX, y, headerX + radius, y)
    .lineTo(headerX + headerWidth - radius, y)
    .quadraticCurveTo(
      headerX + headerWidth,
      y,
      headerX + headerWidth,
      y + radius,
    )
    .lineTo(headerX + headerWidth, y + headerHeight)
    .lineTo(headerX, y + headerHeight)
    .closePath()
    .fill(PDF_COLORS.GREEN);

  /* -------------------------
     TITLE (CENTER)
  ------------------------- */

  doc.font("regular").fontSize(18);

  const textHeight = doc.currentLineHeight();

  const textY = y + (headerHeight - textHeight) / 2;

  doc.fillColor(PDF_COLORS.WHITE).text(title, headerX, textY, {
    width: headerWidth,
    align: "center",
  });

  /* -------------------------
     LOGO
  ------------------------- */

  const logoWidth = 65;

  doc.image(
    logoPath,
    pageWidth - margin - logoWidth,
    y + headerHeight / 2 - 15,
    { width: logoWidth },
  );

  return y + headerHeight + 3;
}
