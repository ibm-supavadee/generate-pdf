import { PRODUCT_OWNER } from "../../constants/enum";
import {
  CUSTOMER_TYPE,
  REGISTER_TYPE,
} from "../../services/pdf/constants/pdf.constants";
import { PdfEAppData } from "../../services/pdf/models/pdf-eapp-data.model";

export const pdfEAppDataMock: PdfEAppData = {
  customerType: CUSTOMER_TYPE.NEW_REGISTER,
  productOwner: PRODUCT_OWNER.FBB,
  isShowInstallationFeeRemark: true,
  cardImage: "",
  signatureImage: "",
  thData: {
    registerDate: "13 มี.ค. 2569",
    customerInfo: {
      registerType: REGISTER_TYPE.ID_CARD,
      idCardNo: "1234567890123",
      name: "นายสมชาย ใจดี",
      repName: "",
      mobileNo: "0812345678",
      otherTelephoneNo: "021234567",
      installAddress:
        "123/45 หมู่บ้านสุขสบาย ซอยสุขใจ ถนนสุขสันต์ แขวงสุขเกษม เขตสุขสำราญ กรุงเทพมหานคร 10110",
      billingChannel: "แจ้งยอดผ่าน SMS + ดูบิลผ่าน My AIS",
      documentDeliveryAddress:
        "123/45 หมู่บ้านสุขสบาย ซอยสุขใจ ถนนสุขสันต์ แขวงสุขเกษม เขตสุขสำราญ กรุงเทพมหานคร 10110",
    },
    mainPackageSection: {
      title:
        "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
      details: [
        {
          text: "ค่าบริการรายเดือน (Monthly Fee) 459.00 บาท (baht) (ไม่รวม VAT/Excl. VAT)",
          price: 459,
          isDiscount: false,
        },
        {
          text: "ระยะเวลาใช้บริการขั้นต่ำ (Minimum Service period): 24 รอบบิล (24 Bill cycles)",
        },
        {
          text: "รับสิทธิ์ยืมใช้ FTTx Router มาตรฐาน (FTTx standard router) จำนวน 1 ชุด (set), AIS PlayBox 1 กล่อง (box)",
        },
        {
          text: "บริการอื่นๆ ใน Package (other service in Package):",
          list: [{ text: "Mobile Service" }],
        },
        {
          text: "ค่าแรกเข้า (Entry fee) (ราคาปกติ/normal charge 2,000 บาท (baht) (ไม่รวม VAT/Excl. VAT))",
          price: 747.66,
        },
        {
          text: "ค่าติดตั้ง (Installation Fee) (ไม่รวม VAT/Excl. VAT)",
          list: [
            {
              text: "รับส่วนลดค่าติดตั้งเมื่อใช้บริการครบตามกำหนดระยะเวลาและเงื่อนไขของแพ็กเกจหลัก (Receive the discount for installation fee of AIS Fiber service when using the service according to the duration and conditions of the main package)",
              price: 4800,
              isDiscount: true,
            },
          ],
        },
      ],
    },
    onTopDetailSection: [
      {
        title: "AIS PLAYBOX",
        details: [
          {
            text: "จำนวน (total) 1 จุด (point) รับสิทธิ์ยืมใช้ AIS PlayBox (Borrow AIS PlayBox) จำนวน (total) 1 กล่อง (box)",
          },
          {
            text: "ค่าบริการรายเดือน (Monthly Fee) 199.00 บาท/เดือน/จุด/ (baht/month/point)",
            price: 199,
            isDiscount: false,
          },
          {
            text: "Content Package: แพ็กเกจ Tennis รายเดือน ราคา 199 บาท ชมสดการแข่งขันเทนนิสระดับโลก",
          },
          {
            text: "ระยะเวลาใช้บริการ (Service period): 24 รอบบิล (24 Bill cycles)",
          },
        ],
      },
    ],
    termsAndConditions: "",
    remark: "",
  },

  enData: {
    registerDate: "13 Mar 2026",
    customerInfo: {
      registerType: REGISTER_TYPE.ID_CARD,
      idCardNo: "1234567890123",
      name: "นายสมชาย ใจดี",
      repName: "",
      mobileNo: "0812345678",
      otherTelephoneNo: "021234567",
      installAddress:
        "123/45 หมู่บ้านสุขสบาย ซอยสุขใจ ถนนสุขสันต์ แขวงสุขเกษม เขตสุขสำราญ กรุงเทพมหานคร 10110",
      billingChannel:
        "Receive Billing Notification via SMS and View Bill via myAIS",
      documentDeliveryAddress:
        "123/45 หมู่บ้านสุขสบาย ซอยสุขใจ ถนนสุขสันต์ แขวงสุขเกษม เขตสุขสำราญ กรุงเทพมหานคร 10110",
    },
    mainPackageSection: {
      title:
        "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
      details: [
        {
          text: "Monthly Fee 459.00 Baht (Excl. VAT)",
          price: 459,
          isDiscount: false,
        },
        {
          text: "Minimum Service period: 24 Bill cycles",
        },
        {
          text: "Receive the right to borrow FTTx standard router, AIS PlayBox 1 box",
        },
        {
          text: "Other service in Package:",
          list: [{ text: "Mobile Service" }],
        },
        {
          text: "Entry fee (Normal charge 2,000 Baht (Excl. VAT))",
          price: 747.66,
        },
        {
          text: "Installation Fee: total 4,800.00 baht (Excl. VAT)",
          list: [
            {
              text: "Receive the discount for installation fee of AIS Fiber service when using the service according to the duration and conditions of the main package",
              price: 4800,
              isDiscount: true,
            },
          ],
        },
      ],
    },
    onTopDetailSection: [
      {
        title: "AIS PLAYBOX",
        details: [
          {
            text: "Total 1 point, receive the right to borrow AIS PlayBox total 1 box",
          },
          {
            text: "Monthly Fee 199.00 Baht/Month/Point",
            price: 199,
            isDiscount: false,
          },
          {
            text: "Content Package: Tennis Package Monthly Fee 199 Baht, watch live world class tennis tournament",
          },
          {
            text: "Service period: 24 Bill cycles",
          },
        ],
      },
    ],
    termsAndConditions: "",
    remark: "",
  },
};
