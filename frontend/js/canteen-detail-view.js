import { createElement, getHalalLabel } from "./dom.js";

export function renderCanteenDetail({
  state,
  canteenDetail,
  onClose
}) {
  canteenDetail.replaceChildren();

  const canteen = state.selectedCanteen;

  if (!canteen) {
    return;
  }

  const header = createElement("div", "canteen-detail__header");
  const title = createElement(
    "h2",
    "canteen-detail__title",
    canteen.name
  );
  const closeButton = createElement(
    "button",
    "canteen-detail__close",
    "ปิด ✕"
  );

  closeButton.type = "button";
  closeButton.addEventListener("click", onClose);
  header.append(title, closeButton);

  const vendorCount = createElement(
    "h3",
    "canteen-detail__section-title",
    `ร้านค้าในโรงอาหาร (${state.vendors.length} ร้าน)`
  );

  const filterContainer = createElement(
    "div",
    "canteen-detail__filter"
  );
  const categoryLabel = createElement(
    "label",
    "canteen-detail__filter-label",
    "ประเภทอาหาร"
  );
  const categorySelect = createElement(
    "select",
    "canteen-detail__select"
  );

  categorySelect.add(new Option("ทุกประเภท", "ALL"));

  const categories = [
    ...new Set(
      state.vendors
        .map(vendor => vendor.category)
        .filter(Boolean)
    )
  ].sort();

  categories.forEach(category => {
    categorySelect.add(new Option(category, category));
  });

  categorySelect.value = state.vendorCategory;
  categorySelect.addEventListener("change", event => {
    state.vendorCategory = event.target.value;
    renderVendorList(state, vendorList);
  });
  filterContainer.append(categoryLabel, categorySelect);

  const halalContainer = createElement(
    "label",
    "canteen-detail__halal-filter"
  );
  const halalCheckbox = createElement(
    "input",
    "canteen-detail__checkbox"
  );

  halalCheckbox.type = "checkbox";
  halalCheckbox.checked = state.halalOnly;
  halalCheckbox.addEventListener("change", event => {
    state.halalOnly = event.target.checked;
    renderVendorList(state, vendorList);
  });

  const halalText = createElement(
    "span",
    "canteen-detail__halal-text",
    "แสดงเฉพาะร้านที่ระบุว่าเป็นฮาลาล"
  );
  halalContainer.append(halalCheckbox, halalText);

  const vendorList = createElement(
    "div",
    "canteen-detail__vendor-list"
  );
  vendorList.id = "vendor-list";

  canteenDetail.append(
    header,
    vendorCount,
    filterContainer,
    halalContainer,
    vendorList
  );

  renderVendorList(state, vendorList);
}

// Square photo area shown at the top of each vendor card. Vendors without a
// photo (or whose photo fails to load) get a neutral placeholder.
function createVendorMedia(vendor) {
  const media = createElement("div", "vendor-card__media");

  const showPlaceholder = () => {
    media.classList.add("vendor-card__media--empty");
    media.replaceChildren(
      createElement("span", "vendor-card__placeholder", "🍽️")
    );
  };

  if (!vendor.image_url) {
    showPlaceholder();
    return media;
  }

  const image = document.createElement("img");

  image.className = "vendor-card__image";
  image.alt = `หน้าร้าน ${vendor.name}`;
  image.width = 800;
  image.height = 800;
  image.loading = "lazy";
  image.decoding = "async";

  image.addEventListener("load", () => {
    media.classList.add("vendor-card__media--loaded");
  });
  image.addEventListener("error", showPlaceholder);

  image.src = vendor.image_url;
  media.append(image);

  return media;
}

function renderVendorList(state, vendorList) {
  vendorList.replaceChildren();

  const vendors = state.vendors.filter(vendor => {
    const matchesCategory =
      state.vendorCategory === "ALL" ||
      vendor.category === state.vendorCategory;
    const matchesHalal =
      !state.halalOnly ||
      vendor.is_halal === true;

    return matchesCategory && matchesHalal;
  });

  if (vendors.length === 0) {
    vendorList.append(
      createElement(
        "p",
        "empty-state",
        "ไม่พบร้านค้าที่ตรงกับเงื่อนไข"
      )
    );
    return;
  }

  vendors.forEach(vendor => {
    const card = createElement("div", "vendor-card");
    const header = createElement("div", "vendor-card__header");
    const name = createElement(
      "h4",
      "vendor-card__name",
      vendor.name
    );
    const category = createElement(
      "span",
      "vendor-card__category",
      vendor.category
    );

    header.append(name, category);

    const halalStatus = createElement(
      "p",
      "vendor-card__fact",
      `สถานะ: ${getHalalLabel(vendor.is_halal)}`
    );
    const openingHours = createElement(
      "p",
      "vendor-card__fact",
      `เวลาเปิด: ${vendor.opening_hours || "ไม่ระบุ"}`
    );
    const price = createElement(
      "p",
      "vendor-card__fact",
      `ราคาเริ่มต้น: ${
        Number.isFinite(vendor.starting_price)
          ? `${vendor.starting_price} บาท`
          : "ไม่ระบุ"
      }`
    );

    card.append(
      createVendorMedia(vendor),
      header,
      halalStatus,
      openingHours,
      price
    );
    vendorList.append(card);
  });
}
