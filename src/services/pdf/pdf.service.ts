import { generateStyledERequestPdf } from "./helpers/generateStyledERequestPdf";

export class PdfService {
  async generateEApplicationPdf(data: any) {
    return generateStyledERequestPdf(data);
  }
}

export const pdfService = new PdfService();
