import { createElement, getHalalLabel } from "../dom.js";
import { createVendorMedia } from "../vendor-media.js";

function getPriceLabel(price) {
  return Number.isFinite(price)
    ? `เริ่ม ${price} บาท`
    : "ไม่ระบุราคา";
}

// One vendor on the canteen page: photo, name, category, price, opening
// hours and (only when known) the halal status.
export function createVendorCard(vendor) {
  const card = createElement("article", "vendor-card");

  const heading = createElement("div", "vendor-card__header");

  heading.append(
    createElement("h3", "vendor-card__name", vendor.name),
    createElement(
      "span",
      "vendor-card__category vendor-card__category--pill",
      vendor.category
    )
  );

  // Price first (what people look for), then hours.
  const price = createElement(
    "p",
    "vendor-card__fact vendor-card__price",
    getPriceLabel(vendor.starting_price)
  );

  // The clock is decoration; screen readers hear "เวลาเปิด" instead.
  const hours = createElement(
    "p",
    "vendor-card__fact vendor-card__hours"
  );
  const clock = createElement("span", "", "🕒 ");

  clock.setAttribute("aria-hidden", "true");
  hours.append(
    clock,
    createElement("span", "visually-hidden", "เวลาเปิด: "),
    vendor.opening_hours || "ไม่ระบุเวลาเปิด"
  );

  card.append(createVendorMedia(vendor), heading, price, hours);

  // "Unknown" is not repeated on nearly every card, so the line is only
  // shown once the status is known.
  if (vendor.is_halal !== null && vendor.is_halal !== undefined) {
    card.append(
      createElement(
        "p",
        "vendor-card__fact vendor-card__halal",
        getHalalLabel(vendor.is_halal)
      )
    );
  }

  return card;
}
