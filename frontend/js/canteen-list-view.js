import { createElement, getPeriodLabel } from "./dom.js";

export function renderCanteenList({
  state,
  canteenList,
  canteenCount,
  mobileCanteenPicker,
  useMobilePicker,
  onChooseMobileCanteen,
  onSelectCanteen
}) {
  canteenList.replaceChildren();

  const canteens = state.filteredCanteens;
  canteenCount.textContent = `พบ ${canteens.length} โรงอาหาร`;

  if (!useMobilePicker) {
    state.mobileCanteenId = "";
    state.mobilePickerOpen = false;
  }

  if (
    state.mobileCanteenId &&
    !canteens.some(canteen => String(canteen.id) === state.mobileCanteenId)
  ) {
    state.mobileCanteenId = "";
  }

  mobileCanteenPicker.classList.toggle("is-visible", useMobilePicker);

  if (useMobilePicker) {
    renderMobileCanteenPicker({
      state,
      canteens,
      mobileCanteenPicker,
      onChooseMobileCanteen
    });
  } else {
    mobileCanteenPicker.replaceChildren();
  }

  const displayedCanteens = useMobilePicker
    ? canteens.filter(canteen => String(canteen.id) === state.mobileCanteenId)
    : canteens;

  if (canteens.length === 0) {
    canteenList.append(
      createElement(
        "p",
        "empty-state",
        "ไม่พบโรงอาหารที่ตรงกับการค้นหา"
      )
    );
    return;
  }

  if (useMobilePicker && displayedCanteens.length === 0) {
    canteenList.append(
      createElement(
        "p",
        "empty-state",
        "เลือกโรงอาหารจากรายการด้านบนเพื่อแสดงการ์ด"
      )
    );
    return;
  }

  displayedCanteens.forEach(canteen => {
    const card = createElement("article", "canteen-card");

    if (state.selectedCanteen?.id === canteen.id) {
      card.classList.add("is-selected");
    }

    const header = createElement("div", "canteen-card__header");
    const title = createElement(
      "h3",
      "canteen-card__title",
      canteen.name
    );
    const period = createElement(
      "span",
      "canteen-card__period",
      getPeriodLabel(canteen.operating_period)
    );

    header.append(title, period);

    const description = createElement(
      "p",
      "canteen-card__description",
      canteen.description || "ไม่มีรายละเอียด"
    );

    const focusButton = createElement("button", "canteen-card__select");
    focusButton.type = "button";
    focusButton.append(header, description);
    focusButton.addEventListener("click", () => onSelectCanteen(canteen));

    const detailsLink = createElement(
      "a",
      "canteen-card__details",
      "เลือกร้านค้าในโรงอาหาร →"
    );
    detailsLink.href =
      `canteen.html?id=${encodeURIComponent(canteen.id)}`;

    card.append(focusButton, detailsLink);
    canteenList.append(card);
  });
}

function renderMobileCanteenPicker({
  state,
  canteens,
  mobileCanteenPicker,
  onChooseMobileCanteen
}) {
  const label = createElement(
    "span",
    "mobile-canteen-picker__label",
    "เลือกโรงอาหารเพื่อแสดงการ์ด"
  );
  const dropdown = createElement(
    "details",
    "mobile-canteen-picker__dropdown"
  );
  const selectedCanteen = canteens.find(
    canteen => String(canteen.id) === state.mobileCanteenId
  );
  const summary = createElement(
    "summary",
    "mobile-canteen-picker__trigger"
  );
  const value = createElement(
    "span",
    "mobile-canteen-picker__value",
    selectedCanteen?.name || "เลือกโรงอาหาร"
  );
  const indicator = createElement(
    "span",
    "mobile-canteen-picker__indicator"
  );
  const indicatorSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  indicatorSvg.setAttribute("viewBox", "0 0 640 640");
  indicatorSvg.setAttribute("aria-hidden", "true");
  const indicatorPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  indicatorPath.setAttribute(
    "d",
    "M297.4 201.4C309.9 188.9 330.2 188.9 342.7 201.4L502.7 361.4C515.2 373.9 515.2 394.2 502.7 406.7C490.2 419.2 469.9 419.2 457.4 406.7L320 269.3L182.6 406.6C170.1 419.1 149.8 419.1 137.3 406.6C124.8 394.1 124.8 373.8 137.3 361.3L297.3 201.3z"
  );
  indicatorPath.setAttribute("fill", "currentColor");
  indicatorSvg.append(indicatorPath);
  indicator.append(indicatorSvg);
  const options = createElement("ul", "mobile-canteen-picker__options");

  summary.setAttribute(
    "aria-label",
    selectedCanteen
      ? `เลือกโรงอาหาร: ${selectedCanteen.name}`
      : "เลือกโรงอาหาร"
  );
  summary.append(value, indicator);

  canteens.forEach(canteen => {
    const item = createElement("li", "mobile-canteen-picker__option");
    const button = createElement(
      "button",
      "mobile-canteen-picker__option-button",
      canteen.name
    );

    button.type = "button";
    button.setAttribute(
      "aria-pressed",
      String(String(canteen.id) === state.mobileCanteenId)
    );
    button.addEventListener("click", () => {
      onChooseMobileCanteen(String(canteen.id));
    });

    item.append(button);
    options.append(item);
  });

  dropdown.open = state.mobilePickerOpen;
  dropdown.addEventListener("toggle", () => {
    state.mobilePickerOpen = dropdown.open;
  });
  dropdown.addEventListener("keydown", event => {
    if (event.key === "Escape" && dropdown.open) {
      event.preventDefault();
      state.mobilePickerOpen = false;
      dropdown.open = false;
      summary.focus();
    }
  });
  dropdown.append(summary, options);
  mobileCanteenPicker.replaceChildren(label, dropdown);
}
