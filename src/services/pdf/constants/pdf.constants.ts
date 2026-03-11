export const PDF_COLORS = {
  GREEN: "#6D9C35",
  BORDER: "#6D9C35",
  GRAY: "#666666",
  WHITE: "#FFFFFF",
  GRAY_LIGHT: "#808080",
  LINK: "#0000EE",
};

export enum CUSTOMER_TYPE {
  EXISTING = "EXISTING",
  NEW_REGISTER = "NEW_REGISTER",
};

export const FONT_SIZE = 11;
export const HEADER_SPACING = 10;

export enum REGISTER_TYPE {
  ID_CARD = "ID_CARD", // บัตรประชาชน
  PASSPORT = "PASSPORT", // หนังสือเดินทาง
  IMMIGRATION = "IMMIGRATION", // บัตรประจำตัวคนซึ่งไม่มีสัญชาติไทย
  CORPORATE = "CORPORATE", // นิติบุคคล
  GOVERNMENT_AGENCY = "GOVERNMENT_AGENCY", // หน่วยงานราชการ
}
