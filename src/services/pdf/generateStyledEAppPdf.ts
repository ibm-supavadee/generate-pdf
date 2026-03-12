import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";
import { FONT_SIZE, PDF_COLORS } from "./constants/pdf.constants";
import { E_APP_LABEL_EN } from "./constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "./constants/e-app-label-th.constant";
import { drawSectionHeader } from "./helpers/e-request/drawSectionHeader";
import { drawCustomerInfoEApp } from "./helpers/e-app/drawCustomerInfoEApp";
import { PdfEAppData } from "./models/pdf-eapp-data.model";
import { drawHeader } from "./helpers/common/drawHeader";
import { drawAddressInstall } from "./helpers/e-app/drawAddressInstall";
import { drawStatement } from "./helpers/e-app/drawStatement";
import { renderRequestTable } from "./helpers/e-app/renderRequestTable";
import { drawRemark } from "./helpers/e-request/drawRemark";
import path from "path";
import { drawCardBox } from "./helpers/e-app/drawCardBox";
import { drawSignatureSection } from "./helpers/e-app/drawSignature";

export async function generateStyledEAppPdf(
  data: PdfEAppData,
): Promise<string> {
  const label = data.lang === "EN" ? E_APP_LABEL_EN : E_APP_LABEL_TH;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 10,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));

      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdf.toString("base64")}`);
      });

      /* -------------------------
         FONT SETUP
      ------------------------- */

      doc.registerFont("regular", Buffer.from(dbHelvethaicaAisXV3, "base64"));
      doc.registerFont("bold", Buffer.from(dbHelvethaicaAisXBdV3, "base64"));

      doc.font("regular").fontSize(FONT_SIZE);

      /* -------------------------
         PAGE CONFIG
      ------------------------- */

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      let y = margin;

      const ensureSpace = (height: number) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const drawMainHeader = (startY: number) =>
        drawHeader({
          doc,
          y: startY,
          margin,
          pageWidth,
          title: label.EAPP_MAIN_TITLE,
        });

      /* -------------------------
         HEADER
      ------------------------- */
      doc
        .font("regular")
        .fontSize(9)
        .fillColor(PDF_COLORS.GRAY)
        .text(label.COMPANY_INFO, margin, y, {
          width: contentWidth,
          lineGap: 2,
        });

      y += 15;
      y = drawMainHeader(y);

      /* -------------------------
         CUSTOMER INFO
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.DATA_OF_SUBSCRIBER_TITLE,
        options: { withDivider: true },
      });

      y = drawCustomerInfoEApp({
        doc,
        y,
        margin,
        contentWidth,
        data,
        label,
        ensureSpace,
      });

      y += 20;

      /* -------------------------
        ADDRESS + PACKAGES (2 COLUMNS)
      ------------------------- */

      const columnGap = 20;
      const columnWidth = (contentWidth - columnGap) / 2;

      const leftX = margin;
      const rightX = margin + columnWidth + columnGap;

      const startY = y;

      /* -------------------------
        LEFT COLUMN
      ------------------------- */

      let leftY = drawSectionHeader({
        doc,
        y: startY,
        margin: leftX,
        contentWidth: columnWidth,
        title: label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
        options: { withDivider: true },
      });

      leftY = drawAddressInstall({
        doc,
        y: leftY,
        margin: leftX,
        contentWidth: columnWidth,
        data,
        label,
      });

      /* -------------------------
        RIGHT COLUMN
      ------------------------- */

      let rightY = drawSectionHeader({
        doc,
        y: startY,
        margin: rightX,
        contentWidth: columnWidth,
        title: label.STATEMENT_TITLE,
        options: { withDivider: true },
      });

      rightY = drawStatement({
        doc,
        y: rightY,
        margin: rightX,
        contentWidth: columnWidth,
        data,
        label,
      });

      /* -------------------------
        SYNC Y POSITION
      ------------------------- */

      y = Math.max(leftY, rightY) + 20;

      /* -------------------------
        EXPENSE TABLE
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
        options: { fullWidth: true },
      });

      y = renderRequestTable({
        doc,
        y,
        margin,
        contentWidth,
        pageHeight,
        data,
        label,
      });

      /* -------------------------
            REMARK
        ------------------------- */

      y = drawRemark({
        doc,
        y,
        margin,
        contentWidth,
        label: label.REMARKS,
        ensureSpace,
      });

      y = drawRemark({
        doc,
        y,
        margin,
        contentWidth,
        label: label.CONSENT,
        ensureSpace,
      });

      y += 20;

      /* -------------------------
   CARD + SIGNATURE (70 / 30)
------------------------- */

      const columnGap2 = 20;

      const cardWidth = contentWidth * 0.6 - columnGap2 / 2;
      const signWidth = contentWidth * 0.4 - columnGap2 / 2;

      const cardX = margin;
      const signX = margin + cardWidth + columnGap2;

      const sectionHeight = 200;

      const startY2 = y;

      const cardPath = path.join(
        process.cwd(),
        "src",
        "assets",
        "img",
        "pdf",
        "card.jpg",
      );

      drawCardBox({
        doc,
        y: startY2,
        margin: cardX,
        contentWidth: cardWidth,
        height: sectionHeight,
        title: `${label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO} ${data.customerInfo.idCardPassportNo}`,
        imagePath: cardPath,
      });

      const signaturePath = path.join(
        process.cwd(),
        "src",
        "assets",
        "img",
        "pdf",
        "sign.jpg",
      );

      drawSignatureSection({
        doc,
        y: startY2,
        margin: signX,
        contentWidth: signWidth,
        height: sectionHeight,
        title: label.SIGNATURE_LABEL,
        dateTh: "วันที่ 3 พ.ย. 2568",
        dateEn: "3 November 2025",
        signaturePath,
      });

      y = startY2 + sectionHeight + 20;

      /* -------------------------
         PAGE NUMBER
      ------------------------- */

      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        const page = i + 1;

        doc
          .font("regular")
          .fontSize(10)
          .fillColor("gray")
          .text(`${page}/${totalPages}`, 0, doc.page.height - 25, {
            width: doc.page.width - 20,
            align: "right",
          });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
