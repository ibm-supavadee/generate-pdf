import { PRODUCT_OWNER } from "../../../constants/enum";
import { CUSTOMER_TYPE } from "../constants/pdf.constants";

export class PdfEAppData {
  customerType: CUSTOMER_TYPE = CUSTOMER_TYPE.NEW_REGISTER;
  productOwner: PRODUCT_OWNER = PRODUCT_OWNER.FBB;
  thData: PdfData = new PdfData();
  enData: PdfData = new PdfData();
  cardImage?: string = "";
  signatureImage?: string = "";
}

export class PdfData {
  customerInfo: CustomerInfo = new CustomerInfo();
  mainPackageSection?: Section = new Section();
  onTopDetailSection?: Section[] = [];
  registerDate: string = ""; //"13 มี.ค. 2569" or "13 March 2026"
  remark: string = "";
  termsAndConditions: string ="";
}

export class CustomerInfo {
  registerType: string = "";
  idCardNo?: string = "";
  name: string = "";
  repName?: string = "";
  mobileNo: string = "";
  otherTelephoneNo: string = "";
  installAddress: string = "";
  billingChannel?: string = "";
  documentDeliveryAddress: string = "";
}

export class Section {
  title: string = "";
  description?: string = "";
  details: Detail[] = [];
}

export class Detail {
  text: string = "";
  price?: number = 0;
  isDiscount?: boolean = false;
  list?: Detail[];
}