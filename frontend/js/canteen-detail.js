
"use strict";

// =========================================
// TU Canteen Finder
// Canteen Detail Page
// =========================================
//"https://baflg5vkl6rogyfu775h6mcvbm0ccwct.lambda-url.us-east-1.on.aws";

const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// =========================================
// PAGE STATE
// =========================================

const state = {
  canteen: null,
  vendors: [],
  category: "ALL",
  halal: "ALL",
  search: ""
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

const vendorSearch = document.getElementById("vendor-search");

const mobileFilters = document.getElementById("mobile-filters");
const noticeToggle = document.getElementById("notice-toggle");
const noticePopover = document.getElementById("notice-popover");
const pageHeader = document.querySelector(".canteen-page__header");

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
// VENDOR PHOTO
// =========================================

// Square photo area shown at the top of each vendor card. Vendors without a
// photo (or whose photo fails to load) get a neutral placeholder so every
// card keeps the same height. Only DOM properties are used, never innerHTML.
function createVendorMedia(vendor) {

  const media = createElement("div", "vendor-card__media");

  const showPlaceholder = () => {
    media.classList.add("vendor-card__media--empty");
    const icon = createElement("span", "vendor-card__placeholder", "🍽️");

    icon.setAttribute("aria-hidden", "true");
    media.replaceChildren(icon);
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
    return "ฮาลาล";
  }

  if (value === false) {
    return "ไม่ใช่ฮาลาล";
  }

  return "ไม่ระบุ";

}


function getStartingPriceLabel(price) {

  return Number.isFinite(price)
    ? `${price} บาท`
    : "ไม่ระบุ";

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


// =========================================
// PHONE CHIP FILTERS
// =========================================

// Category chips plus one "ฮาลาล" toggle, shown on every screen size. They share
// state.category / state.halal with the <select> filters used on larger
// screens, and are built once so the scroll position of the row is kept.
function buildMobileFilters() {

  mobileFilters.replaceChildren();

  const halalChip = createElement(
    "button",
    "filter-chip filter-chip--halal",
    "ฮาลาล"
  );

  halalChip.type = "button";
  halalChip.dataset.filter = "halal";

  const divider = createElement("span", "filter-chip-divider");

  divider.setAttribute("aria-hidden", "true");

  mobileFilters.append(halalChip, divider);

  // Same order as the <select>: "all" first, then categories A-Z.
  const categories = [
    "ALL",
    ...[
      ...new Set(
        state.vendors
          .map(vendor => vendor.category)
          .filter(Boolean)
      )
    ].sort()
  ];

  categories.forEach(category => {

    const chip = createElement(
      "button",
      "filter-chip",
      category === "ALL" ? "ทุกประเภท" : category
    );

    chip.type = "button";
    chip.dataset.filter = "category";
    chip.dataset.value = category;

    mobileFilters.append(chip);

  });

  // Arrow + fade at the right edge: tells users the row scrolls sideways.
  const moreButton = createElement("button", "filter-more", "›");

  moreButton.type = "button";
  moreButton.setAttribute("aria-label", "เลื่อนดูหมวดหมู่เพิ่มเติม");
  mobileFilters.append(moreButton);

  const updateMore = () => {
    moreButton.hidden =
      mobileFilters.scrollLeft + mobileFilters.clientWidth >=
      mobileFilters.scrollWidth - 2;
  };

  moreButton.addEventListener("click", () => {
    mobileFilters.scrollBy({
      left: mobileFilters.clientWidth * 0.6,
      behavior: "smooth"
    });
  });

  mobileFilters.addEventListener("scroll", updateMore, { passive: true });
  window.addEventListener("resize", updateMore);

  mobileFilters.addEventListener("click", event => {

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

    syncFilterUi();
    renderVendors();

  });

  syncFilterUi();
  updateMore();

}


// Keep the <select>s and the chips showing the same state.
function syncFilterUi() {

  categoryFilter.value = state.category;
  halalFilter.value = state.halal;

  mobileFilters.querySelectorAll(".filter-chip").forEach(chip => {

    const pressed = chip.dataset.filter === "halal"
      ? state.halal === "true"
      : state.category === chip.dataset.value;

    chip.setAttribute("aria-pressed", String(pressed));

  });

}


// =========================================
// PHONE DATA NOTICE (ⓘ)
// =========================================

function setupNoticeToggle() {

  const setOpen = open => {

    noticePopover.hidden = !open;
    noticeToggle.setAttribute("aria-expanded", String(open));

  };

  noticeToggle.addEventListener("click", () => {
    setOpen(noticePopover.hidden);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

}


// The sticky filter bar sits right below the sticky page header, so
// measure the header instead of guessing its height.
function trackHeaderHeight() {

  const update = () => {
    document.documentElement.style.setProperty(
      "--canteen-header-height",
      `${pageHeader.offsetHeight}px`
    );
  };

  update();

  new ResizeObserver(update).observe(pageHeader);

}


function setupFilters() {

  vendorSearch?.addEventListener("input", event => {

    state.search = event.target.value;

    renderVendors();

  });

  categoryFilter.addEventListener("change", event => {

    state.category = event.target.value;

    syncFilterUi();
    renderVendors();

  });


  halalFilter.addEventListener("change", event => {

    state.halal = event.target.value;

    syncFilterUi();
    renderVendors();

  });

}


// =========================================
// FILTER VENDORS
// =========================================

function getFilteredVendors() {

  const query = state.search.trim().toLowerCase();

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


    const matchesSearch =
      !query ||
      vendor.name.toLowerCase().includes(query);


    return matchesCategory && matchesHalal && matchesSearch;

  });

}


// =========================================
// RENDER VENDORS
// =========================================

function renderVendors() {

  const vendors = getFilteredVendors();

  vendorList.replaceChildren();
  vendorList.removeAttribute("aria-busy");

  vendorCount.textContent =
    `พบ ${vendors.length} ร้าน`;


  if (vendors.length === 0) {

    vendorList.append(
      createElement(
        "p",
        "empty-state",
        state.search.trim()
          ? `ไม่พบร้านที่ชื่อตรงกับ "${state.search.trim()}"`
          : "ไม่พบร้านค้าที่ตรงกับเงื่อนไข"
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


    // Price first (what people look for), then hours. The halal line is
    // only shown when the status is known, so "unknown" is not repeated on
    // nearly every card.
    const price = createElement(
      "p",
      "vendor-card__fact vendor-card__price",
      Number.isFinite(vendor.starting_price)
        ? `เริ่ม ${vendor.starting_price} บาท`
        : "ไม่ระบุราคา"
    );


    // The clock is decoration; screen readers hear "เวลาเปิด" instead.
    const hours = createElement(
      "p",
      "vendor-card__fact vendor-card__hours"
    );

    const clock = createElement("span", null, "🕒 ");
    const hoursLabel = createElement(
      "span",
      "visually-hidden",
      "เวลาเปิด: "
    );

    clock.setAttribute("aria-hidden", "true");
    hours.append(
      clock,
      hoursLabel,
      vendor.opening_hours || "ไม่ระบุเวลาเปิด"
    );

    card.append(
      createVendorMedia(vendor),
      heading,
      price,
      hours
    );

    if (vendor.is_halal !== null && vendor.is_halal !== undefined) {
      card.append(
        createElement(
          "p",
          "vendor-card__fact vendor-card__halal",
          getHalalLabel(vendor.is_halal)
        )
      );
    }

    vendorList.append(card);

  });

}


// =========================================
// LOADING SKELETON
// =========================================

// Placeholder shapes shown while the API answers, so the page keeps its
// layout instead of showing a bare "loading" line.
function renderSkeleton() {

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


function clearSkeleton() {

  canteenInfo.replaceChildren();
  vendorList.replaceChildren();
  vendorList.removeAttribute("aria-busy");

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


    renderSkeleton();


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

    buildMobileFilters();

    setupFilters();

    setupNoticeToggle();

    trackHeaderHeight();

    renderVendors();


    document.title =
      `${canteen.name} - TU Canteen Finder`;


    pageStatus.textContent =
      "โหลดข้อมูลสำเร็จ";

    pageStatus.classList.add("page-status--success");


  } catch (error) {

    console.error("Canteen detail error:", error);

    clearSkeleton();

    pageStatus.textContent =
      `ไม่สามารถโหลดข้อมูลได้: ${error.message}`;

    pageStatus.classList.add("page-status--error");

  }

}


document.addEventListener("DOMContentLoaded", init);
