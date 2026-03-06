import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

import { drawHeader } from "./helpers/drawHeader";
import { drawSectionHeader } from "./helpers/drawSectionHeader";
import { drawCustomerInfo } from "./helpers/drawCustomerInfo";
import { drawPackages } from "./helpers/drawPackages";
import { drawRemark } from "./helpers/drawRemark";
import { renderHtmlToPdfKit } from "./helpers/renderHtmlToPdfKit";

import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";

import { PdfERequestData } from "./models/pdf-erequest-data.model";
import { renderExpenseTable } from "./helpers/renderExpenseTable";
import { E_REQUEST_LABEL_EN } from "./constants/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "./constants/e-request-label-th.constant";
import { renderTcExisting } from "./helpers/renderTcExisting";
import { termAndConERequestExistingMock } from "../../mocks/termAndConERequestExisting.mock";

export async function generateStyledERequestPdf(
  data: PdfERequestData,
): Promise<string> {

  const label =  (data.lang === "EN")? E_REQUEST_LABEL_EN : E_REQUEST_LABEL_TH;

  return new Promise((resolve, reject) => {
    try {
      /* -------------------------
         INIT DOCUMENT
      ------------------------- */

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

      doc.font("regular").fontSize(11);

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

      /* -------------------------
           HEADER
        ------------------------- */

      y = drawHeader({
        doc,
        y,
        margin,
        pageWidth,
        title: "สรุปข้อมูลสมัครบริการ",
      });

      /* -------------------------
           CUSTOMER INFO
        ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: "ข้อมูลผู้สมัคร",
        options: { withDivider: true },
      });

      y = drawCustomerInfo({
        doc,
        y,
        margin,
        contentWidth,
        data,
        type: "new",
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
        title: "สรุปรายการแพ็กเกจที่เลือก",
        options: { withDivider: true },
      });

      y = drawPackages({
        doc,
        y,
        margin,
        contentWidth,
        data,
        label,
      });

      /* -------------------------
           EXPENSE TABLE
        ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: "รายละเอียดค่าใช้จ่าย",
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

          newY = drawHeader({
            doc,
            y: newY,
            margin,
            pageWidth,
            title: "สรุปข้อมูลสมัครบริการ",
          });

          newY = drawSectionHeader({
            doc,
            y: newY,
            margin,
            contentWidth,
            title: "รายละเอียดค่าใช้จ่าย",
            options: { withDivider: true },
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
        ensureSpace,
      });

      /* -------------------------
         TERMS PAGE
      ------------------------- */

      doc.addPage();

      y = drawHeader({
        doc,
        y: margin,
        margin,
        pageWidth,
        title: "ข้อตกลงและเงื่อนไขบริการ",
      });

      // renderHtmlToPdfKit(doc, data.termsAndConditions, {
      //   margin,
      //   pageWidth,
      //   pageHeight,
      //   startY: y,
      //   drawHeader: (startY) =>
      //     drawHeader({
      //       doc,
      //       y: startY,
      //       margin,
      //       pageWidth,
      //       title: "ข้อตกลงและเงื่อนไขบริการ",
      //     }),
      // });

      y = renderTcExisting({
        doc,
        html: termAndConERequestExistingMock,
        y,
        margin,
        pageWidth,
        pageHeight,
        drawHeader: (startY) =>
          drawHeader({
            doc,
            y: startY,
            margin,
            pageWidth,
            title: "ข้อตกลงและเงื่อนไขบริการ",
          }),
      });
      
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
