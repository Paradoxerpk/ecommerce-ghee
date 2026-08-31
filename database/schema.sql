-- Create Database Schema for Sai Krishna Ghee Store

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. CATEGORIES Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for category slugs
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 3. PRODUCTS Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- 4. PRODUCT VARIANTS Table (Weight/Quantity specific pricing and stock)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    weight_or_volume VARCHAR(50) NOT NULL, -- e.g., "100g", "250g", "500g", "1L", "5L"
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- 5. CART ITEMS Table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_variant_cart UNIQUE (user_id, variant_id)
);

-- 6. WISHLIST Table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);

-- 7. ORDERS Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for Guest Checkout
    guest_name VARCHAR(100),
    guest_email VARCHAR(100),
    guest_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    delivery_preference VARCHAR(150),
    payment_method VARCHAR(50) DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cod')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_id VARCHAR(100), -- Razorpay Order ID or Transaction ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 8. ORDER ITEMS Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0)
);

-- 9. INQUIRIES Table (Contact Form)
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. REVIEWS Table (For Phase 3, included now for schema integrity)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seeding Sample Data

-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Cow Ghee', 'cow-ghee', 'Pure cow ghee prepared with traditional methods for divine goodness and rich aroma.'),
('Buffalo Ghee', 'buffalo-ghee', 'High-quality buffalo ghee rich in nutrients, perfect for cooking and sweets.'),
('Premium A2 Ghee', 'premium-a2-ghee', 'Premium A2 cow ghee crafted using the ancient Bilona churning method.')
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO products (category_id, name, slug, description, images) VALUES
(
    1, 
    'Sai Krishna Pure Cow Ghee', 
    'sai-krishna-pure-cow-ghee', 
    'Sai Krishna Pure Cow Ghee is made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste. Rich in natural nutrients, vitamins, and antioxidants, it is an essential ingredient for a healthy daily diet and traditional cooking.', 
    ARRAY['/images/cow_ghee_front.webp', '/images/cow_ghee_back.webp']
),
(
    2, 
    'Sai Krishna Premium Buffalo Ghee', 
    'sai-krishna-premium-buffalo-ghee', 
    'Crafted from high-quality buffalo milk, Sai Krishna Buffalo Ghee features a distinctive granular white texture, rich flavor, and high smoke point. Excellent for traditional Indian sweets, deep-frying, and enhancing everyday meals.', 
    ARRAY['/images/buffalo_ghee_front.webp']
),
(
    3, 
    'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)', 
    'sai-krishna-vedic-a2-cow-ghee', 
    'Our super premium Vedic A2 Ghee is prepared using the ancient Bilona method — curdling milk, churning the curd to butter, and slowly boiling it. Sourced exclusively from purebred native cows, it offers unmatched medicinal values, deep aroma, and an exquisite granular structure.', 
    ARRAY['/images/a2_ghee_front.webp']
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Product Variants (Pricing & Inventory levels)
-- For Cow Ghee (ID 1)
INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku) VALUES
(1, '100g Pouch', 75.00, 500, 'SKG-COW-100P'),
(1, '250g Jar', 185.00, 200, 'SKG-COW-250J'),
(1, '500g Jar', 360.00, 150, 'SKG-COW-500J'),
(1, '1L Jar', 700.00, 100, 'SKG-COW-1000J')
ON CONFLICT (sku) DO NOTHING;

-- For Buffalo Ghee (ID 2)
INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku) VALUES
(2, '500g Jar', 380.00, 100, 'SKG-BUF-500J'),
(2, '1L Jar', 740.00, 75, 'SKG-BUF-1000J')
ON CONFLICT (sku) DO NOTHING;

-- For A2 Ghee (ID 3)
INSERT INTO product_variants (product_id, weight_or_volume, price, stock, sku) VALUES
(3, '250g Glass Jar', 450.00, 50, 'SKG-A2-250G'),
(3, '500g Glass Jar', 850.00, 40, 'SKG-A2-500G'),
(3, '1L Glass Jar', 1600.00, 20, 'SKG-A2-1000G')
ON CONFLICT (sku) DO NOTHING;

-- Seed Admin User (password is 'admin123' hashed using bcryptjs)
-- Hashed password for 'admin123': $2a$10$cKe.OKwajTeH8wo.uF9K/uCj94k3jJOqbRZJOvie5qI1Kf9CNcJke
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Sai Krishna Admin', 'admin@saikrishnaghee.com', '+919876543210', '$2a$10$cKe.OKwajTeH8wo.uF9K/uCj94k3jJOqbRZJOvie5qI1Kf9CNcJke', 'admin')
ON CONFLICT (email) DO NOTHING;
