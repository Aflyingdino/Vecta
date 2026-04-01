-- Vecta database bootstrap (non-destructive)
--
-- For new installations this file applies the initial migration and records it.
-- For upgrades, use: php api/migrate.php
--
-- Run from repository root:
-- mysql -u <user> -p <database> < db.sql

CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SOURCE db/migrations/0001_initial_schema.sql;
SOURCE db/migrations/0002_user_preferences.sql;

INSERT IGNORE INTO schema_migrations (version) VALUES ('0001_initial_schema');
INSERT IGNORE INTO schema_migrations (version) VALUES ('0002_user_preferences');
