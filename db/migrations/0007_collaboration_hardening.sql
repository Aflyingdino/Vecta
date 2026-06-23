ALTER TABLE project_members
    MODIFY role ENUM('owner','admin','collaborator','viewer') NOT NULL;

ALTER TABLE project_invitations
    MODIFY role ENUM('admin','collaborator','viewer') NOT NULL DEFAULT 'collaborator';

ALTER TABLE project_invitations
    ADD COLUMN token VARCHAR(64) DEFAULT NULL AFTER invited_email;

ALTER TABLE project_invitations
    ADD COLUMN expires_at DATETIME DEFAULT NULL AFTER status;

CREATE UNIQUE INDEX idx_project_invitations_token ON project_invitations(token);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT DEFAULT NULL,
    task_id INT DEFAULT NULL,
    type VARCHAR(60) NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT,
    read_at DATETIME DEFAULT NULL,
    archived_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,
    INDEX idx_notifications_user_read_created (user_id, read_at, created_at),
    INDEX idx_notifications_project_created (project_id, created_at)
) ENGINE=InnoDB;
