import { PDF_COLORS } from "./constants";

type ExpenseItem = {
  text: string;
  subText?: string;
  price: string;
  bold?: boolean;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  drawPageHeader: () => number;
};

export function drawExpenseTable({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  drawPageHeader,
}: Params): number {
  const col1Width = 150;
  const col3Width = 100;
  const col2Width = contentWidth - col1Width - col3Width;

  const col1X = margin;
  const col2X = col1X + col1Width;
  const col3X = col2X + col2Width;

  const drawTopBorder = (x: number, width: number) => {
    const half = 0.5;

    doc
      .lineWidth(1)
      .strokeColor(PDF_COLORS.BORDER)
      .moveTo(x + half, y + half)
      .lineTo(x + width - half, y + half)
      .stroke();
  };

  const drawExpenseGroup = (title: string, items: ExpenseItem[]) => {
    const padding = 10;

    const leftHeight = doc.heightOfString(title, {
      width: col1Width - 20,
    });

    let middleHeight = 0;
    let rightHeight = 0;

    items.forEach((item) => {
      middleHeight += doc.heightOfString(item.text, {
        width: col2Width - 20,
      });

      rightHeight += doc.heightOfString(item.price || "", {
        width: col3Width - 20,
      });
    });

    const contentHeight = Math.max(leftHeight, middleHeight, rightHeight);
    const rowHeight = contentHeight + padding * 2;

    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();

      // draw header + section header ใหม่
      y = drawPageHeader();

      drawTopBorder(col1X, contentWidth);
    }

    const rowStartY = y;

    /* Left Column */

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GRAY)
      .text(title, col1X + 10, y + padding, {
        width: col1Width - 20,
      });
    let rowY = y + padding;

    items.forEach((item) => {
      const middleHeight = doc.heightOfString(item.text, {
        width: col2Width - 20,
      });

      const rightHeight = doc.heightOfString(item.price || "", {
        width: col3Width - 20,
      });

      const rowHeight = Math.max(middleHeight, rightHeight);

      const textX = col2X + 10;

      doc
        .font(item.bold ? "bold" : "regular")
        .fillColor(PDF_COLORS.GRAY)
        .text(item.text, textX, rowY, {
          width: col2Width - 20,
          continued: !!item.subText,
        });

      if (item.subText) {
        doc
          .font("regular")
          .fillColor(PDF_COLORS.GRAY)
          .text(item.subText, {
            width: col2Width - 20,
          });
      }

      if (item.price) {
        doc
          .font(item.bold ? "bold" : "regular")
          .fillColor(PDF_COLORS.GREEN)
          .text(item.price, col3X + 10, rowY, {
            width: col3Width - 20,
            align: "right",
          });
      }

      rowY += rowHeight;
    });

    const half = 0.5;

    doc.lineWidth(1).strokeColor(PDF_COLORS.BORDER);

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

  /*
  EXPENSE DATA
  */

  drawExpenseGroup("ค่าใช้จ่ายที่ต้องชำระ:", [
    { text: "ค่าแรกเข้า", price: "1,869.16 บาท" },
    {
      text: "รวมรายการที่ต้องชำระต่อเดือน",
      subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
      price: "1,869.16 บาท",
      bold: true,
    },
  ]);

  drawExpenseGroup("ค่าเดินสายที่ต้องชำระในวันติดตั้ง (ถ้ามี)", [
    {
      text: "กรณีเดินสายมากกว่าระยะทางที่กำหนด (สายโทรศัพท์ความยาว 10 เมตร) คิดค่าสายเมตรละ 20 บาท โดยชำระเงินให้กับผู้ติดตั้งในวันที่ติดตั้ง",
      price: "",
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
      text: "รับสิทธิ์ยืมอุปกรณ์ ดังนี้",
      price: "",
    },
    {
      text: "   • FTTH – Router มูลค่า 2,500 บาท",
      price: "",
    },
    {
      text: "รวมรายการที่ต้องชำระต่อเดือน",
      subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
      price: "0.00 บาท",
      bold: true,
    },
  ]);

  drawExpenseGroup("ค่าบริการรายเดือน", [
    {
      text: "BROADBAND24 Package 500/500 Mbps 599 THB 24 months (Internet only)",
      price: "599.00 บาท",
    },
    {
      text: "รวมรายการที่ต้องชำระต่อเดือน",
      subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
      price: "599.00 บาท",
      bold: true,
    },
  ]);

  drawExpenseGroup("ค่าบริการเฉลี่ย 1 วัน\n(เรียกเก็บในบิลแรกเท่านั้น)", [
    { text: "คิดเฉลี่ย 19.32 บาท ต่อ 1 วัน", price: "19.32 บาท" },
    {
      text: "รวมยอดโดยประมาณที่ต้องชำระ",
      subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
      price: "618.32 บาท",
      bold: true,
    },
  ]);

  // drawExpenseGroup("ค่าติดตั้งและอุปกรณ์", [
  //   {
  //     text: "ค่าติดตั้ง อินเทอร์เน็ตพร้อมอุปกรณ์รับสัญญาณ (WiFi router)",
  //     price: "4,800.00 บาท",
  //   },
  //   {
  //     text: "ส่วนลดค่าติดตั้ง โดยตกลงใช้บริการอย่างน้อย 24 รอบบิล",
  //     price: "-4,800.00 บาท",
  //   },
  //   {
  //     text: "รับสิทธิ์ยืมอุปกรณ์ ดังนี้",
  //     price: "",
  //   },
  //   {
  //     text: "   • FTTH – Router มูลค่า 2,500 บาท",
  //     price: "",
  //   },
  //   {
  //     text: "รวมรายการที่ต้องชำระต่อเดือน",
  //     subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
  //     price: "0.00 บาท",
  //     bold: true,
  //   },
  // ]);

  return y;
}
