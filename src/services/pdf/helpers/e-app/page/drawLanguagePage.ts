import { PdfEAppData } from "../../../models/pdf-eapp-data.model";
import { E_APP_LABEL_EN } from "../../../constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app-label-th.constant";
import { CUSTOMER_TYPE, PDF_COLORS } from "../../../constants/pdf.constants";
import { drawHeader } from "../../common/drawHeader";
import { drawMainContentPage } from "./drawMainContentPage";
import { drawTermsPage } from "./drawTermsPage";
import { drawSignatureCard } from "../sections/drawSignatureCard";

export function drawLanguagePage(
  doc: PDFKit.PDFDocument,
  data: PdfEAppData,
  lang: "TH" | "EN",
) {
  const label = lang === "EN" ? E_APP_LABEL_EN : E_APP_LABEL_TH;
  const pdfData = lang === "EN" ? data.enData : data.thData;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const CARD_SIGN_SECTION_HEIGHT = 180;

  let y = margin;

  const drawMainHeader = (startY: number): number => {
    doc
      .font("regular")
      .fontSize(9)
      .fillColor(PDF_COLORS.GRAY)
      .text(label.COMPANY_INFO, margin, startY, {
        width: contentWidth,
        lineGap: 2,
      });

    return drawHeader({
      doc,
      y: startY + 15,
      margin,
      pageWidth,
      title: label.EAPP_MAIN_TITLE,
    });
  };

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = drawMainHeader(margin);
    }
  };

  y = drawMainHeader(y);

  y = drawMainContentPage({
    doc,
    y,
    margin,
    contentWidth,
    pageWidth,
    pageHeight,
    data,
    pdfData,
    label,
    drawMainHeader,
    ensureSpace,
  });

  if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
    y = drawSignatureCard({
      doc,
      y,
      margin,
      contentWidth,
      pdfData,
      label,
      data,
      height: CARD_SIGN_SECTION_HEIGHT,
    });
  }

  drawTermsPage({
    doc,
    margin,
    pageWidth,
    pageHeight,
    data,
    pdfData,
    label,
    drawMainHeader,
  });
}
