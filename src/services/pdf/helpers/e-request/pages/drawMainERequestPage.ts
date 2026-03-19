/* -----------------------------
   MAIN PAGE
----------------------------- */

import { LayoutContext } from "../../core/layoutContext";
import { drawSectionHeader } from "../../layout/drawSectionHeader";
import { drawCustomerInfoERequest } from "../sections/drawCustomerInfoERequest";
import { drawPackages } from "../sections/drawPackages";
import { drawRemark } from "../sections/drawRemark";
import { renderExpenseTable } from "../sections/renderExpenseTable";

type Params = {
  doc: PDFKit.PDFDocument;
  ctx: LayoutContext;
  data: any;
  label: any;
  margin: number;
  contentWidth: number;
  pageHeight: number;
  drawMainHeader: (y: number) => number;
};

export function drawMainERequestPage({
  doc,
  ctx,
  data,
  label,
  margin,
  contentWidth,
  pageHeight,
  drawMainHeader,
}: Params) {
  let y = ctx.getY();

  /* -------------------------
     CUSTOMER INFO
  ------------------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.DATA_OF_SUBSCRIBER,
    options: { withDivider: true },
  });

  ctx.setY(y);

  y = drawCustomerInfoERequest({
    doc,
    y,
    margin,
    contentWidth,
    data,
    label,
    ensureSpace: ctx.ensureSpace,
  });

  ctx.setY(y);

  y += 20;
  ctx.setY(y);

  /* -------------------------
     PACKAGES
  ------------------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.SUMMARY_SELECTED_PACKAGE,
    options: { withDivider: true },
  });

  ctx.setY(y);

  y = drawPackages({
    doc,
    y,
    margin,
    contentWidth,
    data,
    label,
    fields: {
      mainLabel: "MAIN_PACKAGE",
      onTopLabel: "ON_TOP_PACKAGE",
      mainData: "mainPackages",
      onTopData: "onTopPackages",
    },
  });

  ctx.setY(y);

  /* -------------------------
     EXPENSE TABLE
  ------------------------- */

  y = drawSectionHeader({
    doc,
    y,
    margin,
    contentWidth,
    title: label.DETAIL_CHARGES,
    options: { fullWidth: true },
  });

  ctx.setY(y);

  y = renderExpenseTable({
    doc,
    y,
    margin,
    contentWidth,
    pageHeight,
    data,
    label,
    drawPageHeader: () => {
      let newY = margin;

      newY = drawMainHeader(newY);

      newY = drawSectionHeader({
        doc,
        y: newY,
        margin,
        contentWidth,
        title: label.DETAIL_CHARGES,
        options: { fullWidth: true },
      });

      return newY;
    },
  });

  ctx.setY(y);

  /* -------------------------
     REMARK
  ------------------------- */

  y = drawRemark({
    doc,
    y,
    margin,
    contentWidth,
    label: label.REMARKS,
    ensureSpace: ctx.ensureSpace,
  });

  ctx.setY(y);

  return ctx.getY();
}
