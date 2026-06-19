UPDATE users
SET subscription_plan = 'enterprise'
WHERE subscription_plan = 'ultra_premium';

ALTER TABLE users
    MODIFY subscription_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL DEFAULT 'free';
