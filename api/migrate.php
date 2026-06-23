<?php
/*
 * CLI migration runner.
 * Applies SQL files in db/migrations exactly once.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script can only be executed from CLI.\n");
    exit(1);
}

function migrationFiles(string $dir): array
{
    $files = glob($dir . '/*.sql') ?: [];
    sort($files, SORT_NATURAL);
    return $files;
}

function splitSqlStatements(string $sql): array
{
    $statements = [];
    $buffer = '';

    foreach (preg_split('/\R/', $sql) as $line) {
        $trimmed = trim($line);

        if ($trimmed === '' || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '#')) {
            continue;
        }

        $buffer .= $line . "\n";
        if (str_ends_with(rtrim($line), ';')) {
            $statement = trim($buffer);
            if ($statement !== '') {
                $statements[] = $statement;
            }
            $buffer = '';
        }
    }

    $tail = trim($buffer);
    if ($tail !== '') {
        $statements[] = $tail;
    }

    return $statements;
}

function isIgnorableMigrationError(Throwable $e): bool
{
    if (!$e instanceof PDOException) {
        return false;
    }

    $driverCode = (int) ($e->errorInfo[1] ?? 0);

    // Allow recovery from partially-applied historical migrations.
    return in_array($driverCode, [
        1060, // Duplicate column name
        1061, // Duplicate key/index name
    ], true);
}

function columnExists(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare('
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
    ');
    $stmt->execute([$table, $column]);
    return (int) $stmt->fetchColumn() > 0;
}

function tableExists(PDO $pdo, string $table): bool
{
    $stmt = $pdo->prepare('
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
    ');
    $stmt->execute([$table]);
    return (int) $stmt->fetchColumn() > 0;
}

function indexExists(PDO $pdo, string $table, string $index): bool
{
    $stmt = $pdo->prepare('
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND INDEX_NAME = ?
    ');
    $stmt->execute([$table, $index]);
    return (int) $stmt->fetchColumn() > 0;
}

function runStatement(PDO $pdo, string $statement, string $label): void
{
    try {
        $pdo->exec($statement);
    } catch (Throwable $e) {
        if (!isIgnorableMigrationError($e)) {
            throw $e;
        }

        echo "WARN  {$label}: {$e->getMessage()}\n";
    }
}

function repairRequiredSchema(PDO $pdo): void
{
    echo "CHECK required schema\n";

    $columns = [
        ['users', 'preferred_theme', "ALTER TABLE users ADD COLUMN preferred_theme ENUM('light','dark') NOT NULL DEFAULT 'light' AFTER password_hash"],
        ['users', 'preferred_language', "ALTER TABLE users ADD COLUMN preferred_language ENUM('nl','en') NOT NULL DEFAULT 'nl' AFTER preferred_theme"],
        ['users', 'subscription_plan', "ALTER TABLE users ADD COLUMN subscription_plan ENUM('free','standard','premium','premium_plus','enterprise') NOT NULL DEFAULT 'free' AFTER password_hash"],
        ['users', 'subscription_updated_at', 'ALTER TABLE users ADD COLUMN subscription_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER subscription_plan'],
        ['users', 'subscription_started_at', 'ALTER TABLE users ADD COLUMN subscription_started_at DATETIME DEFAULT NULL AFTER subscription_plan'],
        ['users', 'subscription_expires_at', 'ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME DEFAULT NULL AFTER subscription_started_at'],
        ['users', 'subscription_next_plan', "ALTER TABLE users ADD COLUMN subscription_next_plan ENUM('free','standard','premium','premium_plus','enterprise') DEFAULT NULL AFTER subscription_expires_at"],
        ['users', 'subscription_next_starts_at', 'ALTER TABLE users ADD COLUMN subscription_next_starts_at DATETIME DEFAULT NULL AFTER subscription_next_plan'],
        ['users', 'subscription_next_expires_at', 'ALTER TABLE users ADD COLUMN subscription_next_expires_at DATETIME DEFAULT NULL AFTER subscription_next_starts_at'],
        ['tasks', 'archived_at', 'ALTER TABLE tasks ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER created_at'],
    ];

    foreach ($columns as [$table, $column, $statement]) {
        if (!columnExists($pdo, $table, $column)) {
            echo "REPAIR {$table}.{$column}\n";
            runStatement($pdo, $statement, "repair {$table}.{$column}");
        }
    }

    $indexes = [
        ['tasks', 'idx_tasks_project_archived_at', 'CREATE INDEX idx_tasks_project_archived_at ON tasks(project_id, archived_at)'],
        ['tasks', 'idx_tasks_group_archived_at', 'CREATE INDEX idx_tasks_group_archived_at ON tasks(group_id, archived_at)'],
        ['tasks', 'idx_tasks_archived_at', 'CREATE INDEX idx_tasks_archived_at ON tasks(archived_at)'],
    ];

    foreach ($indexes as [$table, $index, $statement]) {
        if (!indexExists($pdo, $table, $index)) {
            echo "REPAIR {$table}.{$index}\n";
            runStatement($pdo, $statement, "repair {$table}.{$index}");
        }
    }

    if (!tableExists($pdo, 'subscription_plan_events')) {
        echo "REPAIR subscription_plan_events\n";
        runStatement($pdo, "
            CREATE TABLE subscription_plan_events (
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
            ) ENGINE=InnoDB
        ", 'repair subscription_plan_events');
    }

    if (!tableExists($pdo, 'project_invitations')) {
        echo "REPAIR project_invitations\n";
        runStatement($pdo, "
            CREATE TABLE project_invitations (
                invitation_id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                invited_email VARCHAR(150) NOT NULL,
                role ENUM('admin','collaborator') NOT NULL DEFAULT 'collaborator',
                invited_by_user_id INT NOT NULL,
                status ENUM('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
                accepted_by_user_id INT DEFAULT NULL,
                invited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                responded_at DATETIME DEFAULT NULL,
                CONSTRAINT fk_project_invitations_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                CONSTRAINT fk_project_invitations_inviter FOREIGN KEY (invited_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                CONSTRAINT fk_project_invitations_accepted_by FOREIGN KEY (accepted_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_project_invitations_email_status (invited_email, status, invited_at),
                INDEX idx_project_invitations_project_status (project_id, status, invited_at)
            ) ENGINE=InnoDB
        ", 'repair project_invitations');
    }
}

$pdo = null;
try {
    $pdo = db();
} catch (Throwable $e) {
    fwrite(STDERR, "Database connection failed: {$e->getMessage()}\n");
    fwrite(STDERR, "Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS environment variables.\n");
    exit(1);
}
$migrationsDir = __DIR__ . '/../db/migrations';

if (!is_dir($migrationsDir)) {
    fwrite(STDERR, "Migration directory not found: {$migrationsDir}\n");
    exit(1);
}

$pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB');

$appliedRows = $pdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
$applied = array_fill_keys($appliedRows, true);

$pendingCount = 0;
foreach (migrationFiles($migrationsDir) as $file) {
    $version = basename($file, '.sql');

    if (isset($applied[$version])) {
        echo "SKIP  {$version}\n";
        continue;
    }

    $sql = file_get_contents($file);
    if ($sql === false) {
        fwrite(STDERR, "Unable to read migration: {$file}\n");
        exit(1);
    }

    $statements = splitSqlStatements($sql);
    if (count($statements) === 0) {
        echo "SKIP  {$version} (empty)\n";
        continue;
    }

    echo "APPLY {$version}\n";
    $pdo->beginTransaction();

    try {
        foreach ($statements as $statement) {
            runStatement($pdo, $statement, $version);
        }

        $stmt = $pdo->prepare('INSERT INTO schema_migrations (version) VALUES (?)');
        $stmt->execute([$version]);

        $pdo->commit();
        $pendingCount++;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        fwrite(STDERR, "FAILED {$version}: {$e->getMessage()}\n");
        exit(1);
    }
}

try {
    repairRequiredSchema($pdo);
} catch (Throwable $e) {
    fwrite(STDERR, "SCHEMA CHECK FAILED: {$e->getMessage()}\n");
    exit(1);
}

echo "Done. Applied {$pendingCount} migration(s).\n";
