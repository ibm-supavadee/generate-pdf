import { generateStyledERequestPdf } from "./generateStyledERequestPdf";

export class PdfService {
  public static async generateERequestPdf(data: any) {
    return generateStyledERequestPdf(data);
  }
}
