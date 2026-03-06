export class PdfERequestData {
  customerType: "NEW" | "EXISTING" = "NEW";
  lang: "TH" | "EN" = "TH";
  productOwner: "FBB" | "3BB" = "FBB";
  customerInfo: CustomerInfo = new CustomerInfo();
  mainPackages: string[] = [];
  extensions: string[] = [];
  entrySection: Detail[] = [];
  cableSection?: string[] = [];
  installationSection: Detail[] = [];
  equipmentSection?: string[] = [];
  monthlySection: Detail[] = [];
  averageSection: Detail[] = [];
  termsAndConditions: string = "";
}

export class CustomerInfo {
  registerType: string = "";
  cardType: string = "";
  idCard: string = "";
  name: string = "";
  repName: string = "";
  gender: string = "";
  birthDate: string = ""; // Format: D MMM YYYY
  mobileNo: string = "";
  email: string = "";
  contactTime: string = "";
  installDateTime: string = "";
  backUpInstallDateTime: string = "";
  installLocation: string = "";
  billingAddress: string = "";
  invoiceChannel: string = "";
}

export class Detail {
  text: string = "";
  price: number = 0;
  isDiscount: boolean = false;
}
