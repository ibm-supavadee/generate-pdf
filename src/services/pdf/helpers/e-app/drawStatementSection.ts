import { E_APP_LABEL_EN } from "../../constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../constants/e-app-label-th.constant";
import { PDF_COLORS } from "../../constants/pdf.constants";
import { PdfData, PdfEAppData } from "../../models/pdf-eapp-data.model";
import { drawSectionHeader } from "../common/drawSectionHeader";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  customerType: string;
  pdfData: PdfData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
};

export function drawStatementSection({
  doc,
  y,
  margin,
  contentWidth,
  customerType,
  pdfData,
  label,
}: Params): number {
  /* -----------------------------
     HEADER
  ----------------------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.STATEMENT_TITLE,
    options: { withDivider: true },
  });

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

  if (customerType === "NEW_REGISTER") {
    /* BILLING CHANNEL */
    drawRow(
      label.CUSTOMER_INFO.BILLING_CHANNEL,
      pdfData.customerInfo.billingChannel,
    );

    /* divider */
    doc
      .moveTo(margin, y)
      .lineTo(margin + contentWidth, y)
      .strokeColor(PDF_COLORS.BORDER)
      .lineWidth(0.5)
      .stroke();
  }

  /* DOCUMENT DELIVERY ADDRESS */
  drawRow(
    label.CUSTOMER_INFO.DOCUMENT_DELIVERY_ADDRESS,
    pdfData.customerInfo.documentDeliveryAddress,
  );

  /* box */
  doc
    .rect(margin + 0.5, startY + 0.5, contentWidth - 1, y - startY - 1)
    .strokeColor(PDF_COLORS.BORDER)
    .lineWidth(1)
    .stroke();

  return y + 4;
}
