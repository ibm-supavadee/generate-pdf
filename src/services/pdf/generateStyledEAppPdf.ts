import { Buffer } from "buffer";
import { PdfEAppData } from "./models/pdf-eapp-data.model";
import { drawPageNumbers } from "./helpers/utils/drawPageNumber";
import { createPdfDocument } from "./helpers/e-app/createPdfDocument";
import { drawLanguagePage } from "./helpers/e-app/page/drawLanguagePage";

export async function generateStyledEAppPdf(
  data: PdfEAppData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = createPdfDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdf.toString("base64")}`);
      });

      const langs: ("TH" | "EN")[] = ["TH", "EN"];

      langs.forEach((lang, index) => {
        if (index !== 0) doc.addPage();
        drawLanguagePage(doc, data, lang);
      });

      drawPageNumbers(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
