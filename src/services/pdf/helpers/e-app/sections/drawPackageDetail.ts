import { EAPP_LABEL_TYPE, PRODUCT_OWNER } from "../../../../../constants/enum";
import {
  FONT_SIZE,
  FOOTER_HEIGHT,
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
  productOwner: PRODUCT_OWNER;
  pdfData: PdfData;
  label: EAPP_LABEL_TYPE;
  drawMainHeader: (margin: number) => number;
};

export function drawPackageDetail({
  doc,
  y,
  margin,
  contentWidth,
  pageHeight,
  productOwner,
  pdfData,
  label,
  drawMainHeader,
}: Params): number {
  const priceWidth = 70;
  const detailWidth = contentWidth - priceWidth;

  const detailX = margin;
  const priceX = margin + detailWidth;

  const rowPadding = 2;
  const lineGap = 2;

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
      indentLevel?: number;
      isHeader?: boolean;
    } = {},
  ) => {
    const baseIndent = 15;
    const indentLevel = option.indentLevel ?? 0;

    const BULLET_GAP = 10;
    const indent = baseIndent + indentLevel * 10;

    const BULLET_X = detailX + indent;

    const textX = option.isHeader ? BULLET_X : detailX + indent + BULLET_GAP;

    const textWidth = option.isHeader
      ? detailWidth - indent
      : detailWidth - indent - BULLET_GAP;

    const rowStartY = y;

    /* ---------------- HEIGHT CALC ---------------- */

    const titleHeight = doc.heightOfString(text, {
      width: textWidth,
      lineGap,
    });

    const descriptionHeight = option.description
      ? doc.heightOfString(` ${option.description}`, {
          width: textWidth,
          lineGap,
        })
      : 0;

    const estimatedHeight = titleHeight + descriptionHeight + rowPadding * 2;

    /* ---------------- PAGE BREAK ---------------- */

    if (y + estimatedHeight > pageHeight - margin - FOOTER_HEIGHT) {
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

    /* ---------------- BULLET ---------------- */

    const getBulletByLevel = (level: number) => {
      switch (level) {
        case 0:
          return "•";
        case 1:
          return "o";
        default:
          return "•";
      }
    };

    if (option.bullet) {
      const bulletChar = getBulletByLevel(indentLevel);

      doc
        .font("regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY)
        .text(bulletChar, BULLET_X, rowStartY + rowPadding);
    }

    /* ---------------- TEXT ---------------- */

    const textStartY = rowStartY + rowPadding;

    doc
      .font(option.isBold ? "bold" : "regular")
      .fontSize(FONT_SIZE)
      .fillColor(PDF_COLORS.GRAY)
      .text(text, textX, textStartY, {
        width: textWidth,
        lineGap,
        continued: !!option.description,
      });

    if (option.description) {
      doc
        .font("regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY)
        .text(` ${option.description}`, {
          width: textWidth,
          lineGap,
        });
    }

    const textEndY = doc.y;

    /* ---------------- PRICE ---------------- */

    let priceEndY = rowStartY;

    if (price !== undefined) {
      doc
        .font(option.isBold ? "bold" : "regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GREEN)
        .text(formatPriceText(price), priceX, rowStartY + rowPadding, {
          width: priceWidth - 10,
          align: "right",
          lineGap,
        });

      priceEndY = doc.y;
    }

    /* ---------------- FINAL Y ---------------- */

    const contentBottom = Math.max(textEndY, priceEndY);

    y = contentBottom + rowPadding;
    doc.y = y;
  };

  /* ---------------- RENDER DETAIL ---------------- */
  
  const renderDetail = (item: Detail, indentLevel = 0, showBullet = true) => {
    renderRow(item.text, item.price, {
      bullet: showBullet,
      indentLevel,
    });

    if (item.list?.length) {
      item.list.forEach((subItem) => {
        renderDetail(subItem, indentLevel + 1, true);
      });
    }
  };

  /* ---------------- MAIN PACKAGE ---------------- */

  if (pdfData.mainPackageSection?.details?.length) {
    const mainPackageLabel =
      productOwner === PRODUCT_OWNER.FBB
        ? label.MAIN_PACKAGE_FBB_LABEL
        : label.MAIN_PACKAGE_3BB_LABEL;

    renderRow(mainPackageLabel, undefined, {
      isBold: true,
      isHeader: true,
    });

    renderRow(pdfData.mainPackageSection.title ?? "-", undefined, {
      bullet: false,
      isHeader: true,
    });

    pdfData.mainPackageSection.details.forEach((item: Detail) => {
      renderDetail(item);
    });
  }

  /* ---------------- DIVIDER ---------------- */
  if (
    pdfData.mainPackageSection?.details?.length &&
    pdfData.onTopDetailSection?.length
  ) {
    y = drawDivider({
      doc,
      y,
      margin,
      contentWidth,
      spaceBefore: 10,
      spaceAfter: 6,
    });
  }

  /* ---------------- ON TOP PACKAGE ---------------- */

  if (pdfData.onTopDetailSection?.length) {
    renderRow(label.ONTOP_PACKAGE_LABEL, undefined, {
      isBold: true,
      isHeader: true,
    });

    pdfData.onTopDetailSection.forEach((section: Section) => {
      const estimate =
        doc.heightOfString(section.title, {
          width: detailWidth - 30,
          lineGap,
        }) + 40;

      if (y + estimate > pageHeight - margin - FOOTER_HEIGHT) {
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
        renderDetail(item, 0, false);
      });
    });
  }

  /* ---------------- CLOSE TABLE ---------------- */

  y += HEADER_SPACING;
  drawTableBorder(tableStartY, y);

  return y;
}
