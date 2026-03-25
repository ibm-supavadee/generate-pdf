import { PdfEAppData } from "../../../models/pdf-eapp-data.model";

import {
  CARD_SIGN_SECTION_HEIGHT,
  PDF_COLORS,
} from "../../../constants/pdf.constants";

import { drawHeader } from "../../layout/drawHeader";
import { drawMainContentPage } from "./drawMainContentPage";
import { drawSignatureCard } from "../sections/drawSignatureCard";
import { drawTermsEAppPage } from "./drawTermsEAppPage";
import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import { CUSTOMER_TYPE, LANG } from "../../../../../constants/enum";

type Params = {
  doc: PDFKit.PDFDocument;
  data: PdfEAppData;
  lang: LANG;
};

export function drawMainEAppPage({ doc, data, lang }: Params) {
  const label = lang === LANG.EN ? E_APP_LABEL_EN : E_APP_LABEL_TH;
  const pdfData = lang === LANG.EN ? data.enData : data.thData;

  /* -------------------------
      PAGE CONFIG
  ------------------------- */
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  /* -------------------------
      HEADER
  ------------------------- */
  const companyInfo =
    data.productOwner === "FBB"
      ? label.COMPANY_AWN_INFO
      : label.COMPANY_3BB_INFO;

  const drawMainHeader = (startY: number): number => {
    doc
      .font("regular")
      .fontSize(9)
      .fillColor(PDF_COLORS.GRAY)
      .text(companyInfo, margin, startY, {
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

  /* -------------------------
      ENSURE SPACE (page break)
  ------------------------- */
  const ensureSpace = (height: number): number => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = drawMainHeader(margin);
    }
    return y;
  };

  /* -------------------------
      START DRAW
  ------------------------- */
  y = drawMainHeader(y);

  /* -------------------------
      MAIN CONTENT
  ------------------------- */
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
    lang,
    drawMainHeader,
    ensureSpace,
  });

  /* -------------------------
      SIGNATURE
  ------------------------- */
  if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
    y = drawSignatureCard({
      doc,
      y,
      margin,
      contentWidth,
      label,
      data,
      lang,
      ensureSpace,
    });
  }

  /* -------------------------
      TERMS
  ------------------------- */
  drawTermsEAppPage({
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
