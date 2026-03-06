import { PDF_COLORS } from "../pdf.constants";

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

export function renderTcExisting({
  doc,
  html,
  y,
  margin,
  pageWidth,
  pageHeight,
  drawHeader,
}: Params): number {
  const HEADER_SPACING = 10;
  const BULLET_WIDTH = 6;
  const NUMBER_WIDTH = 14;

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

        segments.push({
          text,
          bold: true,
        });
      } else if (/<a/.test(part)) {
        const link = part.match(/href="([^"]+)"/)?.[1];

        const text = part.replace(/<[^>]+>/g, "");

        segments.push({
          text,
          bold: false,
          link,
        });
      } else {
        const text = part.replace(/<[^>]+>/g, "");

        segments.push({
          text,
          bold: false,
        });
      }
    }

    return segments;
  };

  /* ---------- draw text ---------- */

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

    const height = doc.heightOfString(plainText, {
      width: availableWidth,
    });

    ensureSpace(height + spacing);

    const startY = y;

    /* draw bullet / number */

    if (bullet) {
      const isNumber = /^\d+\./.test(bullet);

      const width = isNumber ? NUMBER_WIDTH : BULLET_WIDTH;

      const bulletX =
        margin + (hangingIndent > width ? hangingIndent - width : 0);

      doc
        .font("regular")
        .fontSize(fontSize)
        .fillColor(PDF_COLORS.GRAY)
        .text(bullet, bulletX, startY, {
          width,
        });

      y = startY;
    }

    const segments = parseSegments(rawBlock);

    const nonEmpty = segments.filter(
      (s) => s.text.trim() !== "" || s.text.includes(" "),
    );

    if (nonEmpty.length === 0) {
      y += spacing;
      return;
    }

    nonEmpty.forEach((seg, i) => {
      const isFirst = i === 0;
      const isLast = i === nonEmpty.length - 1;

      const isBold = baseBold || seg.bold;
      const segLink = seg.link;
      const isLink = !!segLink;

      doc
        .fontSize(fontSize)
        .font(isBold ? "bold" : "regular")
        .fillColor(isLink ? PDF_COLORS.LINK : PDF_COLORS.GRAY);

      if (isFirst) {
        doc.text(seg.text, xPos, y, {
          width: availableWidth,
          align,
          link: segLink,
          underline: isLink,
          indent: firstLineIndent,
          continued: !isLast,
        });
      } else {
        doc.text(seg.text, {
          width: availableWidth,
          align,
          link: segLink,
          underline: isLink,
          continued: !isLast,
        });
      }
    });

    y = doc.y + spacing;
  };

  /* ---------- clean html ---------- */

  const cleaned = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\r/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/ol>/gi, "\n</ol>\n")
    .replace(/<\/ul>/gi, "\n</ul>\n");

  const blocks = cleaned
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  /* ---------- list state ---------- */

  let listStack: { type: "ol" | "ul"; index: number }[] = [];

  let lastIndent = 0;

  /* ---------- parser ---------- */

  for (const block of blocks) {
    if (block.startsWith("<ol")) {
      listStack.push({ type: "ol", index: 1 });
      continue;
    }

    if (block.startsWith("<ul")) {
      listStack.push({ type: "ul", index: 0 });
      continue;
    }

    if (block === "</ol>" || block === "</ul>") {
      listStack.pop();
      continue;
    }

    /* detect link */

    const link = block.match(/href="([^"]+)"/)?.[1];

    /* detect bold */

    const isBold = /<(b|strong)>/i.test(block);

    /* detect indent from &nbsp; */

    const nbspCount = (block.match(/&nbsp;/g) || []).length;

    const extraIndent = nbspCount * 8;

    /* remove nbsp from text */

    const cleanedBlock = block.replace(/&nbsp;/g, "");

    const currentList = listStack[listStack.length - 1];

    const isNoBullet = /list-style-type\s*:\s*none/i.test(block);

    /* ---------- list item ---------- */

    if (block.includes("<li")) {
      const hangingIndent = listStack.length * 16;

      lastIndent = hangingIndent;

      const isNoBullet = /list-style-type\s*:\s*none/i.test(block);

      if (currentList?.type === "ol") {
        drawText(cleanedBlock, {
          bullet: isNoBullet ? undefined : `${currentList.index}.`,
          hangingIndent,
          firstLineIndent: extraIndent,
          link,
          baseBold: isBold,
        });

        currentList.index++;
      } else {
        drawText(cleanedBlock, {
          bullet: isNoBullet ? undefined : "•",
          hangingIndent,
          firstLineIndent: extraIndent,
          link,
          baseBold: isBold,
        });
      }

      continue;
    }

    /* ---------- continuation inside list ---------- */

    if (listStack.length > 0) {
      drawText(cleanedBlock, {
        hangingIndent: lastIndent,
        firstLineIndent: extraIndent,
        link,
        baseBold: isBold,
      });

      continue;
    }

    /* ---------- center title ---------- */

    if (block.includes("<center>")) {
      drawText(cleanedBlock, {
        align: "center",
        fontSize: 12,
        baseBold: true,
      });

      continue;
    }

    /* ---------- normal text ---------- */

    drawText(cleanedBlock, {
      firstLineIndent: extraIndent,
      link,
      baseBold: isBold,
    });
  }

  return y;
}
