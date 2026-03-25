import { drawAddressInstall } from "../sections/drawAddressInstall";
import { drawCustomerInfoEApp } from "../sections/drawCustomerInfoEApp";
import { drawStatement } from "../sections/drawStatement";
import { drawPackageDetail } from "../sections/drawPackageDetail";
import { drawTwoColumnSection } from "../../layout/drawTwoColumnSection";
import { renderRemarkEApp } from "../sections/renderRemarkEApp";
import { drawRemark } from "../../e-request/sections/drawRemark";
import { PDF_COLORS, SECTION_GAP } from "../../../constants/pdf.constants";

export function drawMainContentPage(params: any) {
  let {
    doc,
    y,
    margin,
    contentWidth,
    pageHeight,
    data,
    pdfData,
    label,
    ensureSpace,
    drawMainHeader,
    lang,
  } = params;

  y = drawCustomerInfoEApp({
    doc,
    y,
    margin,
    contentWidth,
    customerType: data.customerType,
    pdfData,
    label,
    ensureSpace,
    lang,
  });

  y = drawTwoColumnSection({
    doc,
    y,
    margin,
    contentWidth,
    leftRatio: 0.5,
    rightRatio: 0.5,

    drawLeft: (x, y, width) =>
      drawAddressInstall({
        doc,
        y,
        margin: x,
        contentWidth: width,
        pdfData,
        label,
        skipBox: true,
      }),

    drawRight: (x, y, width) =>
      drawStatement({
        doc,
        y,
        margin: x,
        contentWidth: width,
        customerType: data.customerType,
        pdfData,
        label,
        skipBox: true,
      }),

    afterDraw: (left, right, leftX, rightX, colWidth) => {
      const maxEndY = Math.max(left.endY, right.endY);

      doc
        .rect(
          leftX + 0.5,
          left.contentStartY + 0.5,
          colWidth - 1,
          maxEndY - left.contentStartY,
        )
        .strokeColor(PDF_COLORS.BORDER)
        .lineWidth(1)
        .stroke();

      doc
        .rect(
          rightX + 0.5,
          right.contentStartY + 0.5,
          colWidth - 1,
          maxEndY - right.contentStartY,
        )
        .strokeColor(PDF_COLORS.BORDER)
        .lineWidth(1)
        .stroke();

      return maxEndY + 4;
    },
  });

  y += SECTION_GAP;

  y = drawPackageDetail({
    doc,
    y,
    margin,
    contentWidth,
    pageHeight,
    productOwner: data.productOwner,
    pdfData,
    label,
    drawMainHeader,
  });

  if (data.isShowInstallationFeeRemark) {
    y = drawRemark({
      doc,
      y,
      margin,
      contentWidth,
      label: label.REMARKS,
      ensureSpace,
    });
  }

  y = renderRemarkEApp({
    doc,
    html: pdfData.remark,
    y,
    margin,
    pageWidth: params.pageWidth,
    pageHeight: params.pageHeight,
    drawHeader: params.drawMainHeader,
  });

  return y;
}
