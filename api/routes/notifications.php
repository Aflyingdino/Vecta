<?php
/*
 * Notification routes: list, mark read, archive
 */

function formatNotificationRow(array $row): array
{
    return [
        'id' => (int) $row['notification_id'],
        'type' => $row['type'],
        'title' => $row['title'],
        'body' => $row['body'] ?? '',
        'projectId' => $row['project_id'] !== null ? (int) $row['project_id'] : null,
        'taskId' => $row['task_id'] !== null ? (int) $row['task_id'] : null,
        'createdAt' => $row['created_at'],
        'read' => $row['read_at'] !== null,
        'archived' => $row['archived_at'] !== null,
    ];
}

function handleListNotifications(): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    $stmt = db()->prepare('
        SELECT notification_id, user_id, project_id, task_id, type, title, body, read_at, archived_at, created_at
        FROM notifications
        WHERE user_id = ? AND archived_at IS NULL
        ORDER BY created_at DESC
        LIMIT 100
    ');
    $stmt->execute([$uid]);
    jsonResponse(array_map(fn($row) => formatNotificationRow($row), $stmt->fetchAll()));
}

function handleMarkNotificationRead(int $notificationId): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    db()->prepare('UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE notification_id = ? AND user_id = ?')
        ->execute([$notificationId, $uid]);
    jsonSuccess('Notification marked read');
}

function handleMarkAllNotificationsRead(): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    db()->prepare('UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE user_id = ? AND archived_at IS NULL')
        ->execute([$uid]);
    jsonSuccess('Notifications marked read');
}

function handleArchiveNotification(int $notificationId): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    db()->prepare('UPDATE notifications SET archived_at = COALESCE(archived_at, NOW()) WHERE notification_id = ? AND user_id = ?')
        ->execute([$notificationId, $uid]);
    jsonSuccess('Notification archived');
}
