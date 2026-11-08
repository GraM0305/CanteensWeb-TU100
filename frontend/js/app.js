import { getCanteens, getVendors } from "./api.js";
import { renderCanteenDetail } from "./canteen-detail-view.js";
import { renderCanteenList } from "./canteen-list-view.js";
import { createElement } from "./dom.js";
import { CanteenMap } from "./map.js";
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

CanteenMap.init();
loadCanteens();
