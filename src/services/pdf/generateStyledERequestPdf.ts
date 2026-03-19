import { E_REQUEST_LABEL_EN } from "./constants/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "./constants/e-request-label-th.constant";
import { createDocument } from "./helpers/core/createDocument";
import { createLayoutContext } from "./helpers/core/layoutContext";
import { drawTermsPage } from "./helpers/e-app/page/drawTermsPage";
import { drawMainPage } from "./helpers/e-request/pages/drawMainPage";
import { drawTermsErequestPage } from "./helpers/e-request/pages/drawTermsErequestPage";
import { drawHeader } from "./helpers/layout/drawHeader";
import { drawSectionHeader } from "./helpers/layout/drawSectionHeader";
import { drawPageNumbers } from "./helpers/utils/drawPageNumber";
import { PdfERequestData } from "./models/pdf-erequest-data.model";

/* -----------------------------
   MAIN FUNCTION
----------------------------- */

export async function generateStyledERequestPdf(
  data: PdfERequestData,
): Promise<string> {
  const label = data.lang === "EN" ? E_REQUEST_LABEL_EN : E_REQUEST_LABEL_TH;

  /* -------------------------
     CREATE DOCUMENT
  ------------------------- */

  const { doc, getBase64 } = createDocument();

  /* -------------------------
     PAGE CONFIG
  ------------------------- */

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  /* -------------------------
     HEADER FUNCTIONS
  ------------------------- */

  const drawMainHeader = (startY: number) =>
    drawHeader({
      doc,
      y: startY,
      margin,
      pageWidth,
      title: label.SUMMARY_SELECTED_PACKAGE,
    });

  const drawTermsHeader = (startY: number) =>
    drawHeader({
      doc,
      y: startY,
      margin,
      pageWidth,
      title: label.TERMS_AND_CONDITIONS_OF_SERVICE,
    });

  /* -------------------------
     LAYOUT CONTEXT
  ------------------------- */

  const ctx = createLayoutContext({
    doc,
    margin,
    pageHeight,
    drawHeader: drawMainHeader,
  });

  /* -------------------------
     MAIN PAGE
  ------------------------- */

  ctx.setY(drawMainHeader(margin));

  drawMainPage({
    doc,
    ctx,
    data,
    label,
    margin,
    contentWidth,
    pageHeight,
    drawMainHeader,
  });

  /* -------------------------
     TERMS PAGE
  ------------------------- */

  drawTermsErequestPage({
    doc,
    data,
    label,
    margin,
    pageWidth,
    pageHeight,
    drawTermsHeader,
    drawSectionHeader,
    contentWidth,
  });

  /* -------------------------
     PAGE NUMBER
  ------------------------- */

  drawPageNumbers(doc);

  doc.end();

  return await getBase64();
}
