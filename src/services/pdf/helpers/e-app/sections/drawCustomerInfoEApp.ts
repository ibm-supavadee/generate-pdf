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

  const isCorporate = customerInfo.registerType === REGISTER_TYPE.CORPORATE;
  const isGovernmentAgency =
    customerInfo.registerType === REGISTER_TYPE.GOVERNMENT_AGENCY;
  const isNew = customerType === CUSTOMER_TYPE.NEW_REGISTER;

  const nameTitle = isCorporate
    ? label.CUSTOMER_INFO.CORPORATE_NAME
    : isGovernmentAgency
      ? label.CUSTOMER_INFO.GOVERNMENT_AGENCY_NAME
      : label.CUSTOMER_INFO.NAME;

  const baseRow: Row = [
    nameTitle,
    customerInfo.name,
    label.CUSTOMER_INFO.MOBILE_NO,
    customerInfo.mobileNo,
  ];

  const buildSecondRow = (): Row => {
    if (isNew) {
      return [
        label.CUSTOMER_INFO.ID_CARD_PASSPORT_NO,
        customerInfo.idCardNo,
        label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
        customerInfo.otherTelephoneNo,
      ];
    }

    return [
      isCorporate ? label.CUSTOMER_INFO.CONTACT_PERSON_NAME : "",
      isCorporate ? customerInfo.repName : "",
      label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
      customerInfo.otherTelephoneNo,
    ];
  };

  const rows: Row[] = [baseRow, buildSecondRow()];

  if (isNew && isCorporate) {
    rows.push([
      label.CUSTOMER_INFO.CONTACT_PERSON_NAME,
      customerInfo.repName,
      "",
      "",
    ]);
  }

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
