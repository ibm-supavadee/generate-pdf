import { PDF_COLORS } from "../../constants/pdf.constants";
import { drawSectionHeader } from "../e-request/drawSectionHeader";

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
}: Params): number {
  const startY = y;

  const priceWidth = 80;
  const detailWidth = contentWidth - priceWidth;

  const detailX = margin;
  const priceX = margin + detailWidth;

  const tablePaddingTop = 10;
  const tablePaddingBottom = 10;
  const textPaddingTop = 8;

  const rowPadding = 1;

  const formatPrice = (price: number) =>
    price.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPriceText = (value: number) =>
    `${formatPrice(value)} ${label.THB}`;

  /* HEADER */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
    options: { fullWidth: true },
  });

  const tableStartY = y;

  /* PACKAGE NAME */

  doc
    .font("bold")
    .fillColor(PDF_COLORS.GRAY)
    .text(
      data.packageDetailSection.packageName,
      detailX + 10,
      y + textPaddingTop,
      {
        width: detailWidth - 20,
      },
    );

  y = doc.y + rowPadding;

  /* DETAILS */

  data.packageDetailSection.details.forEach((item: any) => {
    const rowStartY = y;

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GRAY)
      .text(`• ${item.text}`, detailX + 20, rowStartY + rowPadding, {
        width: detailWidth - 30,
        lineGap: 2,
      });

    const textEndY = doc.y;

    let priceEndY = rowStartY;

    if (item.price !== undefined) {
      doc
        .font("regular")
        .fillColor(PDF_COLORS.GREEN)
        .text(formatPriceText(item.price), priceX, rowStartY + rowPadding, {
          width: priceWidth - 10,
          align: "right",
        });

      priceEndY = doc.y;
    }

    y = Math.max(textEndY, priceEndY) + rowPadding;
  });

  /* TABLE BOTTOM */

  y += tablePaddingBottom;

  const tableBottomY = y;

  /* VERTICAL DIVIDER */

  doc
    .moveTo(priceX, tableStartY)
    .lineTo(priceX, tableBottomY)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  /* TABLE BORDER */

  doc
    .rect(
      margin + 0.5,
      tableStartY + 0.5,
      contentWidth - 1,
      tableBottomY - tableStartY - 1,
    )
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  return tableBottomY;
}
