export const state = {
  canteens: [],
  filteredCanteens: [],
  selectedCanteen: null,
  vendors: [],
  vendorCache: new Map(),
  searchQuery: "",
  activePeriod: "ALL",
  mobileCanteenId: "",
  mobilePickerOpen: false,
  vendorCategory: "ALL",
  halalOnly: false,
  requestId: 0
};
