import { E_REQUEST_LABEL_EN } from "../constants/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "../constants/e-request-label-th.constant";
import { PDF_COLORS } from "../constants/pdf.constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  label: typeof E_REQUEST_LABEL_EN | typeof E_REQUEST_LABEL_TH;
  ensureSpace: (height: number) => void;
};

export function drawRemark({
  doc,
  y,
  margin,
  contentWidth,
  label,
  ensureSpace,
}: Params): number {
  const topSpacing = 15;
  const remarkHeight = doc.heightOfString(label.REMARKS, {
    width: contentWidth,
  });

  ensureSpace(remarkHeight + topSpacing);

  y = doc.y;

  y += topSpacing;

  doc
    .font("regular")
    .fontSize(9)
    .fillColor(PDF_COLORS.GRAY)
    .text(label.REMARKS, margin, y, {
      width: contentWidth,
      lineGap: 2,
    });

  return doc.y;
}
