import { Request, Response } from 'express';
import { generateStyledPlayboxPdf } from '../services/pdf.service';

export const createPdf = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const base64Pdf = await generateStyledPlayboxPdf(data);

    res.json({
      success: true,
      pdfBase64: base64Pdf,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
    });
  }
};