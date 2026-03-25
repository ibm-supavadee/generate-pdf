type TwoColumnParams = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  leftRatio: number;
  rightRatio: number;
  drawLeft: (x: number, y: number, width: number) => number;
  drawRight: (x: number, y: number, width: number) => number;
  afterDraw?: (
    leftEndY: number,
    rightEndY: number,
    leftX: number,
    rightX: number,
    colWidth: number,
    startY: number,
  ) => number;
};

export function drawTwoColumnSection({
  doc,
  y,
  margin,
  contentWidth,
  leftRatio,
  rightRatio,
  drawLeft,
  drawRight,
  afterDraw,
}: TwoColumnParams): number {
  const gap = 10;
  const leftWidth = contentWidth * leftRatio - gap / 2;
  const rightWidth = contentWidth * rightRatio - gap / 2;
  const rightX = margin + leftWidth + gap;
  const startY = y;

  const leftEndY = drawLeft(margin, y, leftWidth);
  const rightEndY = drawRight(rightX, y, rightWidth);

  if (afterDraw) {
    return afterDraw(leftEndY, rightEndY, margin, rightX, leftWidth, startY);
  }

  return Math.max(leftEndY, rightEndY);
}
