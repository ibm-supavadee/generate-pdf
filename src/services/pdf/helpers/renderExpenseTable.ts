import { PdfERequestData } from "../models/pdf-erequest-data.model";
import { PDF_COLORS } from "../pdf.constants";

type ExpenseRow = {
  text: string;
  subText?: string;
  price?: string;
  bold?: boolean;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  data: PdfERequestData;
  drawPageHeader: () => number;
};

export function renderExpenseTable({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  data,
  drawPageHeader,
}: Params): number {
  const col1Width = 150;
  const col3Width = 100;
  const col2Width = contentWidth - col1Width - col3Width;

  const col1X = margin;
  const col2X = col1X + col1Width;
  const col3X = col2X + col2Width;

  const padding = 10;

  const formatPrice = (price: number) =>
    price.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const drawTopBorder = () => {
    const half = 0.5;

    doc
      .lineWidth(1)
      .strokeColor(PDF_COLORS.BORDER)
      .moveTo(col1X + half, y + half)
      .lineTo(col1X + contentWidth - half, y + half)
      .stroke();
  };

  /* -----------------------------
     MAPPERS
  ----------------------------- */

  const mapTextRows = (items: string[]): ExpenseRow[] =>
    items.map((text) => ({ text }));

  const mapPriceRows = (
    items: { text: string; price: number; isDiscount?: boolean }[],
    opts?: { showSubText?: boolean; totalLabel?: string },
  ): ExpenseRow[] => {
    const showSubText = opts?.showSubText;
    const totalLabel = opts?.totalLabel ?? "รวมรายการที่ต้องชำระ";

    let total = 0;

    const rows: ExpenseRow[] = items.map((item) => {
      const value = item.isDiscount ? -item.price : item.price;
      total += value;

      return {
        text: item.text,
        price: `${value < 0 ? "-" : ""}${formatPrice(Math.abs(item.price))} บาท`,
      };
    });

    rows.push({
      text: totalLabel,
      subText: showSubText ? " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)" : undefined,
      price: `${formatPrice(total)} บาท`,
      bold: true,
    });

    return rows;
  };

  const mapInstallationRows = (
    install: { text: string; price: number; isDiscount?: boolean }[],
    equipment: string[],
  ): ExpenseRow[] => {
    let total = 0;

    const rows: ExpenseRow[] = install.map((item) => {
      const value = item.isDiscount ? -item.price : item.price;
      total += value;

      return {
        text: item.text,
        price: `${value < 0 ? "-" : ""}${formatPrice(Math.abs(item.price))} บาท`,
      };
    });

    if (equipment?.length) {
      rows.push({ text: "รับสิทธิ์ยืมอุปกรณ์ ดังนี้" });

      equipment.forEach((eq) => {
        rows.push({ text: `   • ${eq}` });
      });
    }

    rows.push({
      text: "รวมรายการที่ต้องชำระ",
      subText: " (ราคานี้ยังไม่รวมภาษีมูลค่าเพิ่ม)",
      price: `${formatPrice(total)} บาท`,
      bold: true,
    });

    return rows;
  };

  /* -----------------------------
     TABLE RENDER
  ----------------------------- */

  const renderSection = (title: string, rows: ExpenseRow[]) => {
    const leftHeight = doc.heightOfString(title, { width: col1Width - 20 });

    let middleHeight = 0;
    let rightHeight = 0;

    rows.forEach((row) => {
      middleHeight += doc.heightOfString(row.text, {
        width: col2Width - 20,
      });

      rightHeight += doc.heightOfString(row.price || "", {
        width: col3Width - 20,
      });
    });

    const contentHeight = Math.max(leftHeight, middleHeight, rightHeight);
    const rowHeight = contentHeight + padding * 2;

    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = drawPageHeader();
      drawTopBorder();
    }

    const rowStartY = y;

    /* left column */

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GRAY)
      .text(title, col1X + 10, y + padding, {
        width: col1Width - 20,
      });

    let rowY = y + padding;

    rows.forEach((row) => {
      const textHeight = doc.heightOfString(row.text, {
        width: col2Width - 20,
      });

      const priceHeight = doc.heightOfString(row.price || "", {
        width: col3Width - 20,
      });

      const lineHeight = Math.max(textHeight, priceHeight);

      doc
        .font(row.bold ? "bold" : "regular")
        .fillColor(PDF_COLORS.GRAY)
        .text(row.text, col2X + 10, rowY, {
          width: col2Width - 20,
          continued: !!row.subText,
        });

      if (row.subText) {
        doc.font("regular").text(row.subText);
      }

      if (row.price) {
        doc
          .font(row.bold ? "bold" : "regular")
          .fillColor(PDF_COLORS.GREEN)
          .text(row.price, col3X + 10, rowY, {
            width: col3Width - 20,
            align: "right",
          });
      }

      rowY += lineHeight;
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

  /* -----------------------------
     RENDER SECTIONS
  ----------------------------- */

  renderSection(
    data.entrySection.title,
    mapPriceRows(data.entrySection.details, { showSubText: true }),
  );

  if (data.cableSection?.details?.length) {
    renderSection(
      data.cableSection.title,
      mapTextRows(data.cableSection.details),
    );
  }

  renderSection(
    data.installationSection.title,
    mapInstallationRows(
      data.installationSection.details,
      data.equipmentSection?.details ?? [],
    ),
  );

  renderSection(
    data.monthlySection.title,
    mapPriceRows(data.monthlySection.details, {
      showSubText: true,
      totalLabel: "รวมรายการที่ต้องชำระต่อเดือน",
    }),
  );

  renderSection(
    "ค่าบริการเฉลี่ย 1 วัน\n(เรียกเก็บในบิลแรกเท่านั้น)",
    mapPriceRows(data.averageSection.details, {
      showSubText: true,
      totalLabel: "รวมยอดโดยประมาณที่ต้องชำระ",
    }),
  );

  return y;
}
