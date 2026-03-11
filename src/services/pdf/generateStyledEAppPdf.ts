import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";

import { FONT_SIZE } from "./constants/pdf.constants";
import { E_APP_LABEL_EN } from "./constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "./constants/e-app-label-th.constant";
import { drawHeader } from "./helpers/drawHeader";
import { drawSectionHeader } from "./helpers/drawSectionHeader";
import { drawCustomerInfoEApp } from "./helpers/drawCustomerInfo/drawCustomerInfoEApp";
import { PdfEAppData } from "./models/pdf-eapp-data.model";

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
