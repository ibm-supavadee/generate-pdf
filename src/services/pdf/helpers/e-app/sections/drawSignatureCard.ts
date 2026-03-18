import { drawCardImageBox } from "./drawCardImageBox";
import { drawTwoColumnSection } from "../layout/drawTwoColumnSection";
import { drawSignature } from "./drawSignature";

export function drawSignatureCard({
  doc,
  y,
  margin,
  contentWidth,
  pdfData,
  label,
  data,
  height,
}: any) {
  return drawTwoColumnSection({
    doc,
    y,
    margin,
    contentWidth,

    leftRatio: 0.6,
    rightRatio: 0.4,
    height,

    drawLeft: (x, y, width) =>
      drawCardImageBox({
        doc,
        y,
        margin: x,
        contentWidth: width,
        height,
        title: `${label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO} ${pdfData.customerInfo.idCardNo}`,
        imageBase64: data.cardImage,
      }),

    drawRight: (x, y, width) =>
      drawSignature({
        doc,
        y,
        margin: x,
        contentWidth: width,
        height,
        title: label.SIGNATURE_LABEL,
        date: pdfData.registerDate,
        signatureBase64: data.signatureImage,
      }),
  });
}
