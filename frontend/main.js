/* ==========================================================
   main.js — ค้นหาโรงอาหาร
   ลำดับการทำงาน: โหลด cafeterias.json -> กรอง (ค้นหา + ตัวกรองด่วน)
   -> แสดงผลบนแผนที่ (Leaflet) และรายการใน DOM
   ========================================================== */
'use strict';

/* ---------- ค่าคงที่ ---------- */
const DATA_URL = 'cafeterias.json';
const MAP_CENTER = [14.0692, 100.6012]; // พิกัดกลางแผนที่เริ่มต้น (ค่าสมมติ)
const MAP_ZOOM = 17;

// ป้ายชื่อสิ่งอำนวยความสะดวก (คีย์ต้องตรงกับ "facilities" ใน cafeterias.json)
const FACILITY_LABELS = {
  aircon: 'ติดแอร์',
  halal: 'ฮาลาล',
  wifi: 'Wi-Fi',
  parking: 'ที่จอดรถ'
};

// เงื่อนไขของปุ่ม Quick Filter (คีย์ต้องตรงกับ data-filter ใน index.html)
const FILTERS = {
  open: (c) => c.isOpen,
  aircon: (c) => c.facilities.includes('aircon'),
  halal: (c) => c.facilities.includes('halal')
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- สถานะของแอป ---------- */
const state = {
  cafeterias: [],          // ข้อมูลทั้งหมดจาก JSON
  query: '',               // คำค้นหา
  activeFilters: new Set(),// ตัวกรองที่กดอยู่ เช่น 'open', 'halal'
  selectedId: null         // id ของโรงอาหารที่ถูกเลือก
};

/* ---------- อ้างอิง DOM ---------- */
const searchInput = document.getElementById('search');
const chipButtons = document.querySelectorAll('.chip');
const countEl = document.getElementById('result-count');
const listEl = document.getElementById('cafeteria-list');
const detailEl = document.getElementById('detail');

/* ---------- แผนที่ ---------- */
let map;
const markerLayer = L.layerGroup();

/** สร้างแผนที่ Leaflet พร้อมแผนที่พื้นหลังจาก OpenStreetMap */
function initMap() {
  map = L.map('map').setView(MAP_CENTER, MAP_ZOOM);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; ผู้ร่วมสร้าง OpenStreetMap'
  }).addTo(map);
  markerLayer.addTo(map);
}

/** สร้างไอคอนหมุด: สีเทาเมื่อปิด และขยายใหญ่เมื่อถูกเลือก */
function createPinIcon(cafeteria, isSelected) {
  const classes = ['pin'];
  if (!cafeteria.isOpen) classes.push('pin--closed');
  if (isSelected) classes.push('pin--selected');
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="${classes.join(' ')}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28] // ปลายหมุดชี้ที่พิกัดจริง
  });
}

/** วาดหมุดใหม่ทั้งหมดตามรายการที่ผ่านการกรอง */
function renderMarkers(cafeterias) {
  markerLayer.clearLayers();
  cafeterias.forEach((c) => {
    const marker = L.marker([c.lat, c.lng], {
      icon: createPinIcon(c, c.id === state.selectedId),
      title: c.name,
      keyboard: false // ผู้ใช้คีย์บอร์ดเลือกผ่านรายการด้านล่างแทน
    });
    marker.on('click', () => selectCafeteria(c.id));
    marker.addTo(markerLayer);
  });
}

/** ปรับมุมมองแผนที่ให้เห็นหมุดทั้งหมดที่ผ่านการกรอง */
function fitMapToResults(cafeterias) {
  if (cafeterias.length === 0) return;
  const bounds = L.latLngBounds(cafeterias.map((c) => [c.lat, c.lng]));
  map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18, animate: !prefersReducedMotion });
}

/* ---------- ค้นหา & กรอง ---------- */

/** รวมข้อความที่ค้นหาได้ของโรงอาหาร: ชื่อโรงอาหาร + ชื่อร้าน + ประเภท + เมนู */
function buildSearchText(cafeteria) {
  const stallText = cafeteria.stalls
    .map((s) => `${s.name} ${s.type} ${s.menu}`)
    .join(' ');
  return `${cafeteria.name} ${stallText}`.toLowerCase();
}

