import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../../../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../../../assets/fonts/db_helvethaica_ais_x_bd_v3";
import { FONT_SIZE } from "../../constants/pdf.constants";

/* -----------------------------
   TYPES
----------------------------- */

type CreateDocumentResult = {
  doc: PDFKit.PDFDocument;
  getBase64: () => Promise<string>;
};

/* -----------------------------
   CREATE DOCUMENT
----------------------------- */

export function createPdfDocument(): CreateDocumentResult {
  const doc = new PDFDocument({
    size: "A4",
    margin: 10,
    bufferPages: true,
  });

  const buffers: Buffer[] = [];

  /* collect stream */
  doc.on("data", (chunk) => buffers.push(chunk));

  /* register fonts */
  doc.registerFont("regular", Buffer.from(dbHelvethaicaAisXV3, "base64"));
  doc.registerFont("bold", Buffer.from(dbHelvethaicaAisXBdV3, "base64"));

  /* default font */
  doc.font("regular").fontSize(FONT_SIZE);

  /* return base64 */
  const getBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdf.toString("base64")}`);
      });
    });
  };

  return { doc, getBase64 };
}
