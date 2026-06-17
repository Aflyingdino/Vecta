ALTER TABLE tasks
    ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER created_at;

CREATE INDEX idx_tasks_project_archived_at ON tasks(project_id, archived_at);
CREATE INDEX idx_tasks_group_archived_at ON tasks(group_id, archived_at);