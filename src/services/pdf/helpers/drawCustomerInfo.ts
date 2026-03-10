import { PdfERequestData } from "../models/pdf-erequest-data.model";
import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  PDF_COLORS,
  REGISTER_TYPE,
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
  const leftValueX = margin + 130;

  const rightLabelX = margin + contentWidth / 2;
  const rightValueX = rightLabelX + 120;

  const rowSpacing = 18;

  /* -----------------------------
     GET NAME TITLE
  ----------------------------- */

  const getNameTitle = () => {
    switch (customerInfo.registerType) {
      case REGISTER_TYPE.CORPORATE:
        return label.CUSTOMER_INFO.CORPORATE_NAME;

      case REGISTER_TYPE.GOVERNMENT_AGENCY:
        return label.CUSTOMER_INFO.GOVERNMENT_AGENCY_NAME;

      default:
        return label.CUSTOMER_INFO.NAME;
    }
  };

  const nameTitle = getNameTitle();

  /* -----------------------------
     BUILD ROWS
  ----------------------------- */
  const rows: Row[] =
    data.customerType === CUSTOMER_TYPE.EXISTING
      ? [
          [
            nameTitle,
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
            customerInfo.installAddress,
          ],
        ]
      : [
          [
            nameTitle,
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
            customerInfo.alternativeInstallDate,
          ],
          [
            label.CUSTOMER_INFO.ADDRESS_EQUIPMENT_INSTALLATION,
            customerInfo.installAddress,
            label.CUSTOMER_INFO.DOCUMENT_DELIVERY_ADDRESS,
            customerInfo.billingAddress,
          ],
        ];

  /* -----------------------------
     DRAW FIELD
  ----------------------------- */
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
