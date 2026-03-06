import { generateStyledERequestPdf } from "./generateStyledERequestPdf";

export class PdfService {
  static async generateERequestPdf(data: any) {
    return generateStyledERequestPdf(data);
  }
}
