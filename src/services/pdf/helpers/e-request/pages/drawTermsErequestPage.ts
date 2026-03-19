import { CUSTOMER_TYPE } from "../../../constants/pdf.constants";
import { renderTcExisting } from "../sections/renderTcExisting";
import { renderTcNew } from "../sections/renderTcNew";

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
    y = renderTcExisting({
      doc,
      html: termsHtml,
      y,
      margin,
      pageWidth,
      pageHeight,
      drawHeader: drawTermsHeader,
    });
  } else {
    renderTcNew(doc, termsHtml, {
      margin,
      pageWidth,
      pageHeight,
      startY: y,
      drawHeader: drawTermsHeader,
    });
  }

  return y;
}