/** คืนเฉพาะโรงอาหารที่ตรงกับคำค้นหา และผ่านตัวกรองที่เปิดอยู่ "ทุกตัว" */
function getFilteredCafeterias() {
  const q = state.query.trim().toLowerCase();
  const activeKeys = [...state.activeFilters];

  return state.cafeterias.filter((c) => {
    const passFilters = activeKeys.every((key) => FILTERS[key](c));
    const passQuery = q === '' || buildSearchText(c).includes(q);
    return passFilters && passQuery;
  });
}

/* ---------- ตัวช่วยสร้าง DOM ---------- */

/** สร้าง element พร้อม class และข้อความ (ใช้ textContent เพื่อกัน XSS) */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function getFacilityLabel(key) {
  return FACILITY_LABELS[key] || key;
}

/* ---------- Render ---------- */

/** แสดงรายการโรงอาหารที่ผ่านการกรอง */
function renderList(cafeterias) {
  listEl.replaceChildren();
  countEl.textContent = `พบ ${cafeterias.length} โรงอาหาร`;

  if (cafeterias.length === 0) {
    const item = el('li', 'empty');
    item.append(el('p', null, 'ไม่พบโรงอาหารที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหรือล้างตัวกรอง'));
    const resetBtn = el('button', 'empty-action', 'ล้างการค้นหาและตัวกรอง');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', resetSearchAndFilters);
    item.append(resetBtn);
    listEl.append(item);
    return;
  }

  cafeterias.forEach((c) => {
    const item = el('li', 'cafeteria-item');
    const btn = el('button', 'cafeteria-btn');
    btn.type = 'button';
    btn.dataset.id = c.id;
    btn.setAttribute('aria-pressed', String(c.id === state.selectedId));

    btn.append(el('span', 'cafeteria-name', c.name));
    btn.append(el('span', `status ${c.isOpen ? 'status--open' : 'status--closed'}`,
      c.isOpen ? 'เปิดอยู่' : 'ปิดอยู่'));

    const facilityText = c.facilities.map(getFacilityLabel).join(', ');
    btn.append(el('span', 'cafeteria-meta', `${c.hours} น. | ${facilityText}`));

    item.append(btn);
    listEl.append(item);
  });
}

/** แสดงรายละเอียดของโรงอาหารที่เลือก รวมถึงร้านค้าภายใน */
function renderDetail() {
  const c = state.cafeterias.find((x) => x.id === state.selectedId);

  if (!c) {
    detailEl.hidden = true;
    detailEl.replaceChildren();
    return;
  }

  detailEl.replaceChildren();

  // ส่วนหัว: ชื่อ + เวลาเปิด-ปิด + ปุ่มปิดรายละเอียด
  const head = el('div', 'detail-head');
  const titleBox = el('div');
  titleBox.append(el('h2', 'detail-title', c.name));
  titleBox.append(el('p', 'detail-hours',
    `${c.isOpen ? 'เปิดอยู่' : 'ปิดอยู่'} เวลาทำการ ${c.hours} น.`));
  const closeBtn = el('button', 'detail-close', 'ปิด');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', `ปิดรายละเอียด ${c.name}`);
  closeBtn.addEventListener('click', clearSelection);
  head.append(titleBox, closeBtn);

  // สิ่งอำนวยความสะดวก
  const tags = el('ul', 'tags');
  c.facilities.forEach((f) => tags.append(el('li', 'tag', getFacilityLabel(f))));

  // รายชื่อร้านค้าภายในโรงอาหาร
  const stallHeading = el('h3', 'stall-heading', `ร้านในโรงอาหาร (${c.stalls.length} ร้าน)`);
  const stallList = el('ul', 'stall-list');
  c.stalls.forEach((s) => {
    const li = el('li', 'stall');
    const top = el('div', 'stall-top');
    top.append(el('span', 'stall-name', s.name), el('span', 'stall-type', s.type));
    li.append(top, el('p', 'stall-menu', s.menu));
    stallList.append(li);
  });

  detailEl.append(head, tags, stallHeading, stallList);
  detailEl.hidden = false;
}

