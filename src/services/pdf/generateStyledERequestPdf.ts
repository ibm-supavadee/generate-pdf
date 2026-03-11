import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";

import { PdfERequestData } from "./models/pdf-erequest-data.model";
import { E_REQUEST_LABEL_EN } from "./constants/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "./constants/e-request-label-th.constant";

import { CUSTOMER_TYPE, FONT_SIZE } from "./constants/pdf.constants";
import { drawHeader } from "./helpers/drawHeader";
import { drawSectionHeader } from "./helpers/drawSectionHeader";
import { drawPackages } from "./helpers/drawPackages";
import { renderExpenseTable } from "./helpers/renderExpenseTable";
import { renderTcNew } from "./helpers/renderTcNew";
import { drawRemark } from "./helpers/drawRemark";
import { renderTcExisting } from "./helpers/renderTcExisting";
import { drawCustomerInfoERequest } from "./helpers/drawCustomerInfo/drawCustomerInfoERequest";

export async function generateStyledERequestPdf(
  data: PdfERequestData,
): Promise<string> {
  const label = data.lang === "EN" ? E_REQUEST_LABEL_EN : E_REQUEST_LABEL_TH;

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
          title: label.SUMMARY_SELECTED_PACKAGE,
        });

      const drawTermsHeader = (startY: number) =>
        drawHeader({
          doc,
          y: startY,
          margin,
          pageWidth,
          title: label.TERMS_AND_CONDITIONS_OF_SERVICE,
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
        title: label.DATA_OF_SUBSCRIBER,
        options: { withDivider: true },
      });

      y = drawCustomerInfoERequest({
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
         PACKAGES
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.SUMMARY_SELECTED_PACKAGE,
        options: { withDivider: true },
      });

      y = drawPackages({
        doc,
        y,
        margin,
        contentWidth,
        data,
        label,
        fields: {
          mainLabel: "MAIN_PACKAGE",
          onTopLabel: "ON_TOP_PACKAGE",
          mainData: "mainPackages",
          onTopData: "onTopPackages",
        },
      });

      /* -------------------------
         EXPENSE TABLE
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.DETAIL_CHARGES,
        options: { fullWidth: true },
      });

      y = renderExpenseTable({
        doc,
        y,
        margin,
        contentWidth,
        pageHeight,
        data,
        label,
        drawPageHeader: () => {
          let newY = margin;

          newY = drawMainHeader(newY);

          newY = drawSectionHeader({
            doc,
            y: newY,
            margin,
            contentWidth,
            title: label.DETAIL_CHARGES,
            options: { fullWidth: true },
          });

          return newY;
        },
      });

      /* -------------------------
         REMARK
      ------------------------- */

      y = drawRemark({
        doc,
        y,
        margin,
        contentWidth,
        label,
        ensureSpace,
      });

      /* -------------------------
         TERMS PAGE
      ------------------------- */

      doc.addPage();

      y = drawTermsHeader(margin);

      const termsHtml = data.termsAndConditions;

      if (data.customerType === CUSTOMER_TYPE.EXISTING) {
        y = renderTcExisting({
          doc,
          html: termsHtml,
          y,
          margin,
          pageWidth,
          pageHeight,
          drawHeader: drawTermsHeader,
        });
      } else {
        renderTcNew(doc, termsHtml, {
          margin,
          pageWidth,
          pageHeight,
          startY: y,
          drawHeader: drawTermsHeader,
        });
      }

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
