import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../assets/fonts/db_helvethaica_ais_x_bd_v3";

export async function generateStyledPlayboxPdf(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
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

      const GREEN = "#6BA539";
      const BORDER = "#6BA539";

      doc.registerFont("regular", Buffer.from(dbHelvethaicaAisXV3, "base64"));
      doc.registerFont("bold", Buffer.from(dbHelvethaicaAisXBdV3, "base64"));

      doc.font("regular").fontSize(11);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
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

      doc.rect(0, y, pageWidth, 40).fill(GREEN);

      doc
        .fillColor("white")
        .font("bold")
        .fontSize(16)
        .text("สรุปข้อมูลสมัครบริการ", 0, y + 12, { align: "center" });

      y += 60;
      doc.fillColor("black").font("regular").fontSize(11);

      /* =============================
         CUSTOMER INFO
      ============================= */

      const sectionHeader = (title: string) => {
        ensureSpace(40);

        doc.rect(margin, y, contentWidth, 25).fill(GREEN);
        doc
          .fillColor("white")
          .font("bold")
          .text(title, margin + 10, y + 7);

        y += 35;
        doc.fillColor("black").font("regular");
      };

      sectionHeader("ข้อมูลผู้สมัคร");

      const c = data.customerInfo;

      const leftX = margin + 10;
      const midX = margin + contentWidth / 2 + 10;

      const rowHeight = 18;

      const rows = [
        ["ประเภทบัตร", c.cardType, "เลขบัตรประชาชน", c.idCard],
        ["ชื่อ-นามสกุล", c.fullName, "เพศ", c.gender],
        ["วันเกิด", c.birthDate, "เบอร์โทร", c.mobileNo],
        ["Email", c.email, "เวลาติดต่อกลับ", c.contactTime],
        [
          "วันติดตั้ง",
          c.installDateTime,
          "วันติดตั้งสำรอง",
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

      const boxStartY = y;

      rows.forEach((r) => {
        ensureSpace(rowHeight);

        doc.font("bold").fillColor("black").text(r[0], leftX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[1] || "", leftX + 90, y, { width: 180 });

        doc.font("bold").fillColor("black").text(r[2], midX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[3] || "", midX + 90, y, { width: 180 });

        y += rowHeight;
      });

      doc
        .rect(margin, boxStartY, contentWidth, y - boxStartY + 10)
        .strokeColor(BORDER)
        .stroke();

      y += 25;

      /* =============================
   PACKAGE SECTION (FULL)
============================= */

      sectionHeader("สรุปรายการแพ็กเกจที่เลือก");

      ensureSpace(60);

      const packageBoxStartY = y;
      const leftLabelWidth = 120;
      const leftLabelX = margin + 10;
      const rightContentX = margin + leftLabelWidth + 20;

      let contentY = y + 15;

      // ======================
      // MAIN PACKAGE
      // ======================

      doc
        .font("bold")
        .fillColor("black")
        .text("แพ็กเกจหลัก", leftLabelX, contentY);

      let mainStartY = contentY;

      data.packages?.forEach((pkg: any) => {
        pkg.detail?.forEach((item: any) => {
          ensureSpace(40);

          doc
            .font("bold")
            .fillColor(GREEN)
            .text(item.text, rightContentX, contentY, {
              width: contentWidth - leftLabelWidth - 40,
            });

          contentY = doc.y + 5;

          if (item.description) {
            doc
              .font("regular")
              .fillColor(GREEN)
              .text(item.description, rightContentX, contentY, {
                width: contentWidth - leftLabelWidth - 40,
              });

            contentY = doc.y + 5;
          }
        });
      });

      contentY += 15;

      // ======================
      // EXTENSION PACKAGE
      // ======================

      doc
        .font("bold")
        .fillColor("black")
        .text("แพ็กเกจเสริม", leftLabelX, contentY);

      contentY += 5;

      data.extensions?.forEach((ext: any) => {
        ext.detail?.forEach((item: any) => {
          ensureSpace(40);

          doc
            .font("bold")
            .fillColor(GREEN)
            .text(item.text, rightContentX, contentY, {
              width: contentWidth - leftLabelWidth - 40,
            });

          contentY = doc.y + 5;
        });
      });

      // ======================
      // DRAW BORDER BOX
      // ======================

      const totalHeight = contentY - packageBoxStartY + 15;

      doc
        .rect(margin, packageBoxStartY, contentWidth, totalHeight)
        .strokeColor(BORDER)
        .lineWidth(1.5)
        .stroke();

      // move Y forward
      y = packageBoxStartY + totalHeight + 30;

      /* =============================
         EXPENSE TABLE
      ============================= */

      sectionHeader("รายละเอียดค่าใช้จ่าย");

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
          .fillColor("black")
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
        doc
          .rect(col1X, rowStartY, contentWidth, rowHeight)
          .strokeColor(BORDER)
          .lineWidth(1)
          .stroke();

        doc
          .moveTo(col2X, rowStartY)
          .lineTo(col2X, rowStartY + rowHeight)
          .stroke();

        doc
          .moveTo(col3X, rowStartY)
          .lineTo(col3X, rowStartY + rowHeight)
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

      y += 20;

      const note = `*กรณียกเลิกบริการต้องส่งคืนอุปกรณ์ให้แก่ AWN ตามระยะเวลาและสถานที่ที่ AWN กำหนด หากไม่ส่งคืน ผู้ใช้บริการยินยอมชดใช้ค่าเสียหายตามมูลค่าอุปกรณ์
*หากยกเลิกก่อนครบ 24 รอบบิล ยินดีชำระค่าติดตั้งคืนในอัตราที่ได้มีการหักลดลงตามสัดส่วนที่ได้ใช้บริการไปก่อนแล้วเว้นแต่กรณีที่เหตุแห่งการยกเลิกบริการเกิดขึ้นจากการให้บริการที่ไม่เป็นไปตาม โฆษณาหรือมาตรฐานการให้บริการที่ได้แจ้งไว้ หรือเกิดขึ้นจากความผิดของ AWN AWN จะไม่มีการเรียกเก็บค่าติดตั้งอีกแต่อย่างใ`;

      const noteHeight = doc.heightOfString(note, { width: contentWidth });

      ensureSpace(noteHeight);

      doc
        .font("regular")
        .fontSize(9)
        .fillColor("#666666")
        .text(note, margin, y, { width: contentWidth });

      doc.fillColor("black").fontSize(11);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
