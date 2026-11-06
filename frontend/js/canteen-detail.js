
"use strict";

// =========================================
// TU Canteen Finder
// Canteen Detail Page
// =========================================

const API_BASE_URL =
  "https://baflg5vkl6rogyfu775h6mcvbm0ccwct.lambda-url.us-east-1.on.aws";


// =========================================
// PAGE STATE
// =========================================

const state = {
  canteen: null,
  vendors: [],
  category: "ALL",
  halal: "ALL"
};


// =========================================
// DOM ELEMENTS
// =========================================

const pageStatus = document.getElementById("page-status");
const canteenInfo = document.getElementById("canteen-info");

const vendorList = document.getElementById("vendor-list");
const vendorCount = document.getElementById("vendor-count");

const categoryFilter = document.getElementById("category-filter");
const halalFilter = document.getElementById("halal-filter");


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
      result.error?.message || `HTTP Error ${response.status}`
    );
  }

  return result.data;

}


// =========================================
// DOM HELPER
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


// =========================================
// FORMAT DATA
// =========================================

function getPeriodLabel(period) {

  const labels = {
    DAY: "☀️ ช่วงกลางวัน",
    NIGHT: "🌙 ช่วงกลางคืน",
    ALL: "🕒 ทุกช่วงเวลา"
  };

  return labels[period] || "ไม่ระบุช่วงเวลา";

}


function getHalalLabel(value) {

  if (value === true) {
    return "ฮาลาล (ข้อมูลทดสอบ)";
  }

  if (value === false) {
    return "ไม่ใช่ฮาลาล (ข้อมูลทดสอบ)";
  }

  return "ยังไม่มีข้อมูลยืนยัน";

}


function getPriceLabel(price) {

  return price || "ไม่ระบุระดับราคา";

}


// =========================================
// RENDER CANTEEN INFORMATION
// =========================================

function renderCanteenInfo() {

  const canteen = state.canteen;

  canteenInfo.replaceChildren();


  const title = createElement(
    "h2",
    "canteen-info__title",
    canteen.name
  );


  const period = createElement(
    "span",
    "canteen-info__period",
    getPeriodLabel(canteen.operating_period)
  );


  const description = createElement(
    "p",
    "canteen-info__description",
    canteen.description || "ไม่มีรายละเอียดโรงอาหาร"
  );


  canteenInfo.append(
    title,
    period,
    description
  );

}


// =========================================
// CATEGORY FILTER
// =========================================

function setupCategoryFilter() {

  categoryFilter.replaceChildren();

  const allOption = new Option("ทุกประเภท", "ALL");

  categoryFilter.add(allOption);


  const categories = [
    ...new Set(
      state.vendors
        .map(vendor => vendor.category)
        .filter(Boolean)
    )
  ].sort();


  categories.forEach(category => {

    categoryFilter.add(
      new Option(category, category)
    );

  });

}


function setupFilters() {

  categoryFilter.addEventListener("change", event => {

    state.category = event.target.value;

    renderVendors();

  });


  halalFilter.addEventListener("change", event => {

    state.halal = event.target.value;

    renderVendors();

  });

}


// =========================================
// FILTER VENDORS
// =========================================

function getFilteredVendors() {

  return state.vendors.filter(vendor => {

    const matchesCategory =
      state.category === "ALL" ||
      vendor.category === state.category;


    const matchesHalal =

      state.halal === "ALL" ||

      (state.halal === "true" &&
        vendor.is_halal === true) ||

      (state.halal === "false" &&
        vendor.is_halal === false) ||

      (state.halal === "unknown" &&
        vendor.is_halal === null);


    return matchesCategory && matchesHalal;

  });

}


// =========================================
// RENDER VENDORS
// =========================================

function renderVendors() {

  const vendors = getFilteredVendors();

  vendorList.replaceChildren();

  vendorCount.textContent =
    `พบ ${vendors.length} ร้าน`;


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
      "article",
      "vendor-card"
    );


    const heading = createElement(
      "div",
      "vendor-card__header"
    );


    const name = createElement(
      "h3",
      "vendor-card__name",
      vendor.name
    );


    const category = createElement(
      "span",
      "vendor-card__category vendor-card__category--pill",
      vendor.category
    );

    heading.append(name, category);


    const halal = createElement(
      "p",
      "vendor-card__fact",
      `สถานะฮาลาล: ${getHalalLabel(vendor.is_halal)}`
    );


    const hours = createElement(
      "p",
      "vendor-card__fact",
      `เวลาเปิด: ${vendor.opening_hours || "ไม่ระบุ"}`
    );


    const price = createElement(
      "p",
      "vendor-card__fact",
      `ระดับราคา: ${getPriceLabel(vendor.avg_price_level)}`
    );


    card.append(
      heading,
      halal,
      hours,
      price
    );

    vendorList.append(card);

  });

}


// =========================================
// INITIALIZE PAGE
// =========================================

async function init() {

  try {

    pageStatus.classList.remove(
      "page-status--success",
      "page-status--error"
    );
    pageStatus.textContent =
      "กำลังโหลดข้อมูลโรงอาหาร...";


    // Read canteen ID from URL
    const params = new URLSearchParams(
      window.location.search
    );

    const rawId = params.get("id");

    const canteenId = Number(rawId);


    if (
      !rawId ||
      !Number.isSafeInteger(canteenId) ||
      canteenId <= 0
    ) {
      throw new Error("Invalid canteen ID");
    }


    // Request canteen and vendor data
    const [canteen, vendors] = await Promise.all([

      apiGet(`/canteens/${canteenId}`),

      apiGet(`/canteens/${canteenId}/vendors`)

    ]);


    state.canteen = canteen;
    state.vendors = vendors;


    // Render page
    renderCanteenInfo();

    setupCategoryFilter();

    setupFilters();

    renderVendors();


    document.title =
      `${canteen.name} - TU Canteen Finder`;


    pageStatus.textContent =
      "โหลดข้อมูลสำเร็จ";

    pageStatus.classList.add("page-status--success");


  } catch (error) {

    console.error("Canteen detail error:", error);

    pageStatus.textContent =
      `ไม่สามารถโหลดข้อมูลได้: ${error.message}`;

    pageStatus.classList.add("page-status--error");

  }

}


document.addEventListener("DOMContentLoaded", init);
