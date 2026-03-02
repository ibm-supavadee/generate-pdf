import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import { dbHelvethaicaAisXV3 } from "../assets/fonts/db_helvethaica_ais_x_v3";
import { dbHelvethaicaAisXBdV3 } from "../assets/fonts/db_helvethaica_ais_x_bd_v3";
import path from "path";

export async function generateStyledPlayboxPdf(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      /* =============================
         DOCUMENT INIT
      ============================= */

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
         STYLE CONFIG
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

      /* =============================
         COMMON HELPERS
      ============================= */

      const ensureSpace = (height: number) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const drawTopBorder = (x: number, width: number) => {
        const half = 0.5;

        doc
          .lineWidth(1)
          .strokeColor(BORDER)
          .moveTo(x + half, y + half)
          .lineTo(x + width - half, y + half)
          .stroke();
      };

      /* =============================
         HEADER
      ============================= */

      const logoPath = path.resolve(
        process.cwd(),
        "src/assets/img/icons/png/AIS-Fibre3-FullColor-LightBG.png",
      );

      const headerHeight = 35;
      const radius = 12;

      const headerWidth = contentWidth * 0.75;
      const headerX = margin;

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

      doc
        .fillColor("white")
        .font("bold")
        .fontSize(18)
        .text("สรุปข้อมูลสมัครบริการ", headerX, y + headerHeight / 2 - 8, {
          width: headerWidth,
          align: "center",
        });

      const logoWidth = 60;

      doc.image(
        logoPath,
        pageWidth - margin - logoWidth,
        y + headerHeight / 2 - 15,
        { width: logoWidth },
      );

      y += headerHeight + 5;

      doc.fillColor(GRAY).font("regular").fontSize(11);

      /* =============================
         SECTION HEADER
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

        if (width) boxWidth = width;
        else if (fullWidth) boxWidth = contentWidth;
        else boxWidth = textWidth + paddingX * 2;

        doc.rect(margin, y, boxWidth, boxHeight).fill(GREEN);

        doc.fillColor("white").font("bold");

        if (fullWidth) {
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

      /* =============================
         CUSTOMER INFO
      ============================= */

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

        doc.font("bold").fillColor(GRAY).text(r[0], leftLabelX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[1] || "", leftValueX, y, { width: 160 });

        doc.font("bold").fillColor(GRAY).text(r[2], rightLabelX, y);
        doc
          .font("regular")
          .fillColor(GREEN)
          .text(r[3] || "", rightValueX, y, { width: 160 });

        y += rowSpacing;
      });

      /* =============================
         PACKAGE SECTION
      ============================= */

      y += 25;

      sectionHeader("สรุปรายการแพ็กเกจที่เลือก");

      const pkgStartY = y;

      const labelWidth = 100;
      const contentX = margin + labelWidth + 10;
      const contentWidthPkg = contentWidth - labelWidth - 20;

      const rowPadding = 12;

      const drawPackageRow = (label: string, items: any[]) => {
        const rowStartY = y;

        doc
          .font("bold")
          .fillColor(GRAY)
          .text(label, margin + 10, y + rowPadding);

        let contentY = y + rowPadding;

        items?.forEach((item: any) => {
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

      drawPackageRow(
        "แพ็กเกจหลัก",
        data.packages?.flatMap((p: any) => p.detail) || [],
      );

      doc
        .moveTo(margin, y)
        .lineTo(margin + contentWidth, y)
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();

      drawPackageRow(
        "แพ็กเกจเสริม",
        data.extensions?.flatMap((e: any) => e.detail) || [],
      );

      doc
        .rect(
          margin + 0.5,
          pkgStartY + 0.5,
          contentWidth - 1,
          y - pkgStartY - 1,
        )
        .strokeColor(BORDER)
        .lineWidth(1)
        .stroke();

      y += 25;

      /* =============================
         EXPENSE TABLE
      ============================= */

      sectionHeader("รายละเอียดค่าใช้จ่าย", { fullWidth: true });

      const col1Width = 150;
      const col3Width = 100;
      const col2Width = contentWidth - col1Width - col3Width;

      const col1X = margin;
      const col2X = col1X + col1Width;
      const col3X = col2X + col2Width;

      type ExpenseItem = {
        text: string;
        price: string;
      };

      const drawExpenseGroup = (title: string, items: ExpenseItem[]) => {
        const padding = 10;

        const middleText = items.map((i) => i.text).join("\n");
        const rightText = items.map((i) => i.price).join("\n");

        const leftHeight = doc.heightOfString(title, {
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

        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawTopBorder(col1X, contentWidth);
        }

        const rowStartY = y;

        doc
          .font("regular")
          .fillColor(GRAY)
          .text(title, col1X + 10, y + padding, {
            width: col1Width - 20,
          });

        doc
          .font("regular")
          .fillColor(GRAY)
          .text(middleText, col2X + 10, y + padding, {
            width: col2Width - 20,
            lineGap: 0,
          });

        doc
          .font("bold")
          .fillColor(GREEN)
          .text(rightText, col3X + 10, y + padding, {
            width: col3Width - 20,
            align: "right",
            lineGap: 0,
          });

        const half = 0.5;

        doc.lineWidth(1).strokeColor(BORDER);

        doc
          .moveTo(col1X + half, rowStartY)
          .lineTo(col1X + half, rowStartY + rowHeight)
          .stroke();
        doc
          .moveTo(col2X + half, rowStartY)
          .lineTo(col2X + half, rowStartY + rowHeight)
          .stroke();
        doc
          .moveTo(col3X + half, rowStartY)
          .lineTo(col3X + half, rowStartY + rowHeight)
          .stroke();

        doc
          .moveTo(col1X + contentWidth - half, rowStartY)
          .lineTo(col1X + contentWidth - half, rowStartY + rowHeight)
          .stroke();

        doc
          .moveTo(col1X + half, rowStartY + rowHeight - half)
          .lineTo(col1X + contentWidth - half, rowStartY + rowHeight - half)
          .stroke();

        y += rowHeight;
      };

      /* =============================
         EXPENSE DATA
      ============================= */

      drawExpenseGroup("ค่าใช้จ่ายที่ต้องชำระ:", [
        { text: "ค่าแรกเข้า", price: "1,869.16 บาท" },
        {
          text: "รวมรายการที่ต้องชำระ (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
          price: "1,869.16 บาท",
        },
      ]);

      drawExpenseGroup("ค่าเดินสายที่ต้องชำระในวันติดตั้ง (ถ้ามี)", [
        {
          text: "กรณีเดินสายมากกว่าระยะทางที่กำหนด (สายโทรศัพท์ความยาว 10 เมตร) คิดค่าสายเมตรละ 20 บาท โดยชำระเงินให้กับผู้ติดตั้งในวันที่ติดตั้ง",
          price: "-",
        },
      ]);

      drawExpenseGroup("ค่าติดตั้งและอุปกรณ์", [
        {
          text: "ค่าติดตั้ง อินเทอร์เน็ตพร้อมอุปกรณ์รับสัญญาณ (WiFi router)",
          price: "4,800.00 บาท",
        },
        {
          text: "ส่วนลดค่าติดตั้ง โดยตกลงใช้บริการอย่างน้อย 24 รอบบิล",
          price: "-4,800.00 บาท",
        },
        {
          text: "รับสิทธิ์ยืมอุปกรณ์ ดังนี้\n• FTTH – Router มูลค่า 2,500 บาท",
          price: "0.00 บาท",
        },
      ]);

      drawExpenseGroup("ค่าบริการรายเดือน", [
        {
          text: "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
          price: "599.00 บาท",
        },
        {
          text: "รวมรายการที่ต้องชำระต่อเดือน (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
          price: "599.00 บาท",
        },
      ]);

      drawExpenseGroup("ค่าบริการเฉลี่ย 1 วัน\n(เรียกเก็บในบิลแรกเท่านั้น)", [
        { text: "คิดเฉลี่ย 19.32 บาท ต่อ 1 วัน", price: "19.32 บาท" },
        {
          text: "รวมยอดโดยประมาณที่ต้องชำระ (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
          price: "618.32 บาท",
        },
      ]);

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
