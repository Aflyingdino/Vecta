ALTER TABLE users
    ADD COLUMN preferred_theme ENUM('light','dark') NOT NULL DEFAULT 'light' AFTER password_hash;

ALTER TABLE users
    ADD COLUMN preferred_language ENUM('nl','en') NOT NULL DEFAULT 'nl' AFTER preferred_theme;
