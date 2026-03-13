import { PDF_COLORS, SECTION_GAP_SMALL } from "../../constants/pdf.constants";

type Row = [string?, string?, string?, string?];

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  rows: Row[];
  ensureSpace: (height: number) => void;
  leftLabelX: number;
  leftValueX: number;
  rightLabelX: number;
  rightValueX: number;
};

export function drawCustomerInfoRows({
  doc,
  y,
  rows,
  ensureSpace,
  leftLabelX,
  leftValueX,
  rightLabelX,
  rightValueX,
}: Params): number {
  const rowSpacing = 18;

  const drawField = (
    labelText: string | undefined,
    value: string | undefined,
    labelX: number,
    valueX: number,
  ) => {
    if (!labelText) return;

    doc.font("bold").fillColor(PDF_COLORS.GRAY).text(labelText, labelX, y);

    doc
      .font("regular")
      .fillColor(PDF_COLORS.GREEN)
      .text(value ?? "", valueX, y, { width: 160 });
  };

  rows.forEach(([lLabel, lValue, rLabel, rValue]) => {
    ensureSpace(rowSpacing);

    drawField(lLabel, lValue, leftLabelX, leftValueX);
    drawField(rLabel, rValue, rightLabelX, rightValueX);

    y += rowSpacing;
  });

  return y + SECTION_GAP_SMALL;
}
