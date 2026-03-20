import { REGISTER_TYPE } from "../../../../../constants/enum";
import { E_APP_LABEL_EN } from "../../../constants/e-app/e-app-label-en.constant";
import { E_APP_LABEL_TH } from "../../../constants/e-app/e-app-label-th.constant";

type LabelType = typeof E_APP_LABEL_EN | typeof E_APP_LABEL_TH;

/* =========================
   NAME TITLE
   ========================= */
export function getNameTitle(
  registerType: REGISTER_TYPE | undefined,
  label: LabelType,
): string {
  const nameTitleMap: Partial<Record<REGISTER_TYPE, string>> = {
    [REGISTER_TYPE.CORPORATE]: label.CUSTOMER_INFO.CORPORATE_NAME,
    [REGISTER_TYPE.GOVERNMENT_AGENCY]:
      label.CUSTOMER_INFO.GOVERNMENT_AGENCY_NAME,
  };

  return (
    (registerType && nameTitleMap[registerType]) || label.CUSTOMER_INFO.NAME
  );
}

/* =========================
   ID CARD TITLE
   ========================= */
export function getIdCardTitle(
  registerType: REGISTER_TYPE | undefined,
  label: LabelType,
): string {
  const idCardTitleMap: Partial<Record<REGISTER_TYPE, string>> = {
    [REGISTER_TYPE.PASSPORT]: label.ID_CARD_TITLE.PASSPORT,
    [REGISTER_TYPE.IMMIGRATION]: label.ID_CARD_TITLE.IMMIGRATION,
    [REGISTER_TYPE.CORPORATE]: label.ID_CARD_TITLE.CORPORATE,
    [REGISTER_TYPE.GOVERNMENT_AGENCY]: label.ID_CARD_TITLE.GOVERNMENT_AGENCY,
  };

  return (
    (registerType && idCardTitleMap[registerType]) ||
    label.ID_CARD_TITLE.ID_CARD
  );
}
