ALTER TABLE users
    ADD COLUMN subscription_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL DEFAULT 'free' AFTER password_hash,
    ADD COLUMN subscription_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER subscription_plan;

