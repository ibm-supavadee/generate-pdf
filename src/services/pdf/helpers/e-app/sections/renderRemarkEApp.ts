import {
  FONT_SIZE,
  HEADER_SPACING,
  PDF_COLORS,
} from "../../../constants/pdf.constants";
import { toText } from "../../shared/htmlToText";

type Params = {
  doc: PDFKit.PDFDocument;
  html: string;
  y: number;
  margin: number;
  pageWidth: number;
  pageHeight: number;
  drawHeader: (y: number) => number;
};

type Segment = {
  text: string;
  bold: boolean;
};

export function renderRemarkEApp({
  doc,
  html,
  y,
  margin,
  pageWidth,
  pageHeight,
  drawHeader,
}: Params): number {
  const contentWidth = pageWidth - margin * 2;
  const LINE_SPACING = 2;

  /* ---------- page break ---------- */

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = drawHeader(margin) + HEADER_SPACING;
    }
  };

  /* ---------- parse bold ---------- */

  const parseSegments = (raw: string): Segment[] => {
    const segments: Segment[] = [];

    const parts = raw.split(/(<(?:b|strong)>[\s\S]*?<\/(?:b|strong)>)/gi);

    for (const part of parts) {
      if (!part) continue;

      const clean = toText(part);
      if (!clean) continue;

      if (/<(?:b|strong)>/.test(part)) {
        segments.push({ text: clean, bold: true });
      } else {
        segments.push({ text: clean, bold: false });
      }
    }

    return segments;
  };

  /* ---------- keep structure, only normalize ---------- */

  const cleaned = html.replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n");

  const blocks = cleaned
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  y += HEADER_SPACING;

  for (const block of blocks) {
    const nbspCount = (block.match(/&nbsp;/g) || []).length;
    const indent = nbspCount * 4;

    const cleanedBlock = block.replace(/&nbsp;/g, "");

    /* ---------- detect list marker ---------- */

    const markerMatch = cleanedBlock.match(/^([0-9]+\.|[a-zA-Z]\.)\s+/);

    let marker = "";
    let textPart = cleanedBlock;
    let textIndent = 0;

    if (markerMatch) {
      marker = markerMatch[1];
      textPart = cleanedBlock.slice(markerMatch[0].length);

      textIndent = doc.widthOfString(marker + " ");
    }

    const segments = parseSegments(textPart);

    const plain = toText(textPart);
    if (!plain) continue;

    const width = contentWidth - indent;

    const height = doc.heightOfString(plain, {
      width: width - textIndent,
    });

    ensureSpace(height);

    const x = margin + indent;

    /* ---------- draw marker ---------- */

    if (marker) {
      doc
        .font("regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY)
        .text(marker, x, y);
    }

    const textX = x + textIndent;

    /* ---------- draw text ---------- */

    segments.forEach((seg, i) => {
      const isLast = i === segments.length - 1;

      doc
        .font(seg.bold ? "bold" : "regular")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY);

      if (i === 0) {
        doc.text(seg.text, textX, y, {
          width: width - textIndent,
          continued: !isLast,
        });
      } else {
        doc.text(seg.text, {
          width: width - textIndent,
          continued: !isLast,
        });
      }
    });

    y = doc.y + LINE_SPACING;
  }

  return y;
}
