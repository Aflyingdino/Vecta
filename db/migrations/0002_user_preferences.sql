ALTER TABLE users
    ADD COLUMN preferred_theme VARCHAR(10) NOT NULL DEFAULT 'light',
    ADD COLUMN preferred_language VARCHAR(10) NOT NULL DEFAULT 'nl';