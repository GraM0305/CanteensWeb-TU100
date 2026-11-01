// โลจิกสำหรับค้นหาและกรองข้อมูลโรงอาหารฝั่งขวา (Search & Category Filter)

document.addEventListener('DOMContentLoaded', () => {
  // 1. อ้างอิง Element ที่สำคัญใน DOM
  const searchInput = document.querySelector('input[type="text"]');
  const filterButtons = document.querySelectorAll('.overflow-x-auto button');
  const canteenCards = document.querySelectorAll('.flex-1.overflow-y-auto > div');

  // ตัวแปรเก็บสถานะตัวกรองปัจจุบัน
  let currentSearchQuery = '';
  let activeFilterCategory = 'ทั้งหมด';

  // 2. ฟังก์ชันหลักในการกรองและซ่อน/แสดงการ์ดโรงอาหาร
  function filterCanteens() {
    canteenCards.forEach(card => {
      const canteenTitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const canteenDesc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const canteenStatusText = card.querySelector('span')?.textContent || '';
      const menuPreviewText = card.querySelectorAll('p')[1]?.textContent.toLowerCase() || '';

      // เช็กเงื่อนไขคำค้นหา (Search Query Match)
      const matchesSearch = 
        canteenTitle.includes(currentSearchQuery) ||
        canteenDesc.includes(currentSearchQuery) ||
        menuPreviewText.includes(currentSearchQuery);

      // เช็กเงื่อนไขหมวดหมู่ตัวกรอง (Filter Chip Match)
      let matchesCategory = true;

      if (activeFilterCategory === '🟢 เปิดอยู่') {
        matchesCategory = canteenStatusText.includes('เปิดอยู่');
      } else if (activeFilterCategory === '🌙 กรีนดึก') {
        matchesCategory = canteenTitle.includes('กรีนดึก') || canteenStatusText.includes('🌙');
      } else if (activeFilterCategory === '☪️ ฮาลาล') {
        // เช็กว่าการ์ดหรือเมนูมีแท็กฮาลาลหรือไม่
        matchesCategory = menuPreviewText.includes('ฮาลาล') || canteenTitle.includes('ฮาลาล');
      }

      // แสดงหรือซ่อนการ์ดตามผลลัพธ์
      if (matchesSearch && matchesCategory) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // 3. ผูก Event Listener เมื่อผู้ใช้พิมพ์ข้อความค้นหา
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      filterCanteens();
    });
  }

  // 4. ผูก Event Listener เมื่อผู้ใช้คลิกชิปตัวกรองหมวดหมู่
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // ปรับสไตล์ปุ่มที่ถูกเลือก (Active State)
      filterButtons.forEach(btn => {
        btn.className = 'px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap transition-colors';
      });

      button.className = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold whitespace-nowrap shadow-sm';

      // อัปเดตหมวดหมู่ปัจจุบันและประมวลผลการกรอง
      activeFilterCategory = button.textContent.trim();
      filterCanteens();
    });
  });
});
