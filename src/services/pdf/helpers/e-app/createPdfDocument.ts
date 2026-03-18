import PDFDocument from "pdfkit";
import { dbHelvethaicaAisXV3 } from "../../../../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../../../../assets/fonts/db_helvethaica_ais_x_bd_v3";
import { FONT_SIZE } from "../../constants/pdf.constants";

export function createPdfDocument() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 10,
    bufferPages: true,
  });

  doc.registerFont("regular", Buffer.from(dbHelvethaicaAisXV3, "base64"));
  doc.registerFont("bold", Buffer.from(dbHelvethaicaAisXBdV3, "base64"));

  doc.font("regular").fontSize(FONT_SIZE);

  return doc;
}