/**
 * วาดหน้าจอทั้งหมดใหม่จาก state
 * @param {{fit?: boolean}} options fit=true จะปรับแผนที่ให้เห็นผลลัพธ์ทั้งหมด
 */
function render({ fit = true } = {}) {
  const filtered = getFilteredCafeterias();

  // ถ้าโรงอาหารที่เลือกอยู่ถูกกรองออก ให้ยกเลิกการเลือก
  if (state.selectedId && !filtered.some((c) => c.id === state.selectedId)) {
    state.selectedId = null;
  }

  renderMarkers(filtered);
  renderList(filtered);
  renderDetail();
  if (fit) fitMapToResults(filtered);
}

/* ---------- การเลือกโรงอาหาร ---------- */

/** เลือกโรงอาหาร: ไฮไลต์หมุด/รายการ เลื่อนแผนที่ไปยังตำแหน่ง และแสดงร้านค้าภายใน */
function selectCafeteria(id) {
  const cafeteria = state.cafeterias.find((c) => c.id === id);
  if (!cafeteria) return;

  // จำไว้ว่าผู้ใช้กดจากรายการหรือไม่ เพื่อคืน focus ให้คีย์บอร์ดหลังวาดใหม่
  const hadListFocus = document.activeElement?.classList.contains('cafeteria-btn');

  state.selectedId = id;
  render({ fit: false });

  map.setView([cafeteria.lat, cafeteria.lng], Math.max(map.getZoom(), MAP_ZOOM),
    { animate: !prefersReducedMotion });

  if (hadListFocus) {
    listEl.querySelector(`[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  }
  detailEl.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'nearest'
  });
}

/** ยกเลิกการเลือกโรงอาหาร */
function clearSelection() {
  state.selectedId = null;
  render({ fit: false });
}

/* ---------- Event handlers ---------- */

/** สลับเปิด/ปิดตัวกรองด่วน แล้วกรองใหม่ */
function toggleFilter(button) {
  const key = button.dataset.filter;
  if (state.activeFilters.has(key)) {
    state.activeFilters.delete(key);
  } else {
    state.activeFilters.add(key);
  }
  button.setAttribute('aria-pressed', String(state.activeFilters.has(key)));
  render();
}

/** ล้างคำค้นหาและตัวกรองทั้งหมด */
function resetSearchAndFilters() {
  state.query = '';
  state.activeFilters.clear();
  searchInput.value = '';
  chipButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  render();
}

function bindEvents() {
  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    render();
  });

  chipButtons.forEach((button) => {
    button.addEventListener('click', () => toggleFilter(button));
  });

  // Event delegation: ฟังที่ <ul> ตัวเดียวแทนการผูกทุกปุ่ม
  listEl.addEventListener('click', (event) => {
    const btn = event.target.closest('.cafeteria-btn');
    if (btn) selectCafeteria(btn.dataset.id);
  });
}

/* ---------- เริ่มต้นแอป ---------- */

/** โหลดข้อมูลโรงอาหารจากไฟล์ JSON */
async function loadCafeterias() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
  const data = await response.json();
  return data.cafeterias;
}

/** แจ้งผู้ใช้เมื่อโหลดข้อมูลไม่สำเร็จ พร้อมวิธีแก้ */
function showLoadError() {
  countEl.textContent = '';
  listEl.replaceChildren();
  const item = el('li', 'empty');
  item.append(el('p', null,
    'โหลดข้อมูลโรงอาหารไม่สำเร็จ หากเปิดไฟล์ index.html โดยตรง ให้รันผ่านเซิร์ฟเวอร์ในเครื่อง เช่น python -m http.server แล้วเปิด http://localhost:8000'));
  listEl.append(item);
}

async function init() {
  initMap();
  bindEvents();
  try {
    state.cafeterias = await loadCafeterias();
    render();
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

init();