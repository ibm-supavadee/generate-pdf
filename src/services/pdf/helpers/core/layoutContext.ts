type CreateLayoutContextParams = {
  doc: PDFKit.PDFDocument;
  margin: number;
  pageHeight: number;
  drawHeader: (y: number) => number;
};

export type LayoutContext = {
  ensureSpace: (height: number) => number;
  setY: (value: number) => void;
  getY: () => number;
};

export function createLayoutContext({
  doc,
  margin,
  pageHeight,
  drawHeader,
}: CreateLayoutContextParams): LayoutContext {
  let y = margin;

  const ensureSpace = (height: number): number => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = drawHeader(margin);
    }
    return y;
  };

  const setY = (value: number): void => {
    y = value;
  };

  const getY = (): number => y;

  return { ensureSpace, setY, getY };
}
