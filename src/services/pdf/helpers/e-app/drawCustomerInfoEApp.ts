import { E_APP_LABEL_EN } from "../../constants/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../constants/e-app-label-th.constant";
import {
  CUSTOMER_TYPE,
  HEADER_SPACING,
  REGISTER_TYPE,
} from "../../constants/pdf.constants";
import { PdfEAppData } from "../../models/pdf-eapp-data.model";
import { drawCustomerInfoRows } from "../common/drawCustomerInfoRow";
import { drawSectionHeader } from "../common/drawSectionHeader";

type Row = [string?, string?, string?, string?];

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: PdfEAppData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  ensureSpace: (height: number) => void;
};

export function drawCustomerInfoEApp({
  doc,
  y,
  margin,
  contentWidth,
  data,
  label,
  ensureSpace,
}: Params): number {
  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.DATA_OF_SUBSCRIBER_TITLE,
    options: { withDivider: true, isShowDate: true },
  });

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
    data.customerType === CUSTOMER_TYPE.NEW_REGISTER
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
