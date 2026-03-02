import path from "path";
import type PDFDocument from "pdfkit";
import { PDF_COLORS } from "./constants";

export function drawHeader({
  doc,
  y,
  margin,
  pageWidth,
  title = "สรุปข้อมูลสมัครบริการ",
}: {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  pageWidth: number;
  title?: string;
}) {
  const headerHeight = 35;
  const radius = 12;

  const headerWidth = (pageWidth - margin * 2) * 0.75;
  const headerX = margin;

  const logoPath = path.resolve(
    process.cwd(),
    "src/assets/img/icons/png/AIS-Fibre3-FullColor-LightBG.png",
  );

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

  doc
    .fillColor(PDF_COLORS.WHITE)
    .font("bold")
    .fontSize(18)
    .text(title, headerX, y + headerHeight / 2 - 8, {
      width: headerWidth,
      align: "center",
    });

  const logoWidth = 60;

  doc.image(
    logoPath,
    pageWidth - margin - logoWidth,
    y + headerHeight / 2 - 15,
    { width: logoWidth },
  );

  return y + headerHeight + 5;
}
