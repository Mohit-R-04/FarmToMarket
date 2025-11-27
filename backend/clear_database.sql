-- Clear all data from FarmToMarket database
-- WARNING: This will delete ALL data from all tables!

-- Disable foreign key checks temporarily (if needed)
-- Note: PostgreSQL doesn't have a global FK disable, so we use CASCADE

-- Clear all tables in the correct order (respecting foreign key constraints)
-- Or use TRUNCATE with CASCADE to handle dependencies automatically

TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE seller_requests CASCADE;
TRUNCATE TABLE transporter_requests CASCADE;
TRUNCATE TABLE users CASCADE;

-- Alternative: If you want to reset auto-increment sequences as well
-- TRUNCATE TABLE bookings RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE seller_requests RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE transporter_requests RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Verify tables are empty
SELECT 'bookings' as table_name, COUNT(*) as count FROM bookings
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'seller_requests', COUNT(*) FROM seller_requests
UNION ALL
SELECT 'transporter_requests', COUNT(*) FROM transporter_requests
UNION ALL
SELECT 'users', COUNT(*) FROM users;
