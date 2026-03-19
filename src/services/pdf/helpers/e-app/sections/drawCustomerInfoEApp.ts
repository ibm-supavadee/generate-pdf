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
  /* -------------------------
      HEADER
  ------------------------- */
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

  const { customerInfo } = pdfData;

  const isNew = customerType === CUSTOMER_TYPE.NEW_REGISTER;

  /* -------------------------
      HELPERS (map-based)
  ------------------------- */
  const nameTitleMap: Partial<Record<REGISTER_TYPE, string>> = {
    [REGISTER_TYPE.CORPORATE]: label.CUSTOMER_INFO.CORPORATE_NAME,
    [REGISTER_TYPE.GOVERNMENT_AGENCY]:
      label.CUSTOMER_INFO.GOVERNMENT_AGENCY_NAME,
  };

  const idCardTitleMap: Partial<Record<REGISTER_TYPE, string>> = {
    [REGISTER_TYPE.PASSPORT]: label.ID_CARD_TITLE.PASSPORT,
    [REGISTER_TYPE.IMMIGRATION]: label.ID_CARD_TITLE.IMMIGRATION,
    [REGISTER_TYPE.CORPORATE]: label.ID_CARD_TITLE.CORPORATE,
    [REGISTER_TYPE.GOVERNMENT_AGENCY]: label.ID_CARD_TITLE.GOVERNMENT_AGENCY,
  };

  const nameTitle =
    nameTitleMap[customerInfo.registerType as REGISTER_TYPE] ??
    label.CUSTOMER_INFO.NAME;

  const idCardTitle =
    idCardTitleMap[customerInfo.registerType as REGISTER_TYPE] ??
    label.ID_CARD_TITLE.ID_CARD;

  const isCorporate = customerInfo.registerType === REGISTER_TYPE.CORPORATE;

  /* -------------------------
      ROW BUILDERS
  ------------------------- */
  const buildBaseRow = (): Row => [
    nameTitle,
    customerInfo.name,
    label.CUSTOMER_INFO.MOBILE_NO,
    customerInfo.mobileNo,
  ];

  const buildSecondRow = (): Row =>
    isNew
      ? [
          idCardTitle,
          customerInfo.idCardNo,
          label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
          customerInfo.otherTelephoneNo,
        ]
      : [
          isCorporate ? label.CUSTOMER_INFO.CONTACT_PERSON_NAME : "",
          isCorporate ? customerInfo.repName : "",
          label.CUSTOMER_INFO.OTHER_TELEPHONE_NO,
          customerInfo.otherTelephoneNo,
        ];

  const buildCorporateRow = (): Row => [
    label.CUSTOMER_INFO.CONTACT_PERSON_NAME,
    customerInfo.repName,
    "",
    "",
  ];

  /* -------------------------
      BUILD ROWS
  ------------------------- */
  const rows: Row[] = [buildBaseRow(), buildSecondRow()];

  if (isNew && isCorporate) {
    rows.push(buildCorporateRow());
  }

  /* -------------------------
      RENDER
  ------------------------- */
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
