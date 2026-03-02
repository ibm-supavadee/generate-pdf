import type PDFDocument from "pdfkit";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  data: any;
  ensureSpace: (height: number) => void;
  green: string;
  gray: string;
};

export function drawCustomerInfo({
  doc,
  y,
  margin,
  contentWidth,
  data,
  ensureSpace,
  green,
  gray,
}: Params): number {
  y += 10;

  const c = data.customerInfo;

  const leftLabelX = margin;
  const leftValueX = margin + 110;

  const rightLabelX = margin + contentWidth / 2;
  const rightValueX = rightLabelX + 120;

  const rowSpacing = 18;

  const rows = [
    ["ประเภทบัตร", c.cardType, "เลขบัตรประชาชน", c.idCard],
    ["ชื่อ-นามสกุล", c.fullName, "เพศ", c.gender],
    ["วันเกิด", c.birthDate, "เบอร์โทร", c.mobileNo],
    ["อีเมล", c.email, "เวลาที่สะดวกให้ติดต่อกลับ", c.contactTime],
    [
      "วัน/เวลาติดตั้งที่ท่านเลือก",
      c.installDateTime,
      "วัน/เวลาติดตั้งสำรอง",
      c.reserveInstallDateTime,
    ],
    ["สถานที่ติดตั้ง", c.installLocation, "ช่องทางรับบิล", c.invoiceChannel],
    ["", "", "ที่อยู่จัดส่งบิล", c.billingAddress],
  ];

  rows.forEach((r) => {
    ensureSpace(rowSpacing);

    doc.font("bold").fillColor(gray).text(r[0], leftLabelX, y);

    doc
      .font("regular")
      .fillColor(green)
      .text(r[1] || "", leftValueX, y, { width: 160 });

    doc.font("bold").fillColor(gray).text(r[2], rightLabelX, y);

    doc
      .font("regular")
      .fillColor(green)
      .text(r[3] || "", rightValueX, y, { width: 160 });

    y += rowSpacing;
  });

  return y;
}
