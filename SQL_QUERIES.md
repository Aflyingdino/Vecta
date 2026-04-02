-- SQL Queries for Vecta Dashboard Features
-- These are useful queries to run in phpMyAdmin to view your tasks and statistics

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEW: All Tasks with Project Info and Status
-- ═════════════════════════════════════════════════════════════════════════════
-- Useful for Activity page and dashboard
SELECT 
    t.task_id,
    t.title as task_name,
    p.title as project_name,
    p.main_color as project_color,
    t.status,
    t.due_date as deadline,
    t.created_at,
    t.scheduled_start as calendar_start,
    t.duration_minutes as calendar_duration
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE p.archived_at IS NULL
ORDER BY t.created_at DESC;

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEW: Recent 5 Tasks (for Dashboard)
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 
    t.task_id,
    t.title,
    p.title as project_name,
    t.status,
    t.created_at
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE p.archived_at IS NULL
ORDER BY t.created_at DESC
LIMIT 5;

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEW: In Progress Counter (Stats)
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 
    COUNT(*) as in_progress_count,
    p.project_id,
    p.title as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE t.status = 'started'
  AND p.archived_at IS NULL
GROUP BY p.project_id, p.title
ORDER BY in_progress_count DESC;

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEW: Overdue Tasks (Cannot be dragged in calendar)
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 
    t.task_id,
    t.title,
    p.title as project_name,
    t.status,
    t.due_date,
    DATEDIFF(CURDATE(), t.due_date) as days_overdue
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE t.due_date < CURDATE()
  AND t.status != 'done'
  AND p.archived_at IS NULL
ORDER BY t.due_date ASC;

-- ═════════════════════════════════════════════════════════════════════════════
-- VIEW: Project Dashboard - Task Count by Status
-- ═════════════════════════════════════════════════════════════════════════════
-- Example: Replace PROJECT_ID with actual project ID
SELECT 
    p.project_id,
    p.title,
    COUNT(CASE WHEN t.status = 'not_started' THEN 1 END) as not_started,
    COUNT(CASE WHEN t.status = 'started' THEN 1 END) as started,
    COUNT(CASE WHEN t.status = 'ready_for_test' THEN 1 END) as ready_for_test,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as done,
    COUNT(t.task_id) as total
FROM projects p
LEFT JOIN tasks t ON p.project_id = t.project_id
WHERE p.project_id = PROJECT_ID  -- Replace with actual project ID
GROUP BY p.project_id, p.title;

-- ═════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Add Columns for Calendar Features (if not already present)
-- ═════════════════════════════════════════════════════════════════════════════
-- Note: These columns should already exist if data.json was properly loaded
-- Only run if you get errors about missing columns

-- Add calendar scheduling columns if missing:
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_start DATETIME DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS calendar_color VARCHAR(7) DEFAULT NULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- QUERY: Dashboard Statistics for All Projects
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN t.status = 'not_started' THEN 1 END) as not_started,
    COUNT(CASE WHEN t.status = 'started' THEN 1 END) as in_progress,
    COUNT(CASE WHEN t.status = 'ready_for_test' THEN 1 END) as ready_for_test,
    COUNT(CASE WHEN t.status = 'done' THEN 1 END) as completed,
    COUNT(CASE WHEN t.due_date < CURDATE() AND t.status != 'done' THEN 1 END) as overdue
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE p.archived_at IS NULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- QUERY: Projects with Task Summary (for Projects tab in dashboard)
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 
    p.project_id,
    p.title,
    p.main_color,
    COUNT(t.task_id) as task_count
FROM projects p
LEFT JOIN tasks t ON p.project_id = t.project_id
WHERE p.archived_at IS NULL
GROUP BY p.project_id, p.title, p.main_color
ORDER BY p.title;

-- ═════════════════════════════════════════════════════════════════════════════
-- USEFUL ADMINISTRATION QUERIES
-- ═════════════════════════════════════════════════════════════════════════════

-- Find all tasks without deadlines:
SELECT t.task_id, t.title, p.title as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE t.due_date IS NULL
ORDER BY p.title, t.title;

-- Find tasks not scheduled in calendar:
SELECT t.task_id, t.title, p.title as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE t.scheduled_start IS NULL
ORDER BY p.title, t.title;

-- Count tasks by status across all projects:
SELECT 
    status,
    COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY count DESC;

-- Find most recently created tasks:
SELECT 
    t.task_id,
    t.title,
    p.title as project_name,
    t.status,
    t.created_at
FROM tasks t
JOIN projects p ON t.project_id = p.project_id
WHERE p.archived_at IS NULL
ORDER BY t.created_at DESC
LIMIT 20;
