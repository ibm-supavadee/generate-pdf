import { CUSTOMER_TYPE } from "../../../constants/pdf.constants";
import { renderTcEAppExisting } from "../utils/renderTcEAppExisting";
import { renderTcEAppNew } from "../utils/renderTcEAppNew";

export function drawTermsPage({
  doc,
  margin,
  pageWidth,
  pageHeight,
  data,
  pdfData,
  label,
  drawMainHeader,
}: any) {
  doc.addPage();

  let y = drawMainHeader(margin);

  if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
    renderTcEAppNew({
      doc,
      html: pdfData.termsAndConditions,
      y,
      margin,
      pageWidth,
      pageHeight,
      drawHeader: drawMainHeader,
    });
  } else {
    renderTcEAppExisting({
      doc,
      html: pdfData.termsAndConditions,
      y,
      margin,
      pageWidth,
      pageHeight,
      drawHeader: drawMainHeader,
    });
  }
}
