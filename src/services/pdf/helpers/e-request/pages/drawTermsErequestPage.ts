import { CUSTOMER_TYPE } from "../../../../../constants/enum";
import { renderTcERequestExisting } from "../sections/renderTcERequestExisting";
import { renderTcERequestNew } from "../sections/renderTcERequestNew";

type Params = {
  doc: PDFKit.PDFDocument;
  data: any;
  label: any;
  margin: number;
  pageWidth: number;
  pageHeight: number;
  drawTermsHeader: (y: number) => number;
  drawSectionHeader: Function;
  contentWidth: number;
};

export function drawTermsErequestPage({
  doc,
  data,
  label,
  margin,
  pageWidth,
  pageHeight,
  drawTermsHeader,
  drawSectionHeader,
  contentWidth,
}: Params) {
  /* -------------------------
     NEW PAGE
  ------------------------- */

  doc.addPage();

  let y = drawTermsHeader(margin);

  const termsHtml = data.termsAndConditions;

  /* -------------------------
     TERMS CONTENT
  ------------------------- */

  if (data.customerType === CUSTOMER_TYPE.EXISTING) {
    y = renderTcERequestExisting({
      doc,
      html: termsHtml,
      y,
      margin,
      pageWidth,
      pageHeight,
      drawHeader: drawTermsHeader,
    });
  } else {
    renderTcERequestNew(doc, termsHtml, {
      margin,
      pageWidth,
      pageHeight,
      startY: y,
      drawHeader: drawTermsHeader,
    });
  }

  return y;
}
