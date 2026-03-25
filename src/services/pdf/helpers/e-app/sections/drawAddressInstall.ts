import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import { PDF_COLORS } from "../../../constants/pdf.constants";
import { PdfData } from "../../../models/pdf-eapp-data.model";
import { drawSectionHeader } from "../../layout/drawSectionHeader";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pdfData: PdfData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  skipBox?: boolean;
  fixedEndY?: number;
};

export function drawAddressInstall({
  doc,
  y,
  margin,
  contentWidth,
  pdfData,
  label,
  skipBox,
  fixedEndY,
}: Params): { endY: number; contentStartY: number } {
  /* -----------------------------
     HEADER
  ----------------------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
    options: { withDivider: true },
  });

  const startY = y;
  const padding = 10;
  const address = pdfData.customerInfo.installAddress || "-";

  /* -----------------------------
     DRAW TEXT
  ----------------------------- */

  doc
    .font("regular")
    .fillColor(PDF_COLORS.GREEN)
    .text(address, margin + padding, y + padding, {
      width: contentWidth - padding * 2,
    });

  /* -----------------------------
     DRAW BOX
  ----------------------------- */

  const naturalEndY = doc.y + padding;
  const endY = fixedEndY ?? naturalEndY;
  const boxHeight = endY - startY;

  if (!skipBox) {
    doc
      .rect(margin + 0.5, startY + 0.5, contentWidth - 1, boxHeight)
      .lineWidth(1)
      .strokeColor(PDF_COLORS.BORDER)
      .stroke();
  }

  return { endY, contentStartY: startY };
}
