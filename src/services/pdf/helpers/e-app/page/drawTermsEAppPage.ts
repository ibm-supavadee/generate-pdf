import { CUSTOMER_TYPE } from "../../../constants/pdf.constants";

import { renderTcEAppExisting } from "../sections/renderTcEAppExisting";
import { renderTcEAppNew } from "../sections/renderTcEAppNew";

type Params = {
  doc: PDFKit.PDFDocument;
  margin: number;
  pageWidth: number;
  pageHeight: number;
  data: any;
  pdfData: any;
  label: any;
  drawMainHeader: (y: number) => number;
};

export function drawTermsEAppPage({
  doc,
  margin,
  pageWidth,
  pageHeight,
  data,
  pdfData,
  drawMainHeader,
}: Params) {
  /* -------------------------
      START NEW PAGE
  ------------------------- */
  doc.addPage();

  let y = drawMainHeader(margin);

  /* -------------------------
      SELECT RENDERER
  ------------------------- */
  const isNew = data.customerType === CUSTOMER_TYPE.NEW_REGISTER;

  const render = isNew ? renderTcEAppNew : renderTcEAppExisting;

  /* -------------------------
      RENDER HTML TERMS
  ------------------------- */
  render({
    doc,
    html: pdfData?.termsAndConditions || "",
    y,
    margin,
    pageWidth,
    pageHeight,
    drawHeader: drawMainHeader,
  });
}
