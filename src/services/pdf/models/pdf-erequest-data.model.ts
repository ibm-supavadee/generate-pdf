import { CUSTOMER_TYPE, LANG, PRODUCT_OWNER } from "../../../constants/enum";

export class PdfERequestData {
  customerType: CUSTOMER_TYPE = CUSTOMER_TYPE.NEW_REGISTER;
  lang: LANG = LANG.TH;
  productOwner: PRODUCT_OWNER = PRODUCT_OWNER.FBB;
  customerInfo: CustomerInfo = new CustomerInfo();
  mainPackages: string[] = [];
  onTopPackages: string[] = [];
  entrySection: Detail[] = [];
  wireSection?: string[] = [];
  installationSection: Detail[] = [];
  equipmentSection?: string[] = [];
  monthlySection: Detail[] = [];
  averageSection: AverageSection = new AverageSection();
  termsAndConditions: string = "";
}

export class CustomerInfo {
  registerType: string = "";
  name: string = "";
  repName: string = "";
  mobileNo: string = "";
  email: string = "";
  installDateTime: string = "";
  alternativeInstallDate?: string = "";
  installAddress: string = "";
  billingAddress: string = "";
  invoiceChannel?: string = "";
}

export class AverageSection {
  days: number = 0;
  details: Detail[] = [];
}

export class Detail {
  text: string = "";
  price: number = 0;
  isDiscount: boolean = false;
}
