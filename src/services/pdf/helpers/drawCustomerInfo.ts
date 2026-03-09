import { PdfERequestData } from "../models/pdf-erequest-data.model";
import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  PDF_COLORS,
} from "../constants/pdf.constants";
import { E_REQUEST_LABEL_TH } from "../constants/e-request-label-th.constant";
import { E_REQUEST_LABEL_EN } from "../constants/e-request-label-en.constant";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfERequestData;
  label: typeof E_REQUEST_LABEL_EN | typeof E_REQUEST_LABEL_TH;
  ensureSpace: (height: number) => void;
};

type Row = [string, string?, string?, string?];

export function drawCustomerInfo({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
  ensureSpace,
}: Params): number {
  y += HEADER_SPACING;

  const customerInfo = data.customerInfo;

  const leftLabelX = margin;
  const leftValueX = margin + 110;

  const rightLabelX = margin + contentWidth / 2;
  const rightValueX = rightLabelX + 120;

  const rowSpacing = 18;

  const rows: Row[] =
    data.customerType === CUSTOMER_TYPE.EXISTING
      ? [
          [
            label.CUSTOMER_INFO.NAME,
            customerInfo.name,
            label.CUSTOMER_INFO.MOBILE_NO,
            customerInfo.mobileNo,
          ],
          [
            label.CUSTOMER_INFO.EMAIL,
            customerInfo.email,
            label.CUSTOMER_INFO.DOCUMENT_DELIVERY_ADDRESS,
            customerInfo.billingAddress,
          ],
          [label.CUSTOMER_INFO.INSTALLATION_DATE, customerInfo.installDateTime],
          [
            label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
            customerInfo.installLocation,
          ],
        ]
      : [
          [
            label.CUSTOMER_INFO.NAME,
            customerInfo.name,
            label.CUSTOMER_INFO.MOBILE_NO,
            customerInfo.mobileNo,
          ],
          [
            label.CUSTOMER_INFO.EMAIL,
            customerInfo.email,
            label.CUSTOMER_INFO.BILLING_CHANNEL,
            customerInfo.invoiceChannel,
          ],
          [
            label.CUSTOMER_INFO.INSTALLATION_DATE,
            customerInfo.installDateTime,
            label.CUSTOMER_INFO.ALTERNATIVE_INSTALLATION_DATE,
            customerInfo.backUpInstallDateTime,
          ],
          [
            label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
            customerInfo.installLocation,
            label.CUSTOMER_INFO.DOCUMENT_DELIVERY_ADDRESS,
            customerInfo.billingAddress,
          ],
        ];

  const drawField = (
    label: string | undefined,
    value: string | undefined,
    labelX: number,
    valueX: number,
  ) => {
    if (!label) return;

    doc.font("bold").fillColor(PDF_COLORS.GRAY).text(label, labelX, y);

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GREEN)
      .text(value || "", valueX, y, { width: 160 });
  };

  rows.forEach(([lLabel, lValue, rLabel, rValue]) => {
    ensureSpace(rowSpacing);

    drawField(lLabel, lValue, leftLabelX, leftValueX);
    drawField(rLabel, rValue, rightLabelX, rightValueX);

    y += rowSpacing;
  });

  return y;
}
