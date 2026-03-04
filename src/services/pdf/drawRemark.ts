import { PDF_COLORS } from "./constants";

type Params = {
  doc: PDFKit.PDFDocument;
  y: number;
  margin: number;
  contentWidth: number;
  ensureSpace: (height: number) => void;
};

export function drawRemark({
  doc,
  y,
  margin,
  contentWidth,
  ensureSpace,
}: Params): number {
  const topSpacing = 15;

  const note = `*กรณียกเลิกบริการต้องส่งคืนอุปกรณ์ให้แก่ AWN ตามระยะเวลาและสถานที่ที่ AWN กำหนด หากไม่ส่งคืน ผู้ใช้บริการยินยอมชดใช้ค่าเสียหายตามมูลค่าอุปกรณ์
*หากยกเลิกก่อนครบ 24 รอบบิล ยินดีชำระค่าติดตั้งคืนในอัตราที่ได้มีการหักลดลงตามสัดส่วนที่ได้ใช้บริการไปก่อนแล้วเว้นแต่กรณีที่เหตุแห่งการยกเลิกบริการเกิดขึ้นจากการให้บริการที่ไม่เป็นไปตาม โฆษณาหรือมาตรฐานการให้บริการที่ได้แจ้งไว้ หรือเกิดขึ้นจากความผิดของ AWN AWN จะไม่มีการเรียกเก็บค่าติดตั้งอีกแต่อย่างใ`;

  const noteHeight = doc.heightOfString(note, {
    width: contentWidth,
  });

  ensureSpace(noteHeight + topSpacing);

  // 👇 สำคัญมาก ถ้ามี addPage จะได้ตำแหน่งใหม่
  y = doc.y;

  y += topSpacing;

  doc
    .font("regular")
    .fontSize(9)
    .fillColor(PDF_COLORS.GRAY)
    .text(note, margin, y, {
      width: contentWidth,
      lineGap: 2,
    });

  return doc.y;
}
