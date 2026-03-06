import { PDF_COLORS } from "./constants";

export function renderHtmlToPdfKit(
  doc: PDFKit.PDFDocument,
  html: string,
  options: {
    margin: number;
    pageWidth: number;
    pageHeight: number;
    startY: number;
    drawHeader: (y: number) => number;
  },
) {
  const { margin, pageWidth, pageHeight } = options;
  const HEADER_SPACING = 10;
  const BULLET_WIDTH = 6;
  const NUMBER_WIDTH = 14;
  let y = options.startY;
  const contentWidth = pageWidth - margin * 2;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = options.drawHeader(margin) + HEADER_SPACING;
    }
  };

  const clean = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\r/g, "")
    .replace(/<br\s*\/?>/gi, "\n");

  const blocks = clean
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "\n")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  /* List State Management */
  let listStack: { type: "ul" | "ol"; index: number; styleNone: boolean }[] =
    [];

  // Parse a raw HTML block into segments: { text, bold, link? }
  type Segment = { text: string; bold: boolean; link?: string };

  const parseSegments = (rawBlock: string): Segment[] => {
    const segments: Segment[] = [];
    // Split on bold tags and anchor tags
    const parts = rawBlock.split(
      /(<(?:b|strong)>[\s\S]*?<\/(?:b|strong)>|<a[\s\S]*?<\/a>)/gi,
    );

    for (const part of parts) {
      if (!part) continue;

      if (part.match(/<(?:b|strong)>[\s\S]*?<\/(?:b|strong)>/i)) {
        const text = part
          .replace(/<(?:b|strong)>|<\/(?:b|strong)>/gi, "")
          .replace(/<[^>]+>/g, "");
        if (text) segments.push({ text, bold: true });
      } else if (part.match(/<a[\s\S]*?<\/a>/i)) {
        const hrefMatch = part.match(/href="([^"]+)"/);
        const link = hrefMatch?.[1];
        const text = part.replace(/<[^>]+>/g, "").trim();
        if (text) segments.push({ text, bold: false, link });
      } else {
        const text = part.replace(/<[^>]+>/g, "");
        if (text) segments.push({ text, bold: false });
      }
    }

    return segments;
  };

  const drawText = (
    rawBlock: string,
    {
      fontSize = 11,
      baseBold = false,
      firstLineIndent = 0,
      hangingIndent = 0,
      bullet,
      link,
      align = "left",
      spacing = 2,
    }: {
      fontSize?: number;
      baseBold?: boolean;
      firstLineIndent?: number;
      hangingIndent?: number;
      bullet?: string;
      link?: string;
      align?: "left" | "center" | "right";
      spacing?: number;
    } = {},
  ) => {
    const plainText = rawBlock
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();

    const xPos = margin + hangingIndent + 2;
    const availableWidth = contentWidth - hangingIndent;

    // Measure height using the plain text
    const height = doc.heightOfString(plainText, {
      width: availableWidth,
      indent: firstLineIndent,
    });

    ensureSpace(height + spacing);

    // Draw bullet/number if needed
    if (bullet) {
      const isNumber = /^\d+\./.test(bullet);
      const width = isNumber ? NUMBER_WIDTH : BULLET_WIDTH;
      const bulletX =
        margin + (hangingIndent > width ? hangingIndent - width : 0);

      doc
        .fontSize(fontSize)
        .font("regular")
        .fillColor(PDF_COLORS?.GRAY || "#333333")
        .text(bullet, bulletX, y, {
          width,
          align: "left",
        });

      // After bullet text(), doc.y may have advanced — reset y to where we started
      // We'll manage y manually
    }

    // Parse segments
    const segments = parseSegments(rawBlock);

    // Filter out empty segments
    const nonEmpty = segments.filter(
      (s) => s.text.trim() !== "" || s.text.includes(" "),
    );

    if (nonEmpty.length === 0) {
      y += spacing;
      return;
    }

    // Render all segments inline
    // Only the first segment gets explicit x, y coordinates
    // All intermediate segments use continued: true
    // The last segment uses continued: false to finalize the line
    nonEmpty.forEach((seg, i) => {
      const isFirst = i === 0;
      const isLast = i === nonEmpty.length - 1;

      const isBold = baseBold || seg.bold;
      const segLink = seg.link ?? link;
      const isLink = !!segLink;

      doc
        .fontSize(fontSize)
        .font(isBold ? "bold" : "regular")
        .fillColor(isLink ? PDF_COLORS.LINK : PDF_COLORS?.GRAY || "#333333");

      if (isFirst) {
        doc.text(seg.text, xPos, y, {
          width: availableWidth,
          align,
          link: segLink,
          underline: isLink,
          indent: firstLineIndent,
          continued: !isLast,
          lineBreak: true,
        });
      } else {
        doc.text(seg.text, {
          width: availableWidth,
          align,
          link: segLink,
          underline: isLink,
          continued: !isLast,
          lineBreak: true,
        });
      }
    });

    y = doc.y + spacing;
  };

  let lastLiIndent = 0;

  /* HTML parser */
  for (const block of blocks) {
    if (/<ol/i.test(block)) {
      listStack.push({ type: "ol", index: 1, styleNone: false });
      continue;
    }
    if (/<ul/i.test(block)) {
      const isNone = /list-style\s*:\s*none/i.test(block);
      listStack.push({ type: "ul", index: 0, styleNone: isNone });
      continue;
    }
    if (/<\/ol>/i.test(block) || /<\/ul>/i.test(block)) {
      listStack.pop();
      continue;
    }

    const currentList = listStack[listStack.length - 1];
    const linkMatch = block.match(/href="([^"]+)"/);
    const link = linkMatch?.[1];

    if (!block.replace(/<[^>]+>/g, "").trim()) continue;

    if (/<li/i.test(block)) {
      const indentLevel = listStack.length * 12;
      lastLiIndent = indentLevel;

      const liNoBullet =
        currentList?.styleNone || /list-style-type\s*:\s*none/i.test(block);

      if (currentList?.type === "ol") {
        drawText(block, {
          bullet: `${currentList.index}.`,
          hangingIndent: indentLevel,
        });
        currentList.index++;
      } else if (currentList?.type === "ul") {
        drawText(block, {
          bullet: liNoBullet ? undefined : "•",
          hangingIndent: indentLevel,
        });
      } else {
        drawText(block);
      }

      continue;
    }

    // continuation line after <br> inside <li>
    if (listStack.length > 0 && !block.includes("<li")) {
      drawText(block, {
        hangingIndent: lastLiIndent,
      });
      continue;
    }

    if (block.includes("conditions-header")) {
      if (block.includes("ข้อตกลง")) y += 15;
      drawText(block, {
        fontSize: 12,
        baseBold: true,
        align: "center",
        spacing: 1,
      });
    } else if (block.includes("conditions-section")) {
      const isRemark = block.includes("หมายเหตุ");

      if (isRemark) {
        y += 10;
      }

      drawText(block, { fontSize: 12, baseBold: true, spacing: 3 });
    } else if (block.includes("conditions-article-sub1")) {
      drawText(block, { firstLineIndent: 55 });
    } else if (block.includes("conditions-article")) {
      drawText(block, { firstLineIndent: 28 });
    } else {
      drawText(block, { link });
    }
  }

  return y;
}
