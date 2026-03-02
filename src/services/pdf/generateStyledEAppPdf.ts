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
  const GREEN = "#6D9C35";
  const BORDER = "#6D9C35";
  const GRAY = "#666666";

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

      const margin = 30;
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
        green: GREEN,
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
        ensureSpace,
        green: GREEN,
        gray: GRAY,
        options: { withDivider: true },
      });

      y = drawCustomerInfo({
        doc,
        y,
        margin,
        contentWidth,
        data,
        ensureSpace,
        green: GREEN,
        gray: GRAY,
      });

      y += 25;

      /* -------------------------
         PACKAGES
      ------------------------- */

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: "สรุปรายการแพ็กเกจที่เลือก",
        ensureSpace,
        green: GREEN,
        gray: GRAY,
        options: { withDivider: true },
      });

      y = drawPackages({
        doc,
        y,
        margin,
        contentWidth,
        data,
        green: GREEN,
        gray: GRAY,
        border: BORDER,
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
        ensureSpace,
        green: GREEN,
        gray: GRAY,
        options: { fullWidth: true },
      });

      y = drawExpenseTable({
        doc,
        y,
        margin,
        contentWidth,
        pageHeight,
        green: GREEN,
        gray: GRAY,
        border: BORDER,
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
        gray: GRAY,
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
        green: GREEN,
        title: "ข้อตกลงและเงื่อนไขบริการ",
      });

      renderHtmlToPdfKit(doc, termAndConERequestMock, {
        margin,
        pageWidth,
        pageHeight,
        ensureSpace,
        startY: y,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
