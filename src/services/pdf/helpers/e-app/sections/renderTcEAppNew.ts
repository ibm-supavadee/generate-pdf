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

export function renderTcEAppNew({
  doc,
  html,
  y,
  margin,
  pageWidth,
  pageHeight,
  drawHeader,
}: Params): number {
  const contentWidth = pageWidth - margin * 2;

  /* ---------- page break ---------- */

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

  const drawText = (
    raw: string,
    {
      align = "left",
      bold = false,
      indent = 0,
      spacing = 6,
    }: {
      align?: "left" | "center";
      bold?: boolean;
      indent?: number;
      spacing?: number;
    } = {},
  ) => {
    const plain = toText(raw);
    if (!plain) return;

    const height = doc.heightOfString(plain, {
      width: contentWidth - indent,
    });

    ensureSpace(height + spacing);

    const segments = parseSegments(raw);

    segments.forEach((seg, i) => {
      const isFirst = i === 0;
      const isLast = i === segments.length - 1;

      const isBold = bold || seg.bold;
      const isLink = !!seg.link;

      doc
        .fontSize(FONT_SIZE)
        .font(isBold ? "bold" : "regular")
        .fillColor(isLink ? PDF_COLORS.LINK : PDF_COLORS.GRAY);

      if (isFirst) {
        doc.text(seg.text, margin, y, {
          width: contentWidth,
          align,
          link: seg.link,
          underline: isLink,
          indent,
          continued: !isLast,
        });
      } else {
        doc.text(seg.text, {
          width: contentWidth,
          align,
          link: seg.link,
          underline: isLink,
          continued: !isLast,
        });
      }
    });

    y = doc.y + spacing;
  };

  /* ---------- extract td (KEEP STRUCTURE) ---------- */

  const blocks =
    html.match(/<td[\s\S]*?<\/td>/gi)?.map((td) => {
      const className = td.match(/class="([^"]+)"/i)?.[1] || "";

      const content = td
        .replace(/<td[^>]*>/i, "")
        .replace(/<\/td>/i, "")
        .trim();

      return {
        className,
        content,
      };
    }) || [];

  /* ---------- render ---------- */

  for (const block of blocks) {
    const { className, content } = block;

    /* ---------- skip blank ---------- */

    const plain = toText(content);
    if (!plain) continue;

    /* ---------- header ---------- */

    if (className.includes("conditions-header")) {
      drawText(content, {
        align: "center",
        bold: true,
      });
      continue;
    }

    /* ---------- title ---------- */

    if (className.includes("conditions-title")) {
      drawText(content, {
        bold: true,
      });
      continue;
    }

    /* ---------- article ---------- */

    if (className.includes("conditions-article")) {
      drawText(content, {
        indent: 30,
      });
      continue;
    }

    /* ---------- default ---------- */

    drawText(content);
  }

  return y;
}
