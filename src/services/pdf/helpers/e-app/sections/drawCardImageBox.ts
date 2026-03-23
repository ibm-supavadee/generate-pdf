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

  /* Format date on card section */
  const formatDate = (date?: string) => {
    if (!date) return "";
    return lang === LANG.TH ? `วันที่ ${date}` : date;
  };

  const dateOfIssue = formatDate(customerInfo?.dateOfIssue);
  const dateOfExpiry = formatDate(customerInfo?.dateOfExpiry);

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
      const boxX = margin;
      const boxY = y;

      const contentTopPadding = 10;
      const contentBottomPadding = 10;

      const maxW = contentWidth - padding * 2;
      const maxH = boxHeight - contentTopPadding - contentBottomPadding;

      const img = (doc as any).openImage(buffer);

      const scale = Math.min(maxW / img.width, maxH / img.height);

      const finalW = img.width * scale;
      const finalH = img.height * scale;

      const imgX = boxX + (contentWidth - finalW) / 2;

      const imgY = boxY + contentTopPadding + (maxH - finalH) / 2;

      doc.image(buffer, imgX, imgY, {
        width: finalW,
        height: finalH,
      });
    }

    return startY + height;
  }

  /* =========================
    IMAGE & CUSTOMER INFO
   ========================= */
  if (isShowInfoOnCardSection) {
    const padding = 15;

    const leftWidth = 100;
    const imageHeight = 120;

    const leftX = margin + padding;

    const rightX = leftX + leftWidth + 20;

    const labelColor = PDF_COLORS.GRAY;
    const valueColor = PDF_COLORS.GREEN;

    const lineHeight = 16;
    const lineGap = 1;

    /* -------------------------
     1. CALCULATE TOTAL HEIGHT
     ------------------------- */
    let totalTextHeight = 0;

    const countRow = (value?: string) => {
      if (value) totalTextHeight += lineHeight + lineGap;
    };

    countRow(customerInfo?.nameTh);
    countRow(customerInfo?.nameEn);
    countRow(customerInfo?.birthDate);

    const textWidth = contentWidth - rightX - 10;

    if (customerInfo?.address) {
      totalTextHeight += lineHeight;

      const addressHeight = doc.heightOfString(customerInfo.address, {
        width: textWidth,
      });

      totalTextHeight += addressHeight + lineGap;
    }

    if (customerInfo?.dateOfIssue) {
      totalTextHeight += lineHeight + lineGap;
    }

    if (customerInfo?.dateOfExpiry) {
      totalTextHeight += lineHeight + lineGap;
    }

    const contentHeight = Math.max(imageHeight, totalTextHeight);

    /* -------------------------
     2. CENTER VERTICALLY
     ------------------------- */
    const startContentY = y + (boxHeight - contentHeight) / 2;

    const leftY = startContentY;
    let rightY = startContentY;

    /* -------------------------
     3. IMAGE LEFT
     ------------------------- */
    if (imageBase64) {
      const buffer = getImageBuffer(imageBase64);

      doc.image(buffer, leftX, leftY, {
        fit: [leftWidth, imageHeight],
        align: "center",
        valign: "center",
      });
    }

    /* -------------------------
     4. TEXT RIGHT
     ------------------------- */
    const drawRow = (label: string, value?: string) => {
      if (!value) return;

      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(label, rightX, rightY);

      doc
        .fillColor(valueColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(value, rightX + 80, rightY);

      rightY += lineHeight + lineGap;
    };

    drawRow(label.CUSTOMER_INFO.FULL_NAME, customerInfo?.nameTh);
    drawRow(label.CUSTOMER_INFO.NAME, customerInfo?.nameEn);
    drawRow(label.CUSTOMER_INFO.BIRTH_DATE, customerInfo?.birthDate);

    /* address */
    if (customerInfo?.address) {
      rightY += 10;
      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(label.CUSTOMER_INFO.ADDRESS, rightX, rightY);

      rightY += lineHeight;

      doc
        .fillColor(valueColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(customerInfo.address, rightX, rightY, {
          width: contentWidth - rightX,
        });

      rightY = doc.y + 10;
    }

    /* -------------------------
     5. DATE
     ------------------------- */
    /* DATE OF ISSUE */
    if (customerInfo?.dateOfIssue) {
      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(label.CUSTOMER_INFO.DATE_OF_ISSUE, rightX, rightY);

      doc
        .fillColor(valueColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(dateOfIssue, rightX + 80, rightY);

      rightY += lineHeight + lineGap;
    }

    /* DATE OF EXPIRY */
    if (customerInfo?.dateOfExpiry) {
      doc
        .fillColor(labelColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(label.CUSTOMER_INFO.DATE_OF_EXPIRY, rightX, rightY);

      doc
        .fillColor(valueColor)
        .font("regular")
        .fontSize(FONT_SIZE)
        .text(dateOfExpiry, rightX + 80, rightY);

      rightY += lineHeight + lineGap;
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
