import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  PDF_COLORS,
} from "../../constants/pdf.constants";

import { E_APP_LABEL_EN } from "../../constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../constants/e-app-label-th.constant";

import { PdfEAppData } from "../../models/pdf-eapp-data.model";

type Row = {
  text: string;
  subText?: string;
  price?: string;
  bold?: boolean;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  data: PdfEAppData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
};

export function renderRequestTable({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  data,
  label,
}: Params): number {
  const startY = y;

  const priceWidth = 110;
  const detailWidth = contentWidth - priceWidth;

  const detailX = margin;
  const priceX = margin + detailWidth;

  const rowPadding = 8;

  /* FORMAT PRICE */

  const formatPrice = (price: number) =>
    price.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPriceText = (value: number) =>
    `${value < 0 ? "-" : ""}${formatPrice(Math.abs(value))} ${label.THB}`;

  /* ROW RENDER */

  const drawRow = (row: Row) => {
    const rowStartY = y;

    doc
      .font(row.bold ? "bold" : "regular")
      .fillColor(PDF_COLORS.GRAY)
      .text(row.text, detailX + 10, y + rowPadding, {
        width: detailWidth - 20,
        continued: !!row.subText,
      });

    if (row.subText) {
      doc.font("regular").text(row.subText);
    }

    if (row.price) {
      doc
        .font(row.bold ? "bold" : "regular")
        .fillColor(PDF_COLORS.GREEN)
        .text(row.price, priceX + 10, y + rowPadding, {
          width: priceWidth - 20,
          align: "right",
        });
    }

    const rowHeight = doc.y - rowStartY + rowPadding;

    y = rowStartY + rowHeight;
  };

  /* BUILD ROWS */

  const rows: Row[] = [];

  data.entrySection.forEach((item) => {
    const value = item.isDiscount ? -item.price : item.price;

    rows.push({
      text: item.text,
      price: formatPriceText(value),
    });
  });

  const total = data.entrySection.reduce((sum, item) => {
    const value = item.isDiscount ? -item.price : item.price;
    return sum + value;
  }, 0);

  // rows.push({
  //   text: label.SUMMARY_OF_CHARGES,
  //   subText: label.PRICE_EXCLUDE_VAT,
  //   price: `${formatPrice(total)} ${label.THB}`,
  //   bold: true,
  // });

  /* RENDER ROWS */

  rows.forEach(drawRow);

  /* BOX */

  doc
    .rect(margin + 0.5, startY + 0.5, contentWidth - 1, y - startY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 4;

  return y;
}
