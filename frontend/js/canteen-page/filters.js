import { createElement } from "../dom.js";

// Which vendors match the current filters (category, halal, name search).
export function getFilteredVendors(state) {
  const query = state.search.trim().toLowerCase();

  return state.vendors.filter(vendor => {
    const matchesCategory =
      state.category === "ALL" || vendor.category === state.category;

    const matchesHalal =
      state.halal === "ALL" ||
      (state.halal === "true" && vendor.is_halal === true);

    const matchesSearch =
      !query || vendor.name.toLowerCase().includes(query);

    return matchesCategory && matchesHalal && matchesSearch;
  });
}

// Chip row (one "ฮาลาล" toggle, then "all" and the categories A-Z) plus the
// name search box. Chips are built once so the scroll position of the row is
// kept; `onChange` is called after every state change.
export function setupFilters({
  state,
  chipsContainer,
  searchInput,
  onChange
}) {
  const syncChips = () => {
    chipsContainer.querySelectorAll(".filter-chip").forEach(chip => {
      const pressed = chip.dataset.filter === "halal"
        ? state.halal === "true"
        : state.category === chip.dataset.value;

      chip.setAttribute("aria-pressed", String(pressed));
    });
  };

  const addChip = (label, dataset, className = "filter-chip") => {
    const chip = createElement("button", className, label);

    chip.type = "button";
    Object.assign(chip.dataset, dataset);
    chipsContainer.append(chip);
  };

  const divider = createElement("span", "filter-chip-divider");

  divider.setAttribute("aria-hidden", "true");

  chipsContainer.replaceChildren();
  addChip("ฮาลาล", { filter: "halal" }, "filter-chip filter-chip--halal");
  chipsContainer.append(divider);

  const categories = [
    ...new Set(state.vendors.map(vendor => vendor.category).filter(Boolean))
  ].sort();

  addChip("ทุกประเภท", { filter: "category", value: "ALL" });
  categories.forEach(category => {
    addChip(category, { filter: "category", value: category });
  });

  // Arrow + fade at the right edge: tells users the row scrolls sideways.
  const moreButton = createElement("button", "filter-more", "›");

  moreButton.type = "button";
  moreButton.setAttribute("aria-label", "เลื่อนดูหมวดหมู่เพิ่มเติม");
  chipsContainer.append(moreButton);

  const updateMore = () => {
    moreButton.hidden =
      chipsContainer.scrollLeft + chipsContainer.clientWidth >=
      chipsContainer.scrollWidth - 2;
  };

  moreButton.addEventListener("click", () => {
    chipsContainer.scrollBy({
      left: chipsContainer.clientWidth * 0.6,
      behavior: "smooth"
    });
  });

  chipsContainer.addEventListener("scroll", updateMore, { passive: true });
  window.addEventListener("resize", updateMore);

  chipsContainer.addEventListener("click", event => {
    const chip = event.target.closest(".filter-chip");

    if (!chip) {
      return;
    }

    if (chip.dataset.filter === "halal") {
      // Tap again to clear.
      state.halal = state.halal === "true" ? "ALL" : "true";
    } else {
      state.category = chip.dataset.value;
    }

    syncChips();
    onChange();
  });

  searchInput?.addEventListener("input", event => {
    state.search = event.target.value;
    onChange();
  });

  syncChips();
  updateMore();
}
