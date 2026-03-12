export class PdfEAppData {
  customerType: "NEW_REGISTER" | "EXISTING" = "NEW_REGISTER";
  lang: "TH" | "EN" = "TH";
  productOwner: "FBB" | "3BB" = "FBB";
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
  idCardPassportNo: string = "";
  mobileNo: string = "";
  otherTelephoneNo: string = "";
  installAddress: string = "";
  billingChannel: string = "";
  documentDeliveryAddress: string = "";
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
