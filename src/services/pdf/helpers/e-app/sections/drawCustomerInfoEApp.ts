import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  REGISTER_TYPE,
} from "../../../constants/pdf.constants";
import { PdfData } from "../../../models/pdf-eapp-data.model";
import { drawSectionHeader } from "../../layout/drawSectionHeader";
import { drawCustomerInfoRows } from "../../shared/drawCustomerInfoRow";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";

type Row = [string?, string?, string?, string?];

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  customerType: CUSTOMER_TYPE;
  pdfData: PdfData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  lang: "TH" | "EN";
  ensureSpace: (height: number) => void;
};

export function drawCustomerInfoEApp({
  doc,
  y,
  margin,
  contentWidth,
  customerType,
  pdfData,
  label,
  lang,
  ensureSpace,
}: Params): number {
  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.DATA_OF_SUBSCRIBER_TITLE,
    lang,
    options: { withDivider: true, date: pdfData.registerDate },
  });

  y += HEADER_SPACING;

  const customerInfo = pdfData.customerInfo;

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
    customerType === CUSTOMER_TYPE.NEW_REGISTER
      ? [
          baseRow,
          [
            label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO,
            customerInfo.idCardNo,
            label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
            customerInfo.otherTelephoneNo,
          ],
        ]
      : [
          baseRow,
          [
            "",
            "",
            label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
            customerInfo.otherTelephoneNo,
          ],
        ];

  return drawCustomerInfoRows({
    doc,
    y,
    rows,
    ensureSpace,
    leftLabelX: margin,
    leftValueX: margin + 130,
    rightLabelX: margin + contentWidth / 2 + 10,
    rightValueX: margin + contentWidth / 2 + 120,
  });
}
