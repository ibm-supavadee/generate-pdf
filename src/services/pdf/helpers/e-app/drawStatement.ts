import { E_APP_LABEL_EN } from "../../constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../constants/e-app-label-th.constant";
import { PDF_COLORS } from "../../constants/pdf.constants";
import { PdfEAppData } from "../../models/pdf-eapp-data.model";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfEAppData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
};

export function drawStatement({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
}: Params): number {
  const startY = y;

  const labelWidth = 110;
  const contentX = margin + labelWidth + 10;
  const contentWidthPkg = contentWidth - labelWidth - 20;

  const rowPadding = 8;

  const drawRow = (title: string, value?: string) => {
    const rowStartY = y;

    const text = value || "-";

    /* label */

    doc
      .font("bold")
      .fillColor(PDF_COLORS.GRAY)
      .text(title, margin + 10, y + rowPadding);

    /* value */

    doc
      .font("regular")
      .fillColor(text === "-" ? PDF_COLORS.GRAY : PDF_COLORS.GREEN)
      .text(text, contentX, y + rowPadding, {
        width: contentWidthPkg,
      });

    const rowHeight = doc.y - rowStartY + rowPadding;

    y = rowStartY + rowHeight;
  };

  /* BILLING CHANNEL */

  drawRow(
    label.CUSTOMER_INFO.BILLING_CHANNEL,
    data.customerInfo.billingChannel,
  );

  /* divider */

  doc
    .moveTo(margin, y)
    .lineTo(margin + contentWidth, y)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(0.5)
    .stroke();

  /* DOCUMENT DELIVERY ADDRESS */

  drawRow(
    label.CUSTOMER_INFO.DOCUMENT_DELIVERY_ADDRESS,
    data.customerInfo.documentDeliveryAddress,
  );

  /* box */

  doc
    .rect(margin + 0.5, startY + 0.5, contentWidth - 1, y - startY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  y += 4;

  return y;
}
