import { Request, Response } from "express";
import { PdfService } from "../services/pdf/pdf.service";
import { PdfERequestData } from "../services/pdf/models/pdf-erequest-data.model";
import { termAndConERequestExistingMock } from "../mocks/termAndConERequestExisting.mock";
import { termAndConERequestNewRegisterMock } from "../mocks/termAndConERequestNewRegister.mock";
import { CUSTOMER_TYPE } from "../services/pdf/constants/pdf.constants";

export const createERequestPdf = async (req: Request, res: Response) => {
  try {
    const data = req.body as PdfERequestData;

    //TEMP for T&C
    const termsHtml =
            data.customerType === CUSTOMER_TYPE.EXISTING
              ? termAndConERequestExistingMock
              : termAndConERequestNewRegisterMock;
    data.termsAndConditions = termsHtml;

    // console.log("Received data for PDF generation:", data);
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
