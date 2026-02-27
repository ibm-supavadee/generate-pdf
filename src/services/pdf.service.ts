import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../assets/fonts/db_helvethaica_ais_x_bd_v3";
import path from "path";

export async function generateStyledPlayboxPdf(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 10,
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdf = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdf.toString("base64")}`);
      });

      /* =============================
         CONFIG
      ============================= */

      const GREEN = "#6D9C35";
      const BORDER = "#6D9C35";
      const GRAY = "#666666";

      doc.registerFont("regular", Buffer.from(dbHelvethaicaAisXV3, "base64"));
      doc.registerFont("bold", Buffer.from(dbHelvethaicaAisXBdV3, "base64"));

      doc.font("regular").fontSize(11);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 30;
      const contentWidth = pageWidth - margin * 2;

      let y = margin;

      const ensureSpace = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      /* =============================
        HEADER
        ============================= */

      const logoPath = path.resolve(
        process.cwd(),
        "src/assets/img/icons/png/AIS-Fibre3-FullColor-LightBG.png",
      );

      const headerHeight = 35; // ลดความสูง
      const radius = 12;

      // ===== กำหนดความกว้างแถบเขียว (75%) =====
      const headerWidth = contentWidth * 0.75;
      const headerX = margin;

      // ===== วาดเฉพาะโค้งด้านบน =====
      doc
        .moveTo(headerX, y + headerHeight)
        .lineTo(headerX, y + radius)
        .quadraticCurveTo(headerX, y, headerX + radius, y)
        .lineTo(headerX + headerWidth - radius, y)
        .quadraticCurveTo(
          headerX + headerWidth,
          y,
          headerX + headerWidth,
          y + radius,
        )
        .lineTo(headerX + headerWidth, y + headerHeight)
        .lineTo(headerX, y + headerHeight)
        .closePath()
        .fill(GREEN);

      // ===== ข้อความกลางในแถบ =====
      doc
        .fillColor("white")
        .font("bold")
        .fontSize(18)
        .text("สรุปข้อมูลสมัครบริการ", headerX, y + headerHeight / 2 - 8, {
          width: headerWidth,
          align: "center",
        });

      // ===== โลโก้ริมขวาสุดหน้า =====
      const logoWidth = 60; // ลดขนาด

      doc.image(
        logoPath,
        pageWidth - margin - logoWidth,
        y + headerHeight / 2 - 15, // ปรับ center นิดหน่อย
        { width: logoWidth }, // ไม่ต้องกำหนด height
      );

      y += headerHeight + 5;

      doc.fillColor(GRAY).font("regular").fontSize(11);

      /* =============================
         CUSTOMER INFO
      ============================= */

      const sectionHeader = (
        title: string,
        options?: {
          withDivider?: boolean;
          fullWidth?: boolean;
          width?: number;
        },
      ) => {
        const { withDivider = false, fullWidth = false, width } = options || {};

        ensureSpace(40);

        const paddingX = 16;
        const boxHeight = 32;

        doc.font("bold").fontSize(16);

        const textWidth = doc.widthOfString(title);
        const textHeight = doc.currentLineHeight();

        let boxWidth: number;

        if (width) {
          boxWidth = width;
        } else if (fullWidth) {
          boxWidth = contentWidth;
        } else {
          boxWidth = textWidth + paddingX * 2;
        }

        // วาดพื้นหลัง
        doc.rect(margin, y, boxWidth, boxHeight).fill(GREEN);

        // ===== FIX สำคัญ =====
        doc.fillColor("white").font("bold");

        if (fullWidth) {
          // เขียนแบบ explicit position
          doc.text(title, margin + paddingX, y + (boxHeight - textHeight) / 2);
        } else {
          doc.text(
            title,
            margin + (boxWidth - textWidth) / 2,
            y + (boxHeight - textHeight) / 2,
          );
        }

        if (withDivider) {
          const dividerY = y + boxHeight + 0.5;
          doc
            .moveTo(margin, dividerY)
            .lineTo(margin + contentWidth, dividerY)
            .strokeColor(GREEN)
            .lineWidth(1)
            .stroke();
        }

        y += boxHeight;

        doc.font("regular").fontSize(11).fillColor(GRAY);
      };

      sectionHeader("ข้อมูลผู้สมัคร", { withDivider: true });

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
        [
          "สถานที่ติดตั้ง",
          c.installLocation,
          "ช่องทางรับบิล",
          c.invoiceChannel,
        ],
        ["", "", "ที่อยู่จัดส่งบิล", c.billingAddress],
      ];

      rows.forEach((r) => {
        ensureSpace(rowSpacing);

        // LEFT
        doc.font("bold").fillColor(GRAY).text(r[0], leftLabelX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[1] || "", leftValueX, y, {
            width: 160,
          });

        // RIGHT
        doc.font("bold").fillColor(GRAY).text(r[2], rightLabelX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[3] || "", rightValueX, y, {
            width: 160,
          });

        y += rowSpacing;
      });

      /* =============================
        PACKAGE SECTION (TABLE STYLE)
        ============================= */

      y += 25;

      sectionHeader("สรุปรายการแพ็กเกจที่เลือก");

      const pkgStartY = y;

      const labelWidth = 100;
      const contentX = margin + labelWidth + 10;
      const contentWidthPkg = contentWidth - labelWidth - 20;

      const rowPadding = 12;

      // helper สำหรับวาด 1 block (หลัก / เสริม)
      const drawPackageRow = (label: string, items: any[]) => {
        const rowStartY = y;

        // label ซ้าย (อยู่บรรทัดเดียวกับ value แรก)
        doc
          .font("bold")
          .fillColor(GRAY)
          .text(label, margin + 10, y + rowPadding);

        let contentY = y + rowPadding;

        items?.forEach((item: any, index: number) => {
          doc
            .font("bold")
            .fillColor(GREEN)
            .text(item.text, contentX, contentY, {
              width: contentWidthPkg,
            });

          contentY = doc.y + 4;

          if (item.description) {
            doc
              .font("regular")
              .fillColor(GREEN)
              .text(item.description, contentX, contentY, {
                width: contentWidthPkg,
              });

            contentY = doc.y + 4;
          }
        });

        const rowHeight = contentY - rowStartY + rowPadding;

        y = rowStartY + rowHeight;

        return rowHeight;
      };

      // ===== แพ็กเกจหลัก =====
      const mainHeight = drawPackageRow(
        "แพ็กเกจหลัก",
        data.packages?.flatMap((p: any) => p.detail) || [],
      );

      // เส้นคั่นกลาง
      doc
        .moveTo(margin, y)
        .lineTo(margin + contentWidth, y)
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();

      // ===== แพ็กเกจเสริม =====
      const extensionHeight = drawPackageRow(
        "แพ็กเกจเสริม",
        data.extensions?.flatMap((e: any) => e.detail) || [],
      );

      // ===== กรอบรอบทั้งหมด =====
      const borderWidth = 1;

      doc
        .rect(
          margin + borderWidth / 2,
          pkgStartY + borderWidth / 2,
          contentWidth - borderWidth,
          y - pkgStartY - borderWidth,
        )
        .strokeColor(BORDER)
        .lineWidth(borderWidth)
        .stroke();

      y += 25;

      /* =============================
         EXPENSE TABLE
      ============================= */

      sectionHeader("รายละเอียดค่าใช้จ่าย", {
        fullWidth: true,
      });

      const col1Width = 150;
      const col3Width = 100;
      const col2Width = contentWidth - col1Width - col3Width;

      const col1X = margin;
      const col2X = col1X + col1Width;
      const col3X = col2X + col2Width;

      const drawExpenseRow = (
        leftText: string,
        middleText: string,
        rightText: string,
      ) => {
        const padding = 10;

        const leftHeight = doc.heightOfString(leftText, {
          width: col1Width - 20,
        });

        const middleHeight = doc.heightOfString(middleText, {
          width: col2Width - 20,
        });

        const rightHeight = doc.heightOfString(rightText, {
          width: col3Width - 20,
        });

        const contentHeight = Math.max(leftHeight, middleHeight, rightHeight);
        const rowHeight = contentHeight + padding * 2;

        // ถ้าไม่พอหน้า → ขึ้นหน้าใหม่ก่อนวาด
        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        const rowStartY = y;

        // วาดข้อความ
        doc
          .font("regular")
          .fillColor(GRAY)
          .text(leftText, col1X + 10, y + padding, {
            width: col1Width - 20,
          });

        doc.text(middleText, col2X + 10, y + padding, {
          width: col2Width - 20,
        });

        doc
          .font("bold")
          .fillColor(GREEN)
          .text(rightText, col3X + 10, y + padding, {
            width: col3Width - 20,
            align: "right",
          });

        // วาดกรอบ
        const borderWidth = 1;
        const half = borderWidth / 2;

        doc.lineWidth(borderWidth).strokeColor(BORDER);

        // กรอบนอก (offset เข้า 0.5)
        doc
          .rect(
            col1X + half,
            rowStartY + half,
            contentWidth - borderWidth,
            rowHeight - borderWidth,
          )
          .stroke();

        // เส้นแบ่งคอลัมน์
        doc
          .moveTo(col2X + half, rowStartY + half)
          .lineTo(col2X + half, rowStartY + rowHeight - half)
          .stroke();

        doc
          .moveTo(col3X + half, rowStartY + half)
          .lineTo(col3X + half, rowStartY + rowHeight - half)
          .stroke();

        y += rowHeight;
      };

      // แยกฟังก์ชันการวาดออกมาเพื่อเรียกซ้ำ
      const renderRow = (l: string, m: string, r: string, height: number) => {
        const startY = y;
        doc
          .rect(col1X, startY, contentWidth, height)
          .strokeColor(BORDER)
          .stroke();
        // ... ใส่โค้ดวาด Text และเส้นแบ่งคอลัมน์เหมือนเดิม ...
        y += height;
      };

      drawExpenseRow(
        "ค่าใช้จ่ายที่ต้องชำระ:",
        "ค่าแรกเข้า\nรวมรายการที่ต้องชำระ (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
        "1,869.16 บาท\n1,869.16 บาท",
      );

      drawExpenseRow(
        "ค่าเดินสายที่ต้องชำระในวันติดตั้ง (ถ้ามี)",
        "กรณีเดินสายมากกว่าระยะทางที่กำหนด (สายโทรศัพท์ความยาว 10 เมตร) คิดค่าสายเมตรละ 20 บาท โดยชำระเงินให้กับผู้ติดตั้งในวันที่ติดตั้ง",
        "-",
      );

      drawExpenseRow(
        "ค่าติดตั้งและอุปกรณ์",
        "ค่าติดตั้ง อินเทอร์เน็ตพร้อมอุปกรณ์รับสัญญาณ (WiFi router)\nส่วนลดค่าติดตั้ง โดยตกลงใช้บริการอย่างน้อย 24 รอบบิล\nรับสิทธิ์ยืมอุปกรณ์ ดังนี้\n• FTTH – Router มูลค่า 2,500 บาท",
        "4,800.00 บาท\n4,800.00 บาท\n0.00 บาท",
      );

      drawExpenseRow(
        "ค่าบริการรายเดือน",
        "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)\nรวมรายการที่ต้องชำระต่อเดือน (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
        "599.00 บาท\n599.00 บาท",
      );

      drawExpenseRow(
        "ค่าบริการเฉลี่ย 1 วัน\n(เรียกเก็บในบิลแรกเท่านั้น)",
        "คิดเฉลี่ย 19.32 บาท ต่อ 1 วัน\nรวมยอดโดยประมาณที่ต้องชำระ (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
        "19.32 บาท\n618.32 บาท",
      );

      /* =============================
         FOOTNOTE
      ============================= */

      y += 5;

      const note = `*กรณียกเลิกบริการต้องส่งคืนอุปกรณ์ให้แก่ AWN ตามระยะเวลาและสถานที่ที่ AWN กำหนด หากไม่ส่งคืน ผู้ใช้บริการยินยอมชดใช้ค่าเสียหายตามมูลค่าอุปกรณ์
*หากยกเลิกก่อนครบ 24 รอบบิล ยินดีชำระค่าติดตั้งคืนในอัตราที่ได้มีการหักลดลงตามสัดส่วนที่ได้ใช้บริการไปก่อนแล้วเว้นแต่กรณีที่เหตุแห่งการยกเลิกบริการเกิดขึ้นจากการให้บริการที่ไม่เป็นไปตาม โฆษณาหรือมาตรฐานการให้บริการที่ได้แจ้งไว้ หรือเกิดขึ้นจากความผิดของ AWN AWN จะไม่มีการเรียกเก็บค่าติดตั้งอีกแต่อย่างใ`;

      const noteHeight = doc.heightOfString(note, { width: contentWidth });

      ensureSpace(noteHeight);

      doc
        .font("regular")
        .fontSize(9)
        .fillColor("#666666")
        .text(note, margin, y, { width: contentWidth });

      doc.fillColor(GRAY).fontSize(11);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
