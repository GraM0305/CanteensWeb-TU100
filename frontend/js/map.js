// 1. ตัวแปรสำหรับเก็บอินสแตนซ์ของแผนที่ และ Object สำหรับอ้างอิง Markers ของแต่ละโรงอาหาร
let map;
const canteenMarkers = {};

// 2. ข้อมูลพิกัดและรายละเอียดของโรงอาหารทั้ง 8 แห่ง มธ.รังสิต
const canteensData = [
  { id: 1, name: "โรงอาหาร SC", lat: 14.069600, lng: 100.604400, period: "DAY", desc: "อาคารเรียนรวม SC3" },
  { id: 2, name: "โรงอาหาร JC", lat: 14.071800, lng: 100.605500, period: "DAY", desc: "ใกล้อาคารคณะวารสารศาสตร์ฯ" },
  { id: 3, name: "โรงอาหารกรีน (กลางวัน)", lat: 14.074100, lng: 100.602600, period: "DAY", desc: "อาคารกรีนแคนทีน (โหมดกลางวัน)" },
  { id: 4, name: "โรงอาหารกรีนดึก", lat: 14.074100, lng: 100.602600, period: "NIGHT", desc: "อาคารกรีนแคนทีน (โหมดร้านดึก)" },
  { id: 5, name: "โรงอาหารทิวสน", lat: 14.076200, lng: 100.606200, period: "DAY", desc: "ริมสระว่ายน้ำ มธ." },
  { id: 6, name: "โรงอาหารวิศวะ", lat: 14.076400, lng: 100.603200, period: "DAY", desc: "ใต้ตึกคณะวิศวกรรมศาสตร์" },
  { id: 7, name: "โรงอาหารปิยชาติ", lat: 14.071200, lng: 100.609800, period: "DAY", desc: "อาคารปิยชาติ โซนวิทยาศาสตร์สุขภาพ" },
  { id: 8, name: "OR Space", lat: 14.078200, lng: 100.607500, period: "ALL", desc: "คอมมูนิตี้มอลล์ OR Space" }
];

// 3. ฟังก์ชันเริ่มต้นสร้างแผนที่ Leaflet (Initialize Map)
function initMap() {
  // ตั้งพิกัดศูนย์กลาง มธ.รังสิต [Latitude, Longitude] ซูมระดับ 15
  map = L.map('map').setView([14.0740, 100.6050], 15);

  // ดึง TileLayer จาก OpenStreetMap
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

// 4. ฟังก์ชันปักหมุดโรงอาหารทั้งหมดทั้ง 8 แห่งลงบนแผนที่
function renderCanteenMarkers() {
  canteensData.forEach(canteen => {
    const popupContent = `
      <div class="p-1">
        <h4 class="font-bold text-slate-800 text-sm mb-1">${canteen.name}</h4>
        <p class="text-xs text-slate-500 mb-2">📍 ${canteen.desc}</p>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          canteen.period === 'NIGHT' 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-emerald-100 text-emerald-700'
        }">
          ${canteen.period === 'NIGHT' ? 'เปิดร้านดึก 🌙' : 'เปิดกลางวัน 🟢'}
        </span>
      </div>
    `;

    // สร้าง Marker และผูก Popup ข้อมูล
    const marker = L.marker([canteen.lat, canteen.lng])
      .addTo(map)
      .bindPopup(popupContent);

    // เก็บอ้างอิง Marker ไว้ใน Object ตาม canteen.id
    canteenMarkers[canteen.id] = marker;
  });
}

// 5. ฟังก์ชันซิงก์เมื่อผู้ใช้คลิกการ์ดฝั่งขวา ให้แผนที่ฝั่งซ้ายเลื่อน (FlyTo) ไปยังหมุดและเปิด Popup
function flyToCanteen(lat, lng, canteenId) {
  if (!map) return;

  map.flyTo([lat, lng], 17, {
    duration: 1.2,
    easeLinearity: 0.25
  });

  if (canteenId && canteenMarkers[canteenId]) {
    canteenMarkers[canteenId].openPopup();
  }
}

// 6. โหลดแผนที่และปักหมุดเมื่อสร้าง DOM เสร็จสิ้น
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderCanteenMarkers();
});

