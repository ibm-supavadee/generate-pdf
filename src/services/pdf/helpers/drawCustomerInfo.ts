import { PDF_COLORS } from "../pdf.constants";

type CustomerType = "new" | "existing";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  type: CustomerType;
  data: any;
  ensureSpace: (height: number) => void;
};

export function drawCustomerInfo({
  doc,
  y,
  margin,
  contentWidth,
  type,
  data,
  ensureSpace,
}: Params): number {
  y += 10;

  const customerInfo = data.customerInfo;

  const leftLabelX = margin;
  const leftValueX = margin + 110;

  const rightLabelX = margin + contentWidth / 2;
  const rightValueX = rightLabelX + 120;

  const rowSpacing = 18;

  const rows =
    type === "existing"
      ? [
          [
            "ชื่อ-นามสกุล",
            customerInfo.fullName,
            "หมายเลขที่ใช้ในการติดต่อ",
            customerInfo.mobileNo,
          ],
          [
            "อีเมล",
            customerInfo.email,
            "ที่อยู่จัดส่งบิล",
            customerInfo.billingAddress,
          ],
          ["วัน/เวลาติดตั้งที่ท่านเลือก", customerInfo.installDateTime, "", ""],
          ["สถานที่ติดตั้ง", customerInfo.installLocation, "", ""],
        ]
      : [
          [
            "ประเภทบัตร",
            customerInfo.cardType,
            "เลขบัตรประชาชน",
            customerInfo.idCard,
          ],
          ["ชื่อ-นามสกุล", customerInfo.fullName, "เพศ", customerInfo.gender],
          [
            "วันเกิด",
            customerInfo.birthDate,
            "เบอร์โทร",
            customerInfo.mobileNo,
          ],
          [
            "อีเมล",
            customerInfo.email,
            "เวลาที่สะดวกให้ติดต่อกลับ",
            customerInfo.contactTime,
          ],
          [
            "วัน/เวลาติดตั้งที่ท่านเลือก",
            customerInfo.installDateTime,
            "วัน/เวลาติดตั้งสำรอง",
            customerInfo.reserveInstallDateTime,
          ],
          [
            "สถานที่ติดตั้ง",
            customerInfo.installLocation,
            "ช่องทางรับบิล",
            customerInfo.invoiceChannel,
          ],
          ["", "", "ที่อยู่จัดส่งบิล", customerInfo.billingAddress],
        ];

  rows.forEach((r) => {
    ensureSpace(rowSpacing);

    doc.font("bold").fillColor(PDF_COLORS.GRAY).text(r[0], leftLabelX, y);

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GREEN)
      .text(r[1] || "", leftValueX, y, { width: 160 });

    doc.font("bold").fillColor(PDF_COLORS.GRAY).text(r[2], rightLabelX, y);

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GREEN)
      .text(r[3] || "", rightValueX, y, { width: 160 });

    y += rowSpacing;
  });

  return y;
}
