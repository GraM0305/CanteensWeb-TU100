// frontend/js/api.js

// ⚠️ นำ Invoke URL ที่คัดลอกมาจาก AWS API Gateway (เมนู Stages) มาวางแทนที่ด้านล่างนี้
const API_BASE_URL = 'https://5udg6ysrgj.execute-api.us-east-1.amazonaws.com';

/**
 * ดึงข้อมูลรายการโรงอาหารจาก AWS API Gateway
 */
async function fetchCanteens() {
    try {
        const response = await fetch(`${API_BASE_URL}/canteens`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const canteens = await response.json();
        console.log('ดึงข้อมูลโรงอาหารสำเร็จ:', canteens);
        
        // แสดงผลการ์ดและหมุดแผนที่
        renderCanteens(canteens);
        return canteens;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลจาก API Gateway:', error);
    }
}

/**
 * แสดงผลข้อมูลการ์ดโรงอาหารและปักหมุดบนแผนที่ Dynamic
 * @param {Array} canteens - รายการข้อมูลโรงอาหารจาก PostgreSQL
 */
function renderCanteens(canteens) {
    const canteenContainer = document.getElementById('canteen-list');
    
    if (canteenContainer) {
        canteenContainer.innerHTML = ''; // ล้างข้อมูลการ์ดเดิมใน HTML

        canteens.forEach(canteen => {
            // 1. สร้าง HTML Card
            const card = document.createElement('div');
            card.className = 'canteen-card bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer mb-3';
            card.setAttribute('data-category', canteen.category || '');
            
            // คลิกการ์ดแล้วเลื่อนแผนที่ไปยังพิกัดโรงอาหาร
            card.onclick = () => {
                if (typeof flyToCanteen === 'function') {
                    flyToCanteen(canteen.lat, canteen.lng);
                }
            };

            const statusBadge = canteen.is_open 
                ? '<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">เปิดอยู่</span>'
                : '<span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-medium">ปิดแล้ว</span>';

            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-slate-800 text-lg">${canteen.name}</h3>
                    ${statusBadge}
                </div>
                <p class="text-xs text-slate-500 mb-2">${canteen.description || ''}</p>
                <div class="text-xs text-slate-600 flex items-center gap-1">
                    <span>🕒 ${canteen.opening_hours || 'ไม่ระบุเวลา'}</span>
                </div>
            `;

            canteenContainer.appendChild(card);

            // 2. ปักหมุด Dynamic Marker ลงแผนที่ Leaflet (หากมีฟังก์ชันใน map.js)
            if (typeof addDynamicMarker === 'function') {
                addDynamicMarker(canteen);
            }
        });
    }
}

// เรียกดึงข้อมูลจาก API ทันทีเมื่อโหลดหน้าเว็บเรียบร้อย
document.addEventListener('DOMContentLoaded', () => {
    fetchCanteens();
});

