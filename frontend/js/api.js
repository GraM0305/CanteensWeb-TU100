
"use strict";

// =========================================
// TU Canteen Finder - API Integration
// AWS Lambda Function URL
// =========================================
//"https://baflg5vkl6rogyfu775h6mcvbm0ccwct.lambda-url.us-east-1.on.aws";

const API_BASE_URL =
  "https://canteensweb-api.supanat-upa.workers.dev";


// =========================================
// APPLICATION STATE
// =========================================

const state = {
  canteens: [],
  filteredCanteens: [],
  selectedCanteen: null,

  vendors: [],
  vendorCache: new Map(),

  searchQuery: "",
  activePeriod: "ALL",

  vendorCategory: "ALL",
  halalOnly: false,

  requestId: 0
};


// =========================================
// DOM ELEMENTS
// =========================================

const searchInput = document.getElementById("canteen-search");
const canteenList = document.getElementById("canteen-list");
const canteenCount = document.getElementById("canteen-count");
const canteenDetail = document.getElementById("canteen-detail");
const apiStatus = document.getElementById("api-status");

const periodButtons = document.querySelectorAll(".period-filter");


// =========================================
// API REQUEST
// =========================================

async function apiGet(path) {

  const response = await fetch(
    `${API_BASE_URL}/api${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    }
  );

  const result = await response.json();

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.error?.message || `HTTP Error: ${response.status}`
    );
  }

  return result.data;
}


// =========================================
// HELPER FUNCTIONS
// =========================================

function createElement(tag, className, text) {

  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  return element;
}


function getPeriodLabel(period) {

  const labels = {
    DAY: "☀️ กลางวัน",
    NIGHT: "🌙 กลางคืน",
    ALL: "🕒 ทุกช่วงเวลา"
  };

  return labels[period] || "ไม่ระบุช่วงเวลา";
}


function getHalalLabel(value) {

  if (value === true) {
    return "ระบุว่าเป็นฮาลาล";
  }

  if (value === false) {
    return "ระบุว่าไม่ใช่ฮาลาล";
  }

  return "ไม่ระบุ";
}


// =========================================
// LOAD CANTEENS
// =========================================

async function loadCanteens() {

  try {

    apiStatus.textContent = "กำลังโหลดข้อมูลโรงอาหาร...";

    const data = await apiGet("/canteens");

    state.canteens = data;
    state.filteredCanteens = data;

    apiStatus.textContent =
      `เชื่อมต่อ API สำเร็จ · ${data.length} โรงอาหาร`;

    filterCanteens();

  } catch (error) {

    console.error("Load canteens error:", error);

    apiStatus.textContent = "ไม่สามารถโหลดข้อมูลโรงอาหารได้";

    canteenList.replaceChildren(
      createElement(
        "p",
        "api-error-message",
        `เกิดข้อผิดพลาด: ${error.message}`
      )
    );

  }

}


// =========================================
// FILTER CANTEENS
// =========================================

function filterCanteens() {

  const query = state.searchQuery.trim().toLowerCase();

  state.filteredCanteens = state.canteens.filter(canteen => {

    const matchesSearch =
      !query ||
      canteen.name.toLowerCase().includes(query) ||
      (canteen.description || "").toLowerCase().includes(query);

    const matchesPeriod =
      state.activePeriod === "ALL" ||
      canteen.operating_period === state.activePeriod;

    return matchesSearch && matchesPeriod;

  });


  // Clear selection if selected canteen is no longer visible
  if (
    state.selectedCanteen &&
    !state.filteredCanteens.some(
      c => c.id === state.selectedCanteen.id
    )
  ) {
    clearSelection();
  }

  renderCanteens();

  CanteenMap.renderMarkers(
    state.filteredCanteens
  );

}


// =========================================
// RENDER CANTEEN LIST
// =========================================

function renderCanteens() {

  canteenList.replaceChildren();

  const canteens = state.filteredCanteens;

  canteenCount.textContent =
    `พบ ${canteens.length} โรงอาหาร`;


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


  canteens.forEach(canteen => {

    const card = createElement(
      "article",
      "canteen-card"
    );

    const isSelected =
      state.selectedCanteen?.id === canteen.id;

    if (isSelected) {
      card.classList.add("is-selected");
    }


    const header = createElement(
      "div",
      "canteen-card__header"
    );

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

    const focusButton = createElement(
      "button",
      "canteen-card__select"
    );
    focusButton.type = "button";

    focusButton.append(header, description);

    const detailsLink = createElement(
      "a",
      "canteen-card__details",
      "เลือกร้านค้าในโรงอาหาร →"
    );
    detailsLink.href =
      `canteen.html?id=${encodeURIComponent(canteen.id)}`;

    card.append(focusButton, detailsLink);


    focusButton.addEventListener("click", () => {
      state.selectedCanteen = canteen;
      state.requestId++;
      state.vendors = [];

      canteenDetail.classList.add("is-hidden");
      canteenDetail.replaceChildren();

      CanteenMap.focus(canteen);
      renderCanteens();
    });


    canteenList.append(card);

  });

}


// =========================================
// SELECT CANTEEN
// =========================================

async function selectCanteen(canteen) {

  state.selectedCanteen = canteen;

  state.vendorCategory = "ALL";
  state.halalOnly = false;

  const currentRequestId = ++state.requestId;

  CanteenMap.focus(canteen);

  renderCanteens();

  canteenDetail.classList.remove("is-hidden");

  canteenDetail.replaceChildren(
    createElement(
      "h2",
      "canteen-detail__title",
      canteen.name
    ),
    createElement(
      "p",
      "canteen-detail__loading",
      "กำลังโหลดข้อมูลร้านค้า..."
    )
  );


  try {

    let vendors = state.vendorCache.get(canteen.id);

    if (!vendors) {

      vendors = await apiGet(
        `/vendors?canteenId=${encodeURIComponent(canteen.id)}`
      );

      state.vendorCache.set(canteen.id, vendors);

    }


    // Prevent older requests from overwriting a newer selection
    if (currentRequestId !== state.requestId) {
      return;
    }

    state.vendors = vendors;

    renderCanteenDetail();

    canteenDetail.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  } catch (error) {

    if (currentRequestId !== state.requestId) {
      return;
    }

    console.error("Load vendors error:", error);

    canteenDetail.replaceChildren(
      createElement(
        "p",
        "api-error-message",
        `ไม่สามารถโหลดข้อมูลร้านค้าได้: ${error.message}`
      )
    );

  }

}


// =========================================
// RENDER CANTEEN DETAIL
// =========================================

function renderCanteenDetail() {

  canteenDetail.replaceChildren();

  const canteen = state.selectedCanteen;

  if (!canteen) return;


  // Header
  const header = createElement(
    "div",
    "canteen-detail__header"
  );

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
  closeButton.addEventListener("click", clearSelection);

  header.append(title, closeButton);


  // Vendor heading
  const vendorCount = createElement(
    "h3",
    "canteen-detail__section-title",
    `ร้านค้าในโรงอาหาร (${state.vendors.length} ร้าน)`
  );


  // Category Filter
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

  categorySelect.add(
    new Option("ทุกประเภท", "ALL")
  );

  const categories = [
    ...new Set(
      state.vendors
        .map(v => v.category)
        .filter(Boolean)
    )
  ].sort();

  categories.forEach(category => {
    categorySelect.add(
      new Option(category, category)
    );
  });

  categorySelect.value = state.vendorCategory;

  categorySelect.addEventListener("change", event => {
    state.vendorCategory = event.target.value;
    renderVendorList();
  });

  filterContainer.append(categoryLabel, categorySelect);


  // Halal Filter
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
    renderVendorList();
  });

  const halalText = createElement(
    "span",
    "canteen-detail__halal-text",
    "แสดงเฉพาะร้านที่ระบุว่าเป็นฮาลาล"
  );

  halalContainer.append(halalCheckbox, halalText);


  // Vendor List
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

  renderVendorList();

}


// =========================================
// RENDER VENDOR LIST
// =========================================

function renderVendorList() {

  const vendorList = document.getElementById("vendor-list");

  if (!vendorList) return;

  vendorList.replaceChildren();


  let vendors = state.vendors.filter(vendor => {

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

    const card = createElement(
      "div",
      "vendor-card"
    );


    const header = createElement(
      "div",
      "vendor-card__header"
    );

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
      header,
      halalStatus,
      openingHours,
      price
    );

    if (vendor.source_url) {
      const source = createElement(
        "a",
        "vendor-card__source",
        "แหล่งข้อมูล"
      );
      source.href = vendor.source_url;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      card.append(source);
    }

    vendorList.append(card);

  });

}


// =========================================
// CLEAR SELECTION
// =========================================

function clearSelection() {

  state.requestId++;

  state.selectedCanteen = null;
  state.vendors = [];

  canteenDetail.classList.add("is-hidden");
  canteenDetail.replaceChildren();

  renderCanteens();

}


// =========================================
// EVENT LISTENERS
// =========================================

// Search canteen by name or description
searchInput.addEventListener("input", event => {

  state.searchQuery = event.target.value;

  filterCanteens();

});


// Filter canteen by operating period
periodButtons.forEach(button => {

  button.addEventListener("click", () => {

    state.activePeriod = button.dataset.period;

    periodButtons.forEach(btn => {
      btn.classList.remove("is-active");
    });

    button.classList.add("is-active");

    filterCanteens();

  });

});


// =========================================
// APPLICATION INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {

  CanteenMap.init();

  loadCanteens();

});
