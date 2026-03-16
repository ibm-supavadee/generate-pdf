import { FONT_SIZE, PDF_COLORS } from "../../constants/pdf.constants";

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
  const HEADER_SPACING = 10;
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

      if (/<(?:b|strong)>/.test(part)) {
        const text = part
          .replace(/<(?:b|strong)>|<\/(?:b|strong)>/gi, "")
          .replace(/<[^>]+>/g, "");

        segments.push({ text, bold: true });
      } else if (/<a/.test(part)) {
        const link = part.match(/href="([^"]+)"/)?.[1];
        const text = part.replace(/<[^>]+>/g, "");

        segments.push({ text, bold: false, link });
      } else {
        const text = part.replace(/<[^>]+>/g, "");
        segments.push({ text, bold: false });
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
    const plain = raw.replace(/<[^>]+>/g, "").trim();

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

  /* ---------- extract td ---------- */

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
    /* ---------- blank line ---------- */

    if (!content || content === "&nbsp;") {
      //   y += 12;
      continue;
    }

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

    /* ---------- article (indent) ---------- */

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
