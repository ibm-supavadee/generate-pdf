import PDFDocument from "pdfkit";

export function renderHtmlToPdfKit(
  doc: PDFKit.PDFDocument,
  html: string,
  options: {
    margin: number;
    pageWidth: number;
    pageHeight: number;
    ensureSpace: (height: number) => void;
    startY: number;
  },
) {
  const { margin, pageWidth, ensureSpace } = options;
  const GRAY = "#666";

  let y = options.startY;
  const contentWidth = pageWidth - margin * 2;

  const clean = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\r/g, "");

  const blocks = clean
    .replace(/<\/tr>/g, "\n")
    .replace(/<\/td>/g, "\n")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const drawText = (
    text: string,
    {
      bold = false,
      indent = 0,
      bullet,
      link,
    }: {
      bold?: boolean;
      indent?: number;
      bullet?: string;
      link?: string;
    } = {},
  ) => {
    const x = margin + indent;

    const finalText = bullet ? `${bullet} ${text}` : text;

    const height = doc.heightOfString(finalText, {
      width: contentWidth - indent,
    });

    ensureSpace(height + 2);

    doc
      .font(bold ? "bold" : "regular")
      .fontSize(9)
      .fillColor(link ? "#0b66d6" : GRAY)
      .text(finalText, x, y, {
        width: contentWidth - indent,
        link,
        underline: !!link,
      });

    y = doc.y + 2;
  };

  for (const block of blocks) {
    const text = block.replace(/<[^>]+>/g, "").trim();

    if (!text) continue;

    if (block.includes("conditions-header")) {
      drawText(text, { bold: true });
      y += 4;
      continue;
    }

    if (block.includes("conditions-section")) {
      drawText(text, { bold: true });
      continue;
    }

    if (block.includes("conditions-article-sub1")) {
      drawText(text, { indent: 30 });
      continue;
    }

    if (block.includes("<li")) {
      drawText(text, {
        indent: 20,
        bullet: "•",
      });
      continue;
    }

    const linkMatch = block.match(/href="([^"]+)"/);

    if (linkMatch) {
      drawText(text, {
        link: linkMatch[1],
      });
      continue;
    }

    drawText(text);
  }

  return y;
}
