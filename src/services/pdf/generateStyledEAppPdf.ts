import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

import { drawHeader } from "./drawHeader";
import { drawSectionHeader } from "./drawSectionHeader";
import { drawCustomerInfo } from "./drawCustomerInfo";
import { drawPackages } from "./drawPackages";
import { drawExpenseTable } from "./drawExpenseTable";
import { drawRemark } from "./drawRemark";
import { renderHtmlToPdfKit } from "./renderHtmlToPdfKit";

import { dbHelvethaicaAisXV3 } from "../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../assets/fonts/db_helvethaica_ais_x_bd_v3";

import { termAndConERequestMock } from "../../mocks/termAndConERequest.mock";

export async function generateStyledEAppPdf(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      /* -------------------------
         INIT DOCUMENT
      ------------------------- */

      const doc = new PDFDocument({
        size: "A4",
        margin: 10,
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

      y = drawExpenseTable({
        doc,
        y,
        margin,
        contentWidth,
        pageHeight,
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

      renderHtmlToPdfKit(doc, termAndConERequestMock, {
        margin,
        pageWidth,
        pageHeight,
        startY: y,
        drawHeader: (startY) =>
          drawHeader({
            doc,
            y: startY,
            margin,
            pageWidth,
            title: "ข้อตกลงและเงื่อนไขบริการ",
          }),
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
