import { PDF_COLORS } from "../../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: any;
  label: any;
};

export function renderPackageDetail({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
}: Params) {
  const tablePaddingTop = 10;
  const tablePaddingBottom = 10;
  const cellPaddingTop = 1;
  const cellPaddingBottom = 1;

  const startY = y;

  const priceWidth = 80;
  const detailWidth = contentWidth - priceWidth;

  const detailX = margin;
  const priceX = margin + detailWidth;

  const formatPrice = (price: number) =>
    price.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPriceText = (value: number) =>
    `${formatPrice(value)} ${label.THB}`;

  y += tablePaddingTop;

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GRAY)
    .text(
      data.packageDetailSection.packageName,
      detailX + 10,
      y + cellPaddingTop,
      {
        width: detailWidth - 20,
      },
    );

  y = doc.y + cellPaddingBottom;

  data.packageDetailSection.details.forEach((item: any) => {
    const rowStartY = y;

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GRAY)
      .text(`• ${item.text}`, detailX + 20, rowStartY + cellPaddingTop, {
        width: detailWidth - 30,
        lineGap: 2,
      });

    const textEndY = doc.y;

    let priceEndY = rowStartY;
    if (item.price !== undefined) {
      doc
        .font("regular")
        .fillColor(PDF_COLORS.GREEN)
        .text(formatPriceText(item.price), priceX, rowStartY + cellPaddingTop, {
          width: priceWidth - 10,
          align: "right",
        });
      priceEndY = doc.y;
    }

    y = Math.max(textEndY, priceEndY) + cellPaddingBottom;
  });

  // Add final padding before closing the table
  y += tablePaddingBottom;
  const tableBottomY = y;

  // Vertical Divider Line
  doc
    .moveTo(priceX, startY)
    .lineTo(priceX, tableBottomY)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  doc
    .rect(margin, startY, contentWidth, tableBottomY - startY)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  return tableBottomY;
}
