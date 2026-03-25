type DrawResult = { endY: number; contentStartY: number };
type DrawFn = (x: number, y: number, width: number) => number | DrawResult;

type TwoColumnParams = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  leftRatio: number;
  rightRatio: number;
  height?: number;
  gap?: number;
  drawLeft: DrawFn;
  drawRight: DrawFn;
  afterDraw?: (
    left: DrawResult,
    right: DrawResult,
    leftX: number,
    rightX: number,
    colWidth: number,
  ) => number;
};

const toDrawResult = (
  result: number | DrawResult,
  fallbackStartY: number,
): DrawResult =>
  typeof result === "number"
    ? { endY: result, contentStartY: fallbackStartY }
    : result;

export function drawTwoColumnSection({
  y,
  margin,
  contentWidth,
  leftRatio,
  rightRatio,
  height,
  gap = 10,
  drawLeft,
  drawRight,
  afterDraw,
}: TwoColumnParams): number {
  const leftWidth = contentWidth * leftRatio - gap / 2;
  const rightWidth = contentWidth * rightRatio - gap / 2;
  const rightX = margin + leftWidth + gap;

  const left = toDrawResult(drawLeft(margin, y, leftWidth), y);
  const right = toDrawResult(drawRight(rightX, y, rightWidth), y);

  if (afterDraw) {
    return afterDraw(left, right, margin, rightX, leftWidth);
  }

  return Math.max(left.endY, right.endY);
}
