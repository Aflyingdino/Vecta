-- Add archived_at column to tasks table to support task archiving
ALTER TABLE tasks ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER created_at;

-- Add index for better query performance when filtering archived tasks
CREATE INDEX idx_tasks_archived_at ON tasks(archived_at);
