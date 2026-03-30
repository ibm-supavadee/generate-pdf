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
  link?: string;
};

export function renderTcEAppExisting({
  doc,
  html,
  y,
  margin,
  pageWidth,
  pageHeight,
  drawHeader,
}: Params): number {
  const contentWidth = pageWidth - margin * 2;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = drawHeader(margin) + HEADER_SPACING;
    }
  };

  /* ---------- parse bold / link ---------- */

  const parseSegments = (raw: string): Segment[] => {
    const segments: Segment[] = [];

    const parts = raw.split(
      /(<(?:b|strong)>[\s\S]*?<\/(?:b|strong)>|<a[\s\S]*?<\/a>)/gi,
    );

    for (const part of parts) {
      if (!part) continue;

      const clean = toText(part);
      if (!clean) continue;

      if (/<(?:b|strong)>/.test(part)) {
        segments.push({ text: clean, bold: true });
      } else if (/<a/.test(part)) {
        const link = part.match(/href="([^"]+)"/)?.[1];

        if (clean) {
          const prev = segments[segments.length - 1];

          const text =
            prev && !prev.text.endsWith(" ") && !clean.startsWith(" ")
              ? " " + clean
              : clean;

          segments.push({ text, bold: false, link });
        }
      } else {
        segments.push({ text: clean, bold: false });
      }
    }

    return segments;
  };

  /* ---------- draw text ---------- */

  const drawText = (rawBlock: string) => {
    const nbspCount = (rawBlock.match(/&nbsp;/g) || []).length;
    const indent = nbspCount * 6;

    const cleaned = rawBlock.replace(/&nbsp;/g, "");

    const plainText = toText(cleaned);
    if (!plainText) return;

    const height = doc.heightOfString(plainText, {
      width: contentWidth,
    });

    ensureSpace(height);

    const segments = parseSegments(cleaned);

    segments.forEach((seg, i) => {
      const isLast = i === segments.length - 1;
      const isLink = !!seg.link;

      doc
        .font(seg.bold ? "bold" : "regular")
        .fontSize(FONT_SIZE)
        .fillColor(isLink ? PDF_COLORS.LINK : PDF_COLORS.GRAY);

      const continued = !isLast;

      if (i === 0) {
        doc.text(seg.text, margin, y, {
          width: contentWidth,
          indent: indent,
          continued,
          link: seg.link,
          underline: isLink,
        });
      } else {
        doc.text(seg.text, {
          continued,
          link: seg.link,
          underline: isLink,
        });
      }
    });

    y = doc.y + 6;
  };

  /* ---------- clean html  ---------- */

  const cleaned = html.replace(/\r/g, "").replace(/<br\s*\/?>/gi, "\n");

  const blocks = cleaned
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  /* ---------- render ---------- */

  blocks.forEach((block) => {
    drawText(block);
  });

  return y;
}
