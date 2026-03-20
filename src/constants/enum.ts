import { E_APP_LABEL_EN } from "../services/pdf/constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../services/pdf/constants/e-app/e-app-label-th.constant";

export enum LANG {
  TH = "TH",
  EN = "EN",
}

export enum PRODUCT_OWNER {
  FBB = "FBB",
  THREEBB = "3BB",
}

export enum DISPLAY_SECTION {
  CONSENT_PAGE = "CONSENT_PAGE",
  E_APP = "E_APP",
  E_REQUEST = "E_REQUEST",
}

export enum CUSTOMER_TYPE {
  EXISTING = "EXISTING",
  NEW_REGISTER = "NEW_REGISTER",
}

export enum REGISTER_TYPE {
  ID_CARD = "ID_CARD", // บัตรประชาชน
  PASSPORT = "PASSPORT", // หนังสือเดินทาง
  IMMIGRATION = "IMMIGRATION", // บัตรประจำตัวคนซึ่งไม่มีสัญชาติไทย
  CORPORATE = "CORPORATE", // นิติบุคคล
  GOVERNMENT_AGENCY = "GOVERNMENT_AGENCY", // หน่วยงานราชการ
}

export type EAPP_LABEL_TYPE = typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
