ALTER TABLE attachments
    ADD COLUMN mime_type VARCHAR(150) DEFAULT NULL AFTER url,
    ADD COLUMN size_bytes INT DEFAULT NULL AFTER mime_type;

