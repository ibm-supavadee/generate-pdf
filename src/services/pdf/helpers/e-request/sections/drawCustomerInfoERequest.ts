import { E_REQUEST_LABEL_EN } from "../../../constants/e-request/e-request-label-en.constant";
import { E_REQUEST_LABEL_TH } from "../../../constants/e-request/e-request-label-th.constant";
import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  REGISTER_TYPE,
} from "../../../constants/pdf.constants";
import { PdfERequestData } from "../../../models/pdf-erequest-data.model";
import { drawCustomerInfoRows } from "../../shared/drawCustomerInfoRow";

type Row = [string?, string?, string?, string?];

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfERequestData;
  label: typeof E_REQUEST_LABEL_EN | typeof E_REQUEST_LABEL_TH;
  ensureSpace: (height: number) => void;
};

export function drawCustomerInfoERequest({
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

  const nameTitle =
    customerInfo.registerType === REGISTER_TYPE.CORPORATE
      ? label.CUSTOMER_INFO.CORPORATE_NAME
      : customerInfo.registerType === REGISTER_TYPE.GOVERNMENT_AGENCY
        ? label.CUSTOMER_INFO.GOVERNMENT_AGENCY_NAME
        : label.CUSTOMER_INFO.NAME;

  const baseRow: Row = [
    nameTitle,
    customerInfo.name,
    label.CUSTOMER_INFO.MOBILE_NO,
    customerInfo.mobileNo,
  ];

  const rows: Row[] =
    data.customerType === CUSTOMER_TYPE.EXISTING
      ? [
          baseRow,
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
          baseRow,
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

  return drawCustomerInfoRows({
    doc,
    y,
    rows,
    ensureSpace,
    leftLabelX: margin,
    leftValueX: margin + 130,
    rightLabelX: margin + contentWidth / 2,
    rightValueX: margin + contentWidth / 2 + 120,
  });
}
