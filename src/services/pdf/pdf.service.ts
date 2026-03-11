import { generateStyledEAppPdf } from "./generateStyledEAppPdf";
import { generateStyledERequestPdf } from "./generateStyledERequestPdf";

export class PdfService {
  public static async generateERequestPdf(data: any) {
    return generateStyledERequestPdf(data);
  }

   public static async generateEAppPdf(data: any) {
    return generateStyledEAppPdf(data);
  }
}
