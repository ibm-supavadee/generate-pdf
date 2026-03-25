type DrawResult = { endY: number; contentStartY: number };

type TwoColumnParams = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  leftRatio: number;
  rightRatio: number;
  drawLeft: (x: number, y: number, width: number) => DrawResult;
  drawRight: (x: number, y: number, width: number) => DrawResult;
  afterDraw?: (
    left: DrawResult,
    right: DrawResult,
    leftX: number,
    rightX: number,
    colWidth: number,
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

  const left = drawLeft(margin, y, leftWidth);
  const right = drawRight(rightX, y, rightWidth);

  if (afterDraw) {
    return afterDraw(left, right, margin, rightX, leftWidth);
  }

  return Math.max(left.endY, right.endY);
}
