import PDFDocument, { fontSize } from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";
import {
  FONT_SIZE,
  PDF_COLORS,
  SECTION_GAP_SMALL,
} from "./constants/pdf.constants";
import { E_APP_LABEL_EN } from "./constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "./constants/e-app-label-th.constant";
import { drawSectionHeader } from "./helpers/e-request/drawSectionHeader";
import { drawCustomerInfoEApp } from "./helpers/e-app/drawCustomerInfoEApp";
import { PdfEAppData } from "./models/pdf-eapp-data.model";
import { drawHeader } from "./helpers/common/drawHeader";
import { drawAddressInstall } from "./helpers/e-app/drawAddressInstall";
import { drawStatement } from "./helpers/e-app/drawStatement";
import { drawRemark } from "./helpers/e-request/drawRemark";
import { drawCardBox } from "./helpers/e-app/drawCardBox";
import { drawSignatureSection } from "./helpers/e-app/drawSignature";
import { drawTwoColumnSection } from "./helpers/e-app/drawTwoColumnSection";
import { photoMock } from "../../mocks/photoMock.mock";
import { renderPackageDetail } from "./helpers/e-app/renderPackageDetail";
import { eappRemark } from "../../mocks/eapp-remark";
import { renderRemarkEApp } from "./helpers/e-app/renderRemarkEApp";

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

      const drawMainHeader = (startY: number) => {
        doc
          .font("regular")
          .fontSize(9)
          .fillColor(PDF_COLORS.GRAY)
          .text(label.COMPANY_INFO, margin, startY, {
            width: contentWidth,
            lineGap: 2,
          });

        startY += 15;

        return drawHeader({
          doc,
          y: startY,
          margin,
          pageWidth,
          title: label.EAPP_MAIN_TITLE,
        });
      };

      /* -------------------------
         HEADER
      ------------------------- */
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

      y += SECTION_GAP_SMALL;

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

        drawLeft: (x, y, width) => {
          let newY = drawSectionHeader({
            doc,
            y,
            margin: x,
            contentWidth: width,
            title: label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
            options: { withDivider: true },
          });

          return drawAddressInstall({
            doc,
            y: newY,
            margin: x,
            contentWidth: width,
            data,
            label,
          });
        },

        drawRight: (x, y, width) => {
          let newY = drawSectionHeader({
            doc,
            y,
            margin: x,
            contentWidth: width,
            title: label.STATEMENT_TITLE,
            options: { withDivider: true },
          });

          return drawStatement({
            doc,
            y: newY,
            margin: x,
            contentWidth: width,
            data,
            label,
          });
        },
      });

      y += SECTION_GAP_SMALL;

      /* -------------------------
        REQUEST DETAIL TABLE
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
        options: { fullWidth: true },
      });

      y = renderPackageDetail({
        doc,
        y,
        margin,
        contentWidth,
        data,
        label,
      });

      doc.y = y - 10;

      /* -------------------------
            Note
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
            Remark
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

      /* -------------------------
            LINE
        ------------------------- */

      y = doc.y;
      y += 10;

      doc
        .moveTo(margin, y)
        .lineTo(margin + contentWidth, y)
        .strokeColor(PDF_COLORS.GREEN)
        .lineWidth(1)
        .stroke();

      doc.y = y;
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

      /* -------------------------
        CARD + SIGNATURE 
      ------------------------- */
      y =
        drawTwoColumnSection({
          doc,
          y,
          margin,
          contentWidth,

          leftRatio: 0.6,
          rightRatio: 0.4,
          height: 200,

          drawLeft: (x, y, width) => {
            return drawCardBox({
              doc,
              y,
              margin: x,
              contentWidth: width,
              height: 180,
              title: `${label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO} ${data.customerInfo.idCardNo}`,
              imageBase64: photoMock.idCardDocument,
            });
          },

          drawRight: (x, y, width) => {
            return drawSignatureSection({
              doc,
              y,
              margin: x,
              contentWidth: width,
              height: 180,
              title: label.SIGNATURE_LABEL,
              date: data.registerDate,
              data,
              signatureBase64: photoMock.signaturePhoto,
            });
          },
        }) + 20;

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
