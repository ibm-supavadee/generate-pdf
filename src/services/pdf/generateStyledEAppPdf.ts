import { Buffer } from "buffer";
import { PdfEAppData } from "./models/pdf-eapp-data.model";
import { drawPageNumbers } from "./helpers/shared/drawPageNumber";
import { drawMainEAppPage } from "./helpers/e-app/page/drawMainEAppPage";
import { createPdfDocument } from "./helpers/core/createPdfDocument";

type Lang = "TH" | "EN";

export async function generateStyledEAppPdf(
  data: PdfEAppData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const { doc, getBase64 } = createPdfDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));

      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdf.toString("base64")}`);
      });

      const langs: Lang[] = ["TH", "EN"];

      langs.forEach((lang, langIndex) => {
        /* =========================
            MAIN PAGE
        ========================= */
        if (langIndex !== 0) doc.addPage();

        drawMainEAppPage({ doc, data, lang });
      });

      drawPageNumbers(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
