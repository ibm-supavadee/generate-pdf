export class PdfERequestData {
  customerType: "NEW" | "EXISTING" = "NEW";
  lang: "TH" | "EN" = "TH";
  productOwner: "FBB" | "3BB" = "FBB";
  customerInfo: CustomerInfo = new CustomerInfo();
  mainPackages: Section = new Section();
  extensions: Section = new Section();
  entrySection: SectionWithPrice = new SectionWithPrice();
  cableSection: Section = new Section();
  installationSection: SectionWithPrice = new SectionWithPrice();
  equipmentSection: Section = new Section();
  monthlySection: SectionWithPrice = new SectionWithPrice();
  averageSection: SectionWithPrice = new SectionWithPrice();
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

export class SectionWithPrice {
  title: string = "";
  details: Detail[] = [];
}

export class Section {
  title: string = "";
  details: string[] = [];
}

export class Detail {
  text: string = "";
  price: number = 0;
  isDiscount: boolean = false;
}
