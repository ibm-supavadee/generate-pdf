import { FONT_SIZE, PDF_COLORS } from "../../constants/pdf.constants";

type TermsObject = {
  packageInfo?: string[];
  remark?: string[];
};

type RenderTcEAppExistingParams = {
  doc: PDFKit.PDFDocument;
  texts: string[] | TermsObject;
  y: number;
  margin: number;
  contentWidth: number;
  ensureSpace: (height: number) => void;
  spacing?: number;
};

export function renderTcEAppExisting({
  doc,
  texts,
  y,
  margin,
  contentWidth,
  ensureSpace,
  spacing = 8,
}: RenderTcEAppExistingParams): number {
  const FIRST_LINE_INDENT = 30;

  doc.y = y;

  const urlRegex = /(www\.ais\.th\/(?:th\/|en\/)?about-us\/terms-and-legal)/;

  const processText = (text: string, isFirstPackageInfo: boolean) => {
    const cleanText = text?.trim();
    if (!cleanText) return;

    const height = doc.heightOfString(cleanText, {
      width: contentWidth,
    });

    ensureSpace(height + spacing);

    const indent = isFirstPackageInfo ? 0 : FIRST_LINE_INDENT;

    /* ---------- PACKAGE INFO (FIRST ROW) ---------- */
    if (isFirstPackageInfo) {
      doc
        .font("bold")
        .fontSize(FONT_SIZE)
        .fillColor(PDF_COLORS.GRAY)
        .text(cleanText, margin, doc.y, {
          width: contentWidth,
          indent,
        });
    } else {
      const match = cleanText.match(urlRegex);

      /* ---------- TEXT WITH URL ---------- */
      if (match) {
        const foundUrl = match[0];
        const parts = cleanText.split(foundUrl);

        doc.font("regular").fontSize(FONT_SIZE).fillColor(PDF_COLORS.GRAY);

        /* ---------- BEFORE URL ---------- */
        if (parts[0]) {
          doc.text(parts[0], margin, doc.y, {
            indent,
            continued: true,
          });
        } else {
          doc.x = margin + indent;
        }

        /* ---------- URL ---------- */
        doc.fillColor(PDF_COLORS.LINK).text(foundUrl, {
          link: `https://${foundUrl}`,
          underline: true,
          continued: parts[1] ? true : false,
        });

        /* ---------- AFTER URL ---------- */
        if (parts[1]) {
          doc.fillColor(PDF_COLORS.GRAY).text(parts[1], {
            link: null, // ยกเลิกความเป็น Link
            underline: false, // ปิดเส้นใต้
            continued: false,
          });
          /* ---------- TEXT WITHOUT URL ---------- */
        } else {
          doc.text("", { link: null, underline: false });
        }
      } else {
        doc
          .font("regular")
          .fontSize(FONT_SIZE)
          .fillColor(PDF_COLORS.GRAY)
          .text(cleanText, margin, doc.y, {
            width: contentWidth,
            lineGap: 1,
            indent,
          });
      }
    }

    doc.y += spacing;
  };

  /* ---------- PROCESS TEXTS ---------- */
  if (Array.isArray(texts)) {
    texts.forEach((t) => processText(t, false));
  } else {
    (texts.packageInfo ?? []).forEach((t, index) =>
      processText(t, index === 0),
    );
    (texts.remark ?? []).forEach((t) => processText(t, false));
  }

  return doc.y;
}
