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
  const LINK = "#0b66d6";
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

  const drawText = (
    rawBlock: string,
    {
      fontSize = 11,
      baseBold = false,
      firstLineIndent = 0,
      hangingIndent = 0, // ระยะเยื้องรวมของ List ชั้นนั้นๆ
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
    const plainText = rawBlock.replace(/<[^>]+>/g, "").trim();

    // กำหนดระยะที่ข้อความจะเริ่ม (ชิดซ้ายสุด + ระยะเยื้องของชั้นนั้น)
    // สำหรับชั้นแรก (Top-level) hangingIndent จะเท่ากับระยะที่เผื่อไว้ให้ตัวเลขพอดี
    const xPos = margin + hangingIndent + 2;
    const availableWidth = contentWidth - hangingIndent;

    const height = doc.heightOfString(plainText, {
      width: availableWidth,
      indent: firstLineIndent,
    });

    ensureSpace(height + spacing);

    doc
      .fontSize(fontSize)
      .fillColor(link ? LINK : PDF_COLORS?.GRAY || "#333333");

    if (bullet) {
      const isNumber = /^\d+\./.test(bullet);
      const width = isNumber ? NUMBER_WIDTH : BULLET_WIDTH;

      const bulletX =
        margin + (hangingIndent > width ? hangingIndent - width : 0);

      doc.font("regular").text(bullet, bulletX, y, {
        width,
        align: "left",
      });
    }

    const parts = rawBlock.split(/(<(?:b|strong)>.*?<\/(?:b|strong)>)/gi);
    doc.text("", xPos, y, { continued: true, indent: firstLineIndent });

    parts.forEach((part, index) => {
      if (!part) return;
      const isLast = index === parts.length - 1;
      let textSegment = part;
      let isBold = baseBold;

      if (part.match(/<(?:b|strong)>(.*?)<\/(?:b|strong)>/i)) {
        isBold = true;
        textSegment = part.replace(/<(?:b|strong)>|<\/(?:b|strong)>/gi, "");
      } else {
        textSegment = part.replace(/<[^>]+>/g, "");
      }

      if (!textSegment && !isLast) return;

      doc
        .font(isBold ? "bold" : "regular")
        .fillColor(link ? LINK : PDF_COLORS?.GRAY || "#333333")
        .text(textSegment, {
          width: availableWidth,
          align,
          link,
          underline: !!link,
          continued: !isLast,
        });
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
        y += 10; // padding ก่อน remark
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
