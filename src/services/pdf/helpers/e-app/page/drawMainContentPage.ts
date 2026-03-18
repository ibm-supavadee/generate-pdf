import { drawAddressInstall } from "../sections/drawAddressInstall";
import { drawCustomerInfoEApp } from "../sections/drawCustomerInfoEApp";
import { drawStatement } from "../sections/drawStatement";
import { drawPackageDetail } from "../sections/drawPackageDetail";
import { drawRemark } from "../../e-request/drawRemark";
import { drawTwoColumnSection } from "../layout/drawTwoColumnSection";
import { renderRemarkEApp } from "../utils/renderRemarkEApp";

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
      }),
  });

  y = drawPackageDetail({
    doc,
    y,
    margin,
    contentWidth,
    pageHeight,
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
