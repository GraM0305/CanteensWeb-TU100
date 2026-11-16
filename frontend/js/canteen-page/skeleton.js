import { createElement } from "../dom.js";

// Placeholder shapes shown while the API answers, so the page keeps its
// layout instead of showing a bare "loading" line.
export function showSkeleton({ canteenInfo, vendorList }) {
  canteenInfo.replaceChildren(
    createElement("div", "skeleton skeleton--title"),
    createElement("div", "skeleton skeleton--pill"),
    createElement("div", "skeleton skeleton--line")
  );

  const cards = Array.from({ length: 3 }, () => {
    const card = createElement("div", "vendor-card vendor-card--skeleton");

    card.append(
      createElement("div", "vendor-card__media skeleton"),
      createElement("div", "skeleton skeleton--title"),
      createElement("div", "skeleton skeleton--pill"),
      createElement("div", "skeleton skeleton--line")
    );

    return card;
  });

  vendorList.replaceChildren(...cards);
  vendorList.setAttribute("aria-busy", "true");
}

export function clearSkeleton({ canteenInfo, vendorList }) {
  canteenInfo.replaceChildren();
  vendorList.replaceChildren();
  vendorList.removeAttribute("aria-busy");
}
