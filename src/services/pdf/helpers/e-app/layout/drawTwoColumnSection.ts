type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;

  leftRatio: number;
  rightRatio: number;
  gap?: number;
  height?: number;

  drawLeft: (x: number, y: number, width: number) => number;
  drawRight: (x: number, y: number, width: number) => number;
};

export function drawTwoColumnSection({
  doc,
  y,
  margin,
  contentWidth,
  leftRatio,
  rightRatio,
  gap = 20,
  height,
  drawLeft,
  drawRight,
}: Params): number {
  const leftWidth = contentWidth * leftRatio - gap / 2;
  const rightWidth = contentWidth * rightRatio - gap / 2;

  const leftX = margin;
  const rightX = margin + leftWidth + gap;

  const startY = y;

  const leftY = drawLeft(leftX, startY, leftWidth);
  const rightY = drawRight(rightX, startY, rightWidth);

  if (height) {
    return startY + height;
  }

  return Math.max(leftY, rightY);
}
