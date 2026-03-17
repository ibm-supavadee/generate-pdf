import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";
import {
  CUSTOMER_TYPE,
  FONT_SIZE,
  PDF_COLORS,
} from "./constants/pdf.constants";
import { E_APP_LABEL_EN } from "./constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "./constants/e-app-label-th.constant";
import { drawCustomerInfoEApp } from "./helpers/e-app/drawCustomerInfoEApp";
import { PdfEAppData } from "./models/pdf-eapp-data.model";
import { drawHeader } from "./helpers/common/drawHeader";
import { drawAddressInstallSection } from "./helpers/e-app/drawAddressInstallSection";
import { drawStatementSection } from "./helpers/e-app/drawStatementSection";
import { drawRemark } from "./helpers/e-request/drawRemark";
import { drawCardBox } from "./helpers/e-app/drawCardBox";
import { drawSignatureSection } from "./helpers/e-app/drawSignature";
import { drawTwoColumnSection } from "./helpers/e-app/drawTwoColumnSection";
import { photoMock } from "../../mocks/photoMock.mock";
import { renderPackageDetail } from "./helpers/e-app/renderPackageDetail";
import { eappRemark } from "../../mocks/eapp-remark";
import { renderRemarkEApp } from "./helpers/e-app/renderRemarkEApp";
import { drawDivider } from "./helpers/common/drawDivider";
import { drawPageNumbers } from "./helpers/common/drawPageNumber";
import { renderTcEAppNew } from "./helpers/e-app/renderTcEAppNew";
import { renderTcEAppExisting } from "./helpers/e-app/renderTcEAppExisting";

export async function generateStyledEAppPdf(
  data: PdfEAppData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 10,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));

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

      const CARD_SIGN_SECTION_HEIGHT = 180;

      /* -------------------------
         LANGUAGE LOOP
      ------------------------- */

      const langs: ("TH" | "EN")[] = ["TH", "EN"];

      langs.forEach((lang, index) => {
        if (index !== 0) {
          doc.addPage();
        }

        const label = lang === "EN" ? E_APP_LABEL_EN : E_APP_LABEL_TH;
        const pdfData = lang === "EN" ? data.enData : data.thData;

        let y = margin;

        /* -------------------------
           HELPER FUNCTIONS
        ------------------------- */

        const drawMainHeader = (startY: number): number => {
          doc
            .font("regular")
            .fontSize(9)
            .fillColor(PDF_COLORS.GRAY)
            .text(label.COMPANY_INFO, margin, startY, {
              width: contentWidth,
              lineGap: 2,
            });

          const headerY = startY + 15;

          return drawHeader({
            doc,
            y: headerY,
            margin,
            pageWidth,
            title: label.EAPP_MAIN_TITLE,
          });
        };

        const ensureSpace = (height: number) => {
          if (y + height > pageHeight - margin) {
            doc.addPage();
            y = drawMainHeader(margin);
          }
        };

        /* -------------------------
           MAIN HEADER
        ------------------------- */

        y = drawMainHeader(y);

        /* -------------------------
           CUSTOMER INFO
        ------------------------- */

        y = drawCustomerInfoEApp({
          doc,
          y,
          margin,
          contentWidth,
          customerType: data.customerType,
          pdfData,
          label,
          ensureSpace,
        });

        /* -------------------------
           ADDRESS & STATEMENT
        ------------------------- */

        y = drawTwoColumnSection({
          doc,
          y,
          margin,
          contentWidth,
          leftRatio: 0.5,
          rightRatio: 0.5,

          drawLeft: (x, y, width) =>
            drawAddressInstallSection({
              doc,
              y,
              margin: x,
              contentWidth: width,
              pdfData,
              label,
            }),

          drawRight: (x, y, width) =>
            drawStatementSection({
              doc,
              y,
              margin: x,
              contentWidth: width,
              customerType: data.customerType,
              pdfData,
              label,
            }),
        });

        /* -------------------------
           PACKAGE DETAIL
        ------------------------- */

        y = renderPackageDetail({
          doc,
          y,
          margin,
          contentWidth,
          pdfData,
          label,
        });

        y -= 10;
        doc.y = y;

        /* -------------------------
           NOTE
        ------------------------- */

        y = drawRemark({
          doc,
          y,
          margin,
          contentWidth,
          label: label.REMARKS,
          ensureSpace,
        });

        y += 10;

        /* -------------------------
           REMARK
        ------------------------- */

        y = renderRemarkEApp({
          doc,
          html: eappRemark,
          y,
          margin,
          pageWidth,
          pageHeight,
          drawHeader: drawMainHeader,
        });

        if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
          /* -------------------------
           DIVIDER
        ------------------------- */

          y = drawDivider({
            doc,
            y,
            margin,
            contentWidth,
          });

          /* -------------------------
           CONSENT
        ------------------------- */

          y = drawRemark({
            doc,
            y,
            margin,
            contentWidth,
            label: label.CONSENT,
            fontSize: 11,
            topSpacing: 10,
            ensureSpace,
          });

          y += 20;
        }

        /* -------------------------
           CARD + SIGNATURE
        ------------------------- */

        if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
          y = drawTwoColumnSection({
            doc,
            y,
            margin,
            contentWidth,

            leftRatio: 0.6,
            rightRatio: 0.4,
            height: CARD_SIGN_SECTION_HEIGHT,

            drawLeft: (x, y, width) =>
              drawCardBox({
                doc,
                y,
                margin: x,
                contentWidth: width,
                height: CARD_SIGN_SECTION_HEIGHT,
                title: `${label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO} ${pdfData.customerInfo.idCardNo}`,
                imageBase64: data.cardImage,
              }),

            drawRight: (x, y, width) =>
              drawSignatureSection({
                doc,
                y,
                margin: x,
                contentWidth: width,
                height: CARD_SIGN_SECTION_HEIGHT,
                title: label.SIGNATURE_LABEL,
                date: pdfData.registerDate,
                signatureBase64: data.signatureImage,
              }),
          });
        }

        y += 20;

        /* -------------------------
              TERMS PAGE
        ------------------------- */

        doc.addPage();
        y = drawMainHeader(margin);
        doc.y = y;

        y += 10;

        if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
          y = renderTcEAppNew({
            doc,
            html: pdfData.termsAndConditions,
            y,
            margin,
            pageWidth,
            pageHeight,
            drawHeader: drawMainHeader,
          });
        } else {
          y = renderTcEAppExisting({
            doc,
            html: pdfData.termsAndConditions,
            y,
            margin,
            pageWidth,
            pageHeight,
            drawHeader: drawMainHeader,
          });
        }

        if (data.customerType === CUSTOMER_TYPE.NEW_REGISTER) {
          y = drawTwoColumnSection({
            doc,
            y,
            margin,
            contentWidth,

            leftRatio: 0.6,
            rightRatio: 0.4,
            height: CARD_SIGN_SECTION_HEIGHT - 30,

            drawLeft: (y) => y,
            drawRight: (x, y, width) =>
              drawSignatureSection({
                doc,
                y,
                margin: x,
                contentWidth: width,
                height: CARD_SIGN_SECTION_HEIGHT - 30,
                title: label.SIGNATURE_LABEL,
                date: pdfData.registerDate,
                signatureBase64: photoMock.signaturePhoto,
              }),
          });
        }
      });

      /* -------------------------
         PAGE NUMBER
      ------------------------- */

      drawPageNumbers(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
