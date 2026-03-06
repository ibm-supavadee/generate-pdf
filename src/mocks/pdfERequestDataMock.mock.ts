import { PdfERequestData } from "../services/pdf/models/pdf-erequest-data.model";

export const pdfERequestDataMock: PdfERequestData = {
  customerType: "EXISTING",
  lang: "TH",
  productOwner: "FBB",
  customerInfo: {
    registerType: "บัตรประชาชน",
    cardType: "บัตรประชาชน",
    idCard: "1802034581530",
    name: "ทดสอบ นิวคนนึง",
    repName: "",
    gender: "หญิง",
    birthDate: "1 ม.ค. 2525",
    mobileNo: "0633432145",
    email: "-",
    contactTime: "08:00 - 17:00 น.",
    installDateTime: "2 ก.พ. 2569 09:00–12:00",
    backUpInstallDateTime: "-",
    installLocation:
      "เลขที่ 240/4 ถ.กรองทอง 4 แขวงวังทองหลาง เขตวัฒนา กรุงเทพมหานคร 10310",
    billingAddress:
      "เลขที่ 240/4 ถ.กรองทอง 4 แขวงวังทองหลาง เขตวัฒนา กรุงเทพมหานคร 10310",
    invoiceChannel: "แจ้งยอดผ่าน SMS + ดูบิลผ่าน My AIS",
  },
  mainPackages: [
    "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
    "ส่วนลดค่าติดตั้งอินเทอร์เน็ตพร้อมอุปกรณ์รับสัญญาณ (WIFI Router) มูลค่า 4,800.00 บาท",
  ],
  extensions: [
    "HBO Add-on แพ็กเกจเสริมความบันเทิงระดับพรีเมียม รับชมภาพยนตร์และซีรีส์ดังจาก HBO Originals แบบเต็มอิ่ม ความคมชัดระดับ HD/4K พร้อมเสียงคุณภาพสูง รองรับการรับชมผ่าน Smart TV, มือถือ และแท็บเล็ต สามารถรับชมย้อนหลังและเลือกเสียงพากย์หรือคำบรรยายได้ตามต้องการ",
    "ฟรี! AIS Playbox มูลค่า 1,490 บาท",
    "ส่วนลดค่าบริการรายเดือน 50% นาน 6 เดือน (เฉพาะแพ็กเกจ BROADBAND24)",
  ],
  entrySection: [
    {
      text: "ค่าแรกเข้า",
      price: 747.66,
      isDiscount: false,
    },
    {
      text: "ส่วนลดค่าแรกเข้า",
      price: 747.66,
      isDiscount: true,
    }
  ],
  installationSection: [
    {
      text: "ค่าติดตั้ง อินเทอร์เน็ตพร้อมอุปกรณ์รับส่งสัญญาณ (WiFi router)",
      price: 4800,
      isDiscount: false,
    },
    {
      text: "ส่วนลดค่าติดตั้ง โดยตกลงใช้บริการอย่างน้อย 12 รอบบิล",
      price: 4800,
      isDiscount: true,
    }
  ],
  equipmentSection: [
    "AIS PLAYBOX มูลค่าจุดละ 2,000 บาท หรือ 2,490 บาท (ตามเงื่อนไขของแพ็กเกจที่ลูกค้าตกลงใช้บริการ)",
    "FTTH – Router มูลค่า 2,500 บาท",
  ],
  monthlySection: [
    {
      text: "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
      price: 360,
      isDiscount: false,
    },
    {
      text: "ส่วนลดค่าบริการรายเดือน 50% นาน 6 เดือน (เฉพาะแพ็กเกจ BROADBAND24)",
      price: 230,
      isDiscount: true,
    }
  ],
  averageSection: [
    {
      text: "คิดเฉลี่ย 123.91 บาทต่อ 1 วัน",
      price: 123.91,
      isDiscount: false,
    },
  ],
};
