import { Request, Response } from "express";
import { PdfService } from "../services/pdf/pdf.service";
import { PdfERequestData } from "../services/pdf/models/pdf-erequest-data.model";
import { termAndConERequestExistingMock } from "../mocks/e-request/termAndConERequestExisting.mock";
import { termAndConERequestNewRegisterMock } from "../mocks/e-request/termAndConERequestNewRegister.mock";
import { CUSTOMER_TYPE } from "../services/pdf/constants/pdf.constants";
import { termAndConERequestExistingENMock } from "../mocks/e-request/termAndConERequestExistingEN.mock";
import { termAndConERequestNewRegisterENMock } from "../mocks/e-request/termAndConERequestNewRegisterEN.mock";
import { PdfEAppData } from "../services/pdf/models/pdf-eapp-data.model";
import { termAndConEAppNewRegisterENMock } from "../mocks/e-app/termAndConEAppNewRegisterEN.mock";
import { termAndConEAppNewRegisterTHMock } from "../mocks/e-app/termAndConEAppNewRegisterTH.mock";
import { termAndConEAppExistingTHMock } from "../mocks/e-app/termAndConEAppExistingTH.mock";
import { termAndConEAppExistingENMock } from "../mocks/e-app/termAndConEAppExistingEN.mock";
import { photoMock } from "../mocks/e-app/photoMock.mock";
import { remarkEAppTH } from "../mocks/e-app/remarkEAppTH";
import { remarkEAppEN } from "../mocks/e-app/remarkEAppEN";

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

    // TEMP for remark
    data.thData.remark = remarkEAppTH;
    data.enData.remark = remarkEAppEN;

    // TEMP for Base64 image in PDF
    data.signatureImage = photoMock.signaturePhoto;
    data.cardImage = photoMock.idCardDocument;

    // TEMP for T&C
    const textTermAndConditionsTH = [
      ...termAndConEAppExistingTHMock.packageInfo,
      ...termAndConEAppExistingTHMock.remark,
    ].join(" ");

    const textTermAndConditionsEN = [
      ...termAndConEAppExistingENMock.packageInfo,
      ...termAndConEAppExistingENMock.remark,
    ].join(" ");

    if (data.customerType === CUSTOMER_TYPE.EXISTING) {
      data.thData.termsAndConditions = textTermAndConditionsTH;
      data.enData.termsAndConditions = textTermAndConditionsEN;
    } else {
      data.thData.termsAndConditions = termAndConEAppNewRegisterTHMock;
      data.enData.termsAndConditions = termAndConEAppNewRegisterENMock;
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
