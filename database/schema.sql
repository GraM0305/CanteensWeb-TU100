
-- TU Canteen Finder
-- PostgreSQL Database Schema
-- Initial version: Canteens and Vendors only

-- =========================================
-- 1. CANTEENS TABLE
-- =========================================

CREATE TABLE canteens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    operating_period VARCHAR(20) DEFAULT 'DAY',
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. VENDORS TABLE
-- =========================================

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    canteen_id INT NOT NULL REFERENCES canteens(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_halal BOOLEAN DEFAULT NULL,
    opening_hours VARCHAR(100),
    starting_price INTEGER CHECK (starting_price >= 0),
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 3. INDEXES
-- =========================================

-- Search canteens by name
CREATE INDEX idx_canteens_name
ON canteens(name);

-- Find vendors by canteen
CREATE INDEX idx_vendors_canteen
ON vendors(canteen_id);

-- Filter vendors by food category
CREATE INDEX idx_vendors_category
ON vendors(category);

-- Filter vendors by halal status
CREATE INDEX idx_vendors_halal
ON vendors(is_halal);

CREATE UNIQUE INDEX idx_vendors_canteen_name
ON vendors(canteen_id, name);
