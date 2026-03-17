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

export function renderTcEAppExisting({
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

  console.log("html: ", html);

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

  const drawText = (rawBlock: string) => {
    const nbspCount = (rawBlock.match(/&nbsp;/g) || []).length;
    const indent = nbspCount * 6;

    const cleaned = rawBlock.replace(/&nbsp;/g, "");

    const plainText = cleaned.replace(/<[^>]+>/g, "").trim();

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

      const continued = !isLast && !isLink;

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
  /* ---------- clean html ---------- */

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
