import { generateStyledERequestPdf } from "./generateStyledERequestPdf";

export class PdfService {
  async generateEApplicationPdf(data: any) {
    return generateStyledERequestPdf(data);
  }
}

export const pdfService = new PdfService();
