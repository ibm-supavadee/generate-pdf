import type PDFDocument from "pdfkit";

type ExpenseItem = {
  text: string;
  price: string;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  green: string;
  gray: string;
  border: string;
};

export function drawExpenseTable({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  green,
  gray,
  border,
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
      .strokeColor(border)
      .moveTo(x + half, y + half)
      .lineTo(x + width - half, y + half)
      .stroke();
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
      .fillColor(gray)
      .text(title, col1X + 10, y + padding, {
        width: col1Width - 20,
      });

    doc
      .font("regular")
      .fillColor(gray)
      .text(middleText, col2X + 10, y + padding, {
        width: col2Width - 20,
        lineGap: 0,
      });

    doc
      .font("bold")
      .fillColor(green)
      .text(rightText, col3X + 10, y + padding, {
        width: col3Width - 20,
        align: "right",
        lineGap: 0,
      });

    const half = 0.5;

    doc.lineWidth(1).strokeColor(border);

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

  return y;
}
