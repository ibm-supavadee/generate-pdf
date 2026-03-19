import { FONT_SIZE, PDF_COLORS } from "../../constants/pdf.constants";
import { getDisplayDate } from "../utils/displayDate";

type Options = {
  withDivider?: boolean;
  fullWidth?: boolean;
  width?: number;
  isShowDate?: boolean;
};

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  title: string;
  options?: Options;
};

export function drawSectionHeader({
  doc,
  y,
  margin,
  contentWidth,
  title,
  options,
}: Params): number {
  const { withDivider = false, fullWidth = false, width } = options || {};

  const paddingX = 10;
  const boxHeight = 24;

  doc.font("regular").fontSize(14);

  const textWidth = doc.widthOfString(title);
  const textHeight = doc.currentLineHeight();

  let boxWidth: number;

  if (width) boxWidth = width;
  else if (fullWidth) boxWidth = contentWidth;
  else boxWidth = textWidth + paddingX * 2;

  /* GREEN TITLE BOX */
  doc.rect(margin, y, boxWidth, boxHeight).fill(PDF_COLORS.GREEN);

  doc.fillColor("white").font("regular");

  if (fullWidth) {
    doc.text(title, margin + paddingX, y + (boxHeight - textHeight) / 2);
  } else {
    doc.text(
      title,
      margin + (boxWidth - textWidth) / 2,
      y + (boxHeight - textHeight) / 2,
    );
  }

  /* DATE ON RIGHT */
  if (options?.isShowDate) {
    const date = new Date().toLocaleDateString();
    const displayDate = getDisplayDate(date, "TH");

    doc
      .fillColor(PDF_COLORS.GRAY)
      .font("regular")
      .fontSize(FONT_SIZE)
      .text(displayDate, margin, y + 4, {
        width: contentWidth - 10,
        align: "right",
      });
  }

  /* DIVIDER */
  if (withDivider) {
    const dividerY = y + boxHeight + 0.5;

    doc
      .moveTo(margin, dividerY)
      .lineTo(margin + contentWidth, dividerY)
      .strokeColor(PDF_COLORS.GREEN)
      .lineWidth(1)
      .stroke();
  }

  y += boxHeight;

  doc.font("regular").fontSize(FONT_SIZE).fillColor(PDF_COLORS.GRAY);

  return y;
}
