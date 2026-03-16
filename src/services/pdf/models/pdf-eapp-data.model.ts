export class PdfEAppData {
  customerType: "NEW_REGISTER" | "EXISTING" = "NEW_REGISTER";
  productOwner: "FBB" | "3BB" = "FBB";
  customerInfo: CustomerInfo = new CustomerInfo();
  packageDetail: PackageDetailSection = new PackageDetailSection();
  cardImage: string = "";
  signatureImage: string = "";
  registerDate: string = "";
  termsAndConditionsTH: string | TermsObject = "";
  termsAndConditionsEN: string | TermsObject = "";
}

export class CustomerInfo {
  registerType: string = "";
  idCardNo: string = "";
  name: string = "";
  repName: string = "";
  mobileNo: string = "";
  otherTelephoneNo: string = "";
  installAddress: string = "";
  billingChannel: string = "";
  documentDeliveryAddress: string = "";
}

export class PackageDetailSection {
  packageName: string = "";
  details: Detail[] = [];
}

export class Detail {
  text: string = "";
  price: number = 0;
}

type TermsObject = {
  packageInfo?: string[];
  remark?: string[];
};
