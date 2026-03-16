import { Request, Response } from "express";
import { PdfService } from "../services/pdf/pdf.service";
import { PdfERequestData } from "../services/pdf/models/pdf-erequest-data.model";
import { termAndConERequestExistingMock } from "../mocks/termAndConERequestExisting.mock";
import { termAndConERequestNewRegisterMock } from "../mocks/termAndConERequestNewRegister.mock";
import { CUSTOMER_TYPE } from "../services/pdf/constants/pdf.constants";
import { termAndConERequestExistingENMock } from "../mocks/termAndConERequestExistingEN.mock";
import { termAndConERequestNewRegisterENMock } from "../mocks/termAndConERequestNewRegisterEN.mock";
import { PdfEAppData } from "../services/pdf/models/pdf-eapp-data.model";
import { termAndConEAppNewRegisterENMock } from "../mocks/termAndConEAppNewRegisterEN.mock";
import { termAndConEAppNewRegisterTHMock } from "../mocks/termAndConEAppNewRegisterTH.mock";
import { termAndConEAppExistingTHMock } from "../mocks/termAndConEAppExistingTH.mock";
import { termAndConEAppExistingENMock } from "../mocks/termAndConEAppExistingEN.mock";

export const createERequestPdf = async (req: Request, res: Response) => {
  try {
    const data = req.body as PdfERequestData;

    // TEMP for T&C
    let termsHtml = "";

    if (data.customerType === CUSTOMER_TYPE.EXISTING) {
      termsHtml =
        data.lang === "EN"
          ? termAndConERequestExistingENMock
          : termAndConERequestExistingMock;
    } else {
      termsHtml =
        data.lang === "EN"
          ? termAndConERequestNewRegisterENMock
          : termAndConERequestNewRegisterMock;
    }

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

export const createEAppPdf = async (req: Request, res: Response) => {
  try {
    const data = req.body as PdfEAppData;

    // TEMP for T&C
    if (data.customerType === CUSTOMER_TYPE.EXISTING) {
      data.termsAndConditionsTH = termAndConEAppExistingTHMock;
      data.termsAndConditionsEN = termAndConEAppExistingENMock;
    } else {
      data.termsAndConditionsTH = termAndConEAppNewRegisterTHMock;
      data.termsAndConditionsEN = termAndConEAppNewRegisterENMock;
    }

    // console.log("Received data for PDF generation:", data);
    const base64Pdf = await PdfService.generateEAppPdf(data);

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
