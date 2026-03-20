import { drawCardImageBox } from "./drawCardImageBox";
import { drawTwoColumnSection } from "../../layout/drawTwoColumnSection";
import { drawSignature } from "./drawSignature";
import { HEADER_SPACING } from "../../../constants/pdf.constants";
import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import { PdfEAppData } from "../../../models/pdf-eapp-data.model";
import { LANG } from "../../../../../constants/enum";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  data: PdfEAppData;
  lang: LANG;
  ensureSpace: (height: number) => number;
};

export function drawSignatureCard({
  doc,
  y,
  margin,
  contentWidth,
  height,
  label,
  data,
  lang,
  ensureSpace,
}: Params) {
  y = ensureSpace(height);
  y += HEADER_SPACING;

  let registerDate = "";
  if (lang === LANG.TH) {
    registerDate = data.thData.registerDate || "";
  } else {
    registerDate = data.enData.registerDate || "";
  }

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
        label,
        data,
        lang,
      }),

    drawRight: (x, y, width) =>
      drawSignature({
        doc,
        y,
        margin: x,
        contentWidth: width,
        height,
        title: label.SIGNATURE_LABEL,
        date: registerDate,
        signatureBase64: data.signatureImage,
      }),
  });
}
