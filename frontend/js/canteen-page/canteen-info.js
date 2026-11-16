import { createElement } from "../dom.js";

const PERIOD_LABELS = {
  DAY: "☀️ ช่วงกลางวัน",
  NIGHT: "🌙 ช่วงกลางคืน",
  ALL: "🕒 ทุกช่วงเวลา"
};

export function renderCanteenInfo(canteen, container) {
  container.replaceChildren(
    createElement("h2", "canteen-info__title", canteen.name),
    createElement(
      "span",
      "canteen-info__period",
      PERIOD_LABELS[canteen.operating_period] || "ไม่ระบุช่วงเวลา"
    ),
    createElement(
      "p",
      "canteen-info__description",
      canteen.description || "ไม่มีรายละเอียดโรงอาหาร"
    )
  );
}
