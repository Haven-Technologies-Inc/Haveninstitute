INSERT INTO users (id, email, password_hash, full_name, role, subscription_tier, is_active, created_at, updated_at) 
VALUES (UUID(), 'admin@havenstudy.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.AQPbFJqyZcO1Gy', 'Admin User', 'admin', 'premium', 1, NOW(), NOW());
