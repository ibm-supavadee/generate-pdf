import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";
import {
  FONT_SIZE,
  HEADER_SPACING,
  PDF_COLORS,
} from "../../../constants/pdf.constants";
import { Detail, PdfData, Section } from "../../../models/pdf-eapp-data.model";
import { drawSectionHeader } from "../../layout/drawSectionHeader";
import { drawDivider } from "../../shared/drawDivider";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  pdfData: PdfData;
  label: typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;
  drawMainHeader: (margin: number) => number;
};

export function drawPackageDetail({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  pdfData,
  label,
  drawMainHeader,
}: Params): number {
  const priceWidth = 70;
  const detailWidth = contentWidth - priceWidth;

  const detailX = margin;
  const priceX = margin + detailWidth;

  const rowPadding = 2;

  const formatPrice = (price: number) =>
    price.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPriceText = (value: number) =>
    `${formatPrice(value)} ${label.THB}`;

  /* ---------------- HEADER ---------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
    options: { fullWidth: true },
  });

  let tableStartY = y;

  /* ---------------- TABLE HEADER ---------------- */

  const drawTableHeader = (startY: number) => {
    const half = 0.5;

    doc
      .lineWidth(1)
      .strokeColor(PDF_COLORS.BORDER)
      .moveTo(detailX + half, startY + half)
      .lineTo(detailX + contentWidth - half, startY + half)
      .stroke();
  };

  /* ---------------- TABLE BORDER ---------------- */

  const drawTableBorder = (startY: number, endY: number) => {
    doc
      .moveTo(priceX, startY)
      .lineTo(priceX, endY)
      .strokeColor(PDF_COLORS.BORDER)
      .lineWidth(1)
      .stroke();

    doc
      .rect(margin + 0.5, startY + 0.5, contentWidth - 1, endY - startY - 1)
      .strokeColor(PDF_COLORS.BORDER)
      .lineWidth(1)
      .stroke();
  };

  drawTableHeader(y);
  y += HEADER_SPACING;
  tableStartY = y - HEADER_SPACING;

  /* ---------------- RENDER ROW ---------------- */

  const renderRow = (
    text: string,
    price?: number,
    option: {
      isBold?: boolean;
      description?: string;
      bullet?: boolean;
    } = {},
  ) => {
    const bullet = option.bullet ? "• " : "";
    const displayText = `${bullet}${text}`;

    const fullText = option.description
      ? `${displayText} ${option.description}`
      : displayText;

    const textTotalHeight = doc.heightOfString(fullText, {
      width: detailWidth - 30,
      lineGap: 2,
    });

    const priceText = price !== undefined ? formatPriceText(price) : "";

    const priceHeight = doc.heightOfString(priceText, {
      width: priceWidth - 10,
      lineGap: 2,
    });

    const rowHeight = Math.max(textTotalHeight, priceHeight) + rowPadding * 2;

    if (y + rowHeight > pageHeight - margin) {
      y += HEADER_SPACING;
      drawTableBorder(tableStartY, y);

      doc.addPage();

      y = drawMainHeader(margin);

      y = drawSectionHeader({
        doc,
        y,
        margin,
        contentWidth,
        title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
        options: { fullWidth: true },
      });

      doc.font("regular").fontSize(FONT_SIZE).fillColor(PDF_COLORS.GRAY);

      drawTableHeader(y);
      y += HEADER_SPACING;
      tableStartY = y - HEADER_SPACING;
    }

    const rowStartY = y;

    doc
      .font(option.isBold ? "bold" : "regular")
      .fontSize(FONT_SIZE)
      .fillColor(PDF_COLORS.GRAY)
      .text(displayText, detailX + 20, rowStartY + rowPadding, {
        width: detailWidth - 30,
        lineGap: 2,
        continued: !!option.description,
      });

    if (option.description) {
      doc
        .font("regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY)
        .text(` ${option.description}`, {
          width: detailWidth - 30,
          lineGap: 2,
        });
    }

    if (price !== undefined) {
      doc
        .font(option.isBold ? "bold" : "regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GREEN)
        .text(priceText, priceX, rowStartY + rowPadding, {
          width: priceWidth - 10,
          align: "right",
          lineGap: 2,
        });
    }

    y = doc.y + rowPadding;
    doc.y = y;
  };

  /* ---------------- MAIN PACKAGE ---------------- */

  if (pdfData.mainPackageSection?.details?.length) {
    renderRow(label.MAIN_PACKAGE_LABEL, undefined, { isBold: true });

    renderRow(pdfData.mainPackageSection.title ?? "-", undefined, {
      bullet: true,
    });

    pdfData.mainPackageSection.details.forEach((item: Detail) => {
      renderRow(item.text, item.price, { bullet: true });
    });
  }

  if (
    pdfData.mainPackageSection?.details?.length &&
    pdfData.onTopDetailSection?.length
  ) {
    y = drawDivider({
      doc,
      y,
      margin,
      contentWidth,
      spaceBefore: 20,
      spaceAfter: 6,
    });
  }

  /* ---------------- ON TOP PACKAGE ---------------- */

  if (pdfData.onTopDetailSection?.length) {
    renderRow(label.ONTOP_PACKAGE_LABEL, undefined, { isBold: true });

    /* ---- helper: calculate section height ---- */

    const getSectionHeight = (section: Section) => {
      let height = 0;

      const titleText = section.description
        ? `• ${section.title} ${section.description}`
        : `• ${section.title}`;

      height +=
        doc.heightOfString(titleText, {
          width: detailWidth - 30,
          lineGap: 2,
        }) +
        rowPadding * 2;

      section.details.forEach((item) => {
        const textHeight = doc.heightOfString(item.text, {
          width: detailWidth - 30,
          lineGap: 2,
        });

        height += textHeight + rowPadding * 2;
      });

      return height;
    };

    pdfData.onTopDetailSection.forEach((section: Section) => {
      const sectionHeight = getSectionHeight(section);

      if (y + sectionHeight > pageHeight - margin) {
        y += HEADER_SPACING;
        drawTableBorder(tableStartY, y);

        doc.addPage();

        y = drawMainHeader(margin);

        y = drawSectionHeader({
          doc,
          y,
          margin,
          contentWidth,
          title: label.REQUEST_REGISTRATION_INTERNET_TITLE,
          options: { fullWidth: true },
        });

        doc.font("regular").fontSize(FONT_SIZE).fillColor(PDF_COLORS.GRAY);

        drawTableHeader(y);
        y += HEADER_SPACING;
        tableStartY = y - HEADER_SPACING;
      }

      renderRow(section.title, undefined, {
        isBold: true,
        description: section.description,
        bullet: true,
      });

      section.details.forEach((item: Detail) => {
        renderRow(`   ${item.text}`, item.price, { bullet: false });
      });
    });
  }

  /* ---------------- CLOSE TABLE ---------------- */

  y += HEADER_SPACING;
  drawTableBorder(tableStartY, y);

  return y;
}
