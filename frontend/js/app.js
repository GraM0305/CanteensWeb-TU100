import { getAllVendors, getCanteens, getVendors } from "./api.js";
import { renderCanteenDetail } from "./canteen-detail-view.js";
import { renderCanteenList } from "./canteen-list-view.js";
import { createElement } from "./dom.js";
import { CanteenMap } from "./map.js";
import { initScrollHint } from "./scroll-hint.js";
import { state } from "./state.js";

const searchInput = document.getElementById("canteen-search");
const canteenList = document.getElementById("canteen-list");
const canteenCount = document.getElementById("canteen-count");
const canteenDetail = document.getElementById("canteen-detail");
const apiStatus = document.getElementById("api-status");
const mobileCanteenPicker = document.getElementById("mobile-canteen-picker");
const periodButtons = document.querySelectorAll(".period-filter");
const mobilePickerMedia = window.matchMedia("(max-width: 640px)");

async function loadCanteens() {
  try {
    apiStatus.textContent = "กำลังโหลดข้อมูลโรงอาหาร...";
    state.canteens = await getCanteens();
    state.filteredCanteens = state.canteens;
    apiStatus.textContent =
      `เชื่อมต่อ API สำเร็จ · ${state.canteens.length} โรงอาหาร`;
    filterCanteens();
    loadVendorsForSearch();
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

// โหลดร้านทั้งหมดครั้งเดียว เพื่อให้ช่องค้นหาหาจากชื่อร้าน/ประเภทอาหาร/ฮาลาลได้
async function loadVendorsForSearch() {
  try {
    const vendors = await getAllVendors();

    state.vendorsByCanteen = new Map();

    vendors.forEach(vendor => {
      const list = state.vendorsByCanteen.get(vendor.canteen_id) || [];

      list.push(vendor);
      state.vendorsByCanteen.set(vendor.canteen_id, list);
    });

    filterCanteens();
  } catch (error) {
    // โหลดร้านไม่ได้ ช่องค้นหายังค้นจากชื่อ/คำอธิบายโรงอาหารได้ตามปกติ
    console.error("Load vendors for search error:", error);
  }
}

// คำค้นที่หมายถึงสถานะฮาลาล (is_halal เป็น boolean จึงเทียบข้อความตรง ๆ ไม่ได้)
const HALAL_KEYWORDS = ["ฮาลาล", "halal"];

function vendorMatchesQuery(vendor, query) {
  return (
    vendor.name.toLowerCase().includes(query) ||
    (vendor.category || "").toLowerCase().includes(query) ||
    (vendor.is_halal === true &&
      HALAL_KEYWORDS.some(
        keyword => keyword.includes(query) || query.includes(keyword)
      ))
  );
}

// ข้อความบนการ์ดที่บอกจำนวนร้านที่ตรงกับคำค้น (ว่างถ้าไม่มีร้านตรง)
function buildMatchLabel(vendors, query) {
  const categoryMatches = vendors.filter(vendor =>
    (vendor.category || "").toLowerCase().includes(query)
  );

  if (categoryMatches.length > 0) {
    const categories = new Set(categoryMatches.map(vendor => vendor.category));

    return categories.size === 1
      ? `${categoryMatches[0].category} ${categoryMatches.length} ร้าน`
      : `ประเภทที่ตรงกับคำค้น ${categoryMatches.length} ร้าน`;
  }

  const otherMatches = vendors.filter(vendor =>
    vendorMatchesQuery(vendor, query)
  );

  return otherMatches.length > 0
    ? `ร้านที่ตรงกับคำค้น ${otherMatches.length} ร้าน`
    : "";
}

function filterCanteens() {
  const query = state.searchQuery.trim().toLowerCase();

  state.matchLabels = new Map();

  state.filteredCanteens = state.canteens.filter(canteen => {
    const vendors = state.vendorsByCanteen.get(canteen.id) || [];
    const matchesSearch =
      !query ||
      canteen.name.toLowerCase().includes(query) ||
      (canteen.description || "").toLowerCase().includes(query) ||
      vendors.some(vendor => vendorMatchesQuery(vendor, query));

    if (matchesSearch && query) {
      const label = buildMatchLabel(vendors, query);

      if (label) {
        state.matchLabels.set(canteen.id, label);
      }
    }
    const matchesPeriod =
      state.activePeriod === "ALL" ||
      canteen.operating_period === state.activePeriod;

    return matchesSearch && matchesPeriod;
  });

  if (
    state.selectedCanteen &&
    !state.filteredCanteens.some(
      canteen => canteen.id === state.selectedCanteen.id
    )
  ) {
    clearSelection();
  }

  renderCanteens();
  CanteenMap.renderMarkers(state.filteredCanteens);
}

function renderCanteens() {
  renderCanteenList({
    state,
    canteenList,
    canteenCount,
    mobileCanteenPicker,
    useMobilePicker:
      mobilePickerMedia.matches && state.filteredCanteens.length > 4,
    onChooseMobileCanteen: canteenId => {
      state.mobileCanteenId = canteenId;
      state.mobilePickerOpen = false;
      renderCanteens();
      mobileCanteenPicker.querySelector("summary")?.focus();
    },
    onSelectCanteen: canteen => {
      state.selectedCanteen = canteen;
      state.requestId++;
      state.vendors = [];
      canteenDetail.classList.add("is-hidden");
      canteenDetail.replaceChildren();
      CanteenMap.focus(canteen);
      renderCanteens();
    }
  });
}

document.addEventListener("click", event => {
  if (
    state.mobilePickerOpen &&
    !mobileCanteenPicker.contains(event.target)
  ) {
    state.mobilePickerOpen = false;
    const dropdown = mobileCanteenPicker.querySelector("details");

    if (dropdown) {
      dropdown.open = false;
    }
  }
});

async function selectCanteen(canteen) {
  state.selectedCanteen = canteen;
  state.vendorCategory = "ALL";
  state.halalOnly = false;

  const currentRequestId = ++state.requestId;
  CanteenMap.focus(canteen);
  renderCanteens();
  canteenDetail.classList.remove("is-hidden");
  canteenDetail.replaceChildren(
    createElement("h2", "canteen-detail__title", canteen.name),
    createElement(
      "p",
      "canteen-detail__loading",
      "กำลังโหลดข้อมูลร้านค้า..."
    )
  );

  try {
    let vendors = state.vendorCache.get(canteen.id);

    if (!vendors) {
      vendors = await getVendors(canteen.id);
      state.vendorCache.set(canteen.id, vendors);
    }

    if (currentRequestId !== state.requestId) {
      return;
    }

    state.vendors = vendors;
    renderCanteenDetail({
      state,
      canteenDetail,
      onClose: clearSelection
    });
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

function clearSelection() {
  state.requestId++;
  state.selectedCanteen = null;
  state.vendors = [];
  canteenDetail.classList.add("is-hidden");
  canteenDetail.replaceChildren();
  renderCanteens();
}

searchInput.addEventListener("input", event => {
  state.searchQuery = event.target.value;
  filterCanteens();
});

periodButtons.forEach(button => {
  button.addEventListener("click", () => {
    state.activePeriod = button.dataset.period;

    periodButtons.forEach(periodButton => {
      periodButton.classList.remove("is-active");
      periodButton.setAttribute("aria-pressed", "false");
    });

    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    filterCanteens();
  });
});

mobilePickerMedia.addEventListener("change", renderCanteens);

const locateButton = document.getElementById("locate-button");
const locateStatus = document.getElementById("locate-status");
const LOCATE_MESSAGES = {
  UNSUPPORTED: "อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง",
  DENIED: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์",
  UNAVAILABLE: "ไม่สามารถระบุตำแหน่งได้ในขณะนี้",
  TIMEOUT: "ระบุตำแหน่งใช้เวลานานเกินไป กำลังลองใหม่..."
};

function setLocateUi(active) {
  locateButton.setAttribute("aria-pressed", String(active));
  locateButton.textContent = active
    ? "หยุดแสดงตำแหน่ง"
    : "📍 ตำแหน่งของฉัน";
}

function showLocateStatus(message) {
  locateStatus.textContent = message;
  locateStatus.hidden = !message;
}

locateButton.addEventListener("click", () => {
  if (CanteenMap.isTracking()) {
    CanteenMap.stopTracking();
    setLocateUi(false);
    showLocateStatus("");
    return;
  }

  setLocateUi(true);
  showLocateStatus("กำลังค้นหาตำแหน่ง...");
  CanteenMap.startTracking({
    onUpdate: () => showLocateStatus(""),
    onError: code => {
      showLocateStatus(LOCATE_MESSAGES[code] || "เกิดข้อผิดพลาด");
      if (!CanteenMap.isTracking()) setLocateUi(false);
    }
  });
});

// หยุดติดตามตำแหน่งเมื่อแท็บถูกซ่อน (ประหยัดแบตและไม่ติดตามโดยผู้ใช้ไม่รู้ตัว)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && CanteenMap.isTracking()) {
    CanteenMap.stopTracking();
    setLocateUi(false);
    showLocateStatus("หยุดแสดงตำแหน่งเนื่องจากคุณออกจากหน้านี้");
  }
});

initScrollHint(
  document.getElementById("period-filters"),
  document.getElementById("period-hint-host"),
  "horizontal"
);
initScrollHint(
  document.querySelector(".canteen-sidebar__content"),
  document.querySelector(".canteen-sidebar"),
  "vertical"
);

CanteenMap.init();
loadCanteens();
