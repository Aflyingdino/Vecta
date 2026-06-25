ALTER TABLE users
    ADD COLUMN subscription_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL DEFAULT 'free' AFTER password_hash;

ALTER TABLE users
    ADD COLUMN subscription_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER subscription_plan;

ALTER TABLE users
    ADD COLUMN subscription_started_at DATETIME DEFAULT NULL AFTER subscription_plan;

ALTER TABLE users
    ADD COLUMN subscription_expires_at DATETIME DEFAULT NULL AFTER subscription_started_at;

ALTER TABLE users
    ADD COLUMN subscription_next_plan ENUM('free','standard','premium','premium_plus','enterprise') DEFAULT NULL AFTER subscription_expires_at;

ALTER TABLE users
    ADD COLUMN subscription_next_starts_at DATETIME DEFAULT NULL AFTER subscription_next_plan;

ALTER TABLE users
    ADD COLUMN subscription_next_expires_at DATETIME DEFAULT NULL AFTER subscription_next_starts_at;

ALTER TABLE users
    MODIFY subscription_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL DEFAULT 'free';

ALTER TABLE users
    MODIFY subscription_next_plan ENUM('free','standard','premium','premium_plus','enterprise') DEFAULT NULL;

CREATE TABLE IF NOT EXISTS subscription_plan_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    from_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL,
    to_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL,
    event_type ENUM('activate','schedule','expire') NOT NULL,
    started_at DATETIME DEFAULT NULL,
    expires_at DATETIME DEFAULT NULL,
    scheduled_for DATETIME DEFAULT NULL,
    applied_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscription_events_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_subscription_events_user_created (user_id, created_at),
    INDEX idx_subscription_events_schedule (user_id, scheduled_for, expires_at)
) ENGINE=InnoDB;

ALTER TABLE project_members
    MODIFY role ENUM('owner','admin','collaborator','viewer') NOT NULL;

ALTER TABLE project_invitations
    MODIFY role ENUM('admin','collaborator','viewer') NOT NULL DEFAULT 'collaborator';

UPDATE users
SET
    subscription_plan = COALESCE(subscription_plan, 'free'),
    subscription_started_at = CASE
        WHEN subscription_plan = 'free' THEN NULL
        ELSE COALESCE(subscription_started_at, created_at)
    END,
    subscription_expires_at = CASE
        WHEN subscription_plan = 'free' THEN NULL
        ELSE COALESCE(subscription_expires_at, DATE_ADD(COALESCE(subscription_updated_at, created_at), INTERVAL 30 DAY))
    END,
    subscription_next_plan = NULL,
    subscription_next_starts_at = NULL,
    subscription_next_expires_at = NULL;
