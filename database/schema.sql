-- สคริปต์สร้างโครงสร้างฐานข้อมูล PostgreSQL สำหรับ TU Canteen Finder

-- ลบตารางเดิมหากมีอยู่ (เรียงลำดับตาม Foreign Key Dependencies)
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS canteens CASCADE;

-- 1. ตารางข้อมูลโรงอาหาร (Canteens)
CREATE TABLE canteens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    operating_period VARCHAR(20) DEFAULT 'DAY', -- 'DAY', 'NIGHT', 'ALL'
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางข้อมูลร้านค้า (Vendors)
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    canteen_id INT REFERENCES canteens(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,             -- อาหารตามสั่ง, ก๋วยเตี๋ยว, เครื่องดื่ม, ฮาลาล ฯลฯ
    is_halal BOOLEAN DEFAULT FALSE,
    opening_hours VARCHAR(100),
    avg_price_level VARCHAR(20),                -- 'ประหยัด', 'ปานกลาง', 'สูง'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางรายการเมนูอาหาร (Menus)
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE
);

-- สร้าง Indexes เพื่อเพิ่มความเร็วในการค้นหาและ Filter ข้อมูลใน PostgreSQL
CREATE INDEX idx_vendors_canteen ON vendors(canteen_id);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_halal ON vendors(is_halal);
CREATE INDEX idx_menus_vendor ON menus(vendor_id);