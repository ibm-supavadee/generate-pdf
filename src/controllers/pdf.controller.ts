import { Request, Response } from "express";
import { PdfService } from "../services/pdf/pdf.service";
import { PdfERequestData } from "../services/pdf/models/pdf-erequest-data.model";

export const createERequestPdf = async (req: Request, res: Response) => {
  try {
    const data = req.body as PdfERequestData;

    const base64Pdf = await PdfService.generateERequestPdf(data);

    res.json({
      success: true,
      pdfBase64: base64Pdf,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
};
