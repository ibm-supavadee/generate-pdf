import { generateStyledEAppPdf } from "./pdf/generateStyledEAppPdf";

export class PdfService {
  async generateEApplicationPdf(data: any) {
    return generateStyledEAppPdf(data);
  }
}

export const pdfService = new PdfService();
