// Canteen detail page (canteen.html): one canteen and its vendors.
import { getCanteen, getCanteenVendors } from "./api.js";
import { createElement } from "./dom.js";
import { renderCanteenInfo } from "./canteen-page/canteen-info.js";
import { getFilteredVendors, setupFilters } from "./canteen-page/filters.js";
import { setupNoticeToggle, trackHeaderHeight } from "./canteen-page/page-chrome.js";
import { clearSkeleton, showSkeleton } from "./canteen-page/skeleton.js";
import { createVendorCard } from "./canteen-page/vendor-card.js";

const state = {
  canteen: null,
  vendors: [],
  category: "ALL",
  halal: "ALL",
  search: ""
};

const pageStatus = document.getElementById("page-status");
const canteenInfo = document.getElementById("canteen-info");
const vendorList = document.getElementById("vendor-list");
const vendorCount = document.getElementById("vendor-count");

function renderVendors() {
  const vendors = getFilteredVendors(state);

  vendorList.replaceChildren();
  vendorList.removeAttribute("aria-busy");
  vendorCount.textContent = `พบ ${vendors.length} ร้าน`;

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

  vendorList.append(...vendors.map(createVendorCard));
}

function readCanteenId() {
  const rawId = new URLSearchParams(window.location.search).get("id");
  const canteenId = Number(rawId);

  if (!rawId || !Number.isSafeInteger(canteenId) || canteenId <= 0) {
    throw new Error("Invalid canteen ID");
  }

  return canteenId;
}

async function init() {
  try {
    pageStatus.classList.remove("page-status--success", "page-status--error");
    pageStatus.textContent = "กำลังโหลดข้อมูลโรงอาหาร...";

    showSkeleton({ canteenInfo, vendorList });

    const canteenId = readCanteenId();

    [state.canteen, state.vendors] = await Promise.all([
      getCanteen(canteenId),
      getCanteenVendors(canteenId)
    ]);

    renderCanteenInfo(state.canteen, canteenInfo);

    setupFilters({
      state,
      chipsContainer: document.getElementById("mobile-filters"),
      searchInput: document.getElementById("vendor-search"),
      onChange: renderVendors
    });
    setupNoticeToggle({
      toggle: document.getElementById("notice-toggle"),
      popover: document.getElementById("notice-popover")
    });
    trackHeaderHeight(document.querySelector(".canteen-page__header"));

    renderVendors();

    document.title = `${state.canteen.name} - TU Canteen Finder`;
    pageStatus.textContent = "โหลดข้อมูลสำเร็จ";
    pageStatus.classList.add("page-status--success");
  } catch (error) {
    console.error("Canteen detail error:", error);

    clearSkeleton({ canteenInfo, vendorList });

    pageStatus.textContent = `ไม่สามารถโหลดข้อมูลได้: ${error.message}`;
    pageStatus.classList.add("page-status--error");
  }
}

init();
