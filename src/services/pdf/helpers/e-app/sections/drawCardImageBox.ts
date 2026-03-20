import { Buffer } from "buffer";
import { FONT_SIZE, PDF_COLORS } from "../../../constants/pdf.constants";
import { drawSectionHeader } from "../../layout/drawSectionHeader";
import { PdfEAppData } from "../../../models/pdf-eapp-data.model";
import { getIdCardTitle } from "../utils/getCustomerTitles";
import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import { LANG, REGISTER_TYPE } from "../../../../../constants/enum";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  height: number;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  data: PdfEAppData;
  lang: LANG;
};

export function drawCardImageBox({
  doc,
  y,
  margin,
  contentWidth,
  height,
  label,
  data,
  lang,
}: Params): number {
  const startY = y;

  const imageBase64 = data.cardImage;
  const isShowInfoOnCardSection = data.isShowInfoOnCardSection;
  let customerInfo;
  if (lang === LANG.TH) {
    customerInfo = data.thData.customerInfo;
  } else {
    customerInfo = data.enData.customerInfo;
  }

  const idCardTitle = getIdCardTitle(
    customerInfo.registerType as REGISTER_TYPE,
    label,
  );

  const title = `${idCardTitle} ${customerInfo.idCardNo || ""}`;

  /* HEADER */
  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title,
    options: { fullWidth: true },
  });

  const boxHeight = height - (y - startY);

  /* BOX BORDER */
  doc
    .rect(margin + 0.5, y + 0.5, contentWidth - 1, boxHeight - 1)
    .strokeColor(PDF_COLORS.GREEN)
    .lineWidth(1)
    .stroke();

  /* =========================
      IMAGE ONLY
     ========================= */
  if (!isShowInfoOnCardSection) {
    if (imageBase64) {
      const buffer = getImageBuffer(imageBase64);

      const padding = 10;

      const maxW = contentWidth - padding * 2;
      const maxH = boxHeight - padding * 2;

      const img = (doc as any).openImage(buffer);

      const scale = Math.min(maxW / img.width, maxH / img.height);

      const finalW = img.width * scale;
      const finalH = img.height * scale;

      const imgX = margin + (contentWidth - finalW) / 2;
      const imgY = y + (boxHeight - finalH) / 2;

      doc.image(buffer, imgX, imgY, {
        width: finalW,
        height: finalH,
      });
    }

    return startY + height;
  }

  /* =========================
      IMAGE & PROFILE INFO
     ========================= */
  if (isShowInfoOnCardSection) {
    const padding = 15;

    const leftWidth = 100;
    const imageHeight = 150;

    const leftX = margin + padding;
    const leftY = y + padding;

    const rightX = leftX + leftWidth + 20;
    let rightY = leftY;

    /* IMAGE LEFT */
    if (imageBase64) {
      const buffer = getImageBuffer(imageBase64);

      doc.image(buffer, leftX, leftY, {
        fit: [leftWidth, imageHeight],
        align: "center",
        valign: "center",
      });
    }

    /* TEXT RIGHT */
    const labelColor = PDF_COLORS.GRAY;
    const valueColor = PDF_COLORS.GREEN;

    const lineGap = 6;

    const drawRow = (label: string, value?: string, isBoldValue = false) => {
      if (!value) return;

      // label
      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(label, rightX, rightY);

      // value
      doc
        .fillColor(valueColor)
        .font(isBoldValue ? "bold" : "regular")
        .fontSize(FONT_SIZE)
        .text(value, rightX + 120, rightY);

      rightY += 16 + lineGap;
    };

    drawRow("ชื่อ-นามสกุล", customerInfo?.nameTh, true);
    drawRow("Name", customerInfo?.nameEn);
    drawRow("วันเกิด", customerInfo?.dob);

    // address multiline
    if (customerInfo?.address) {
      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(10)
        .text("ที่อยู่", rightX, rightY);

      doc
        .fillColor(valueColor)
        .font("regular")
        .fontSize(11)
        .text(customerInfo.address, rightX + 120, rightY, {
          width: contentWidth - rightX - 140,
        });

      rightY += 40;
    }

    // footer dates
    if (customerInfo?.issueDate) {
      doc
        .fillColor(labelColor)
        .fontSize(10)
        .text(
          `วันออกบัตร ${customerInfo.issueDate}`,
          rightX,
          y + boxHeight - 40,
        );
    }

    if (customerInfo?.expiryDate) {
      doc
        .fillColor(labelColor)
        .fontSize(10)
        .text(
          `วันหมดอายุ ${customerInfo.expiryDate}`,
          rightX,
          y + boxHeight - 25,
        );
    }

    return startY + height;
  }

  return startY + height;
}

/* =========================
    HELPERS
   ========================= */

function getImageBuffer(base64: string) {
  const clean = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  return Buffer.from(clean, "base64");
}
