CREATE TABLE IF NOT EXISTS project_invitations (
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
) ENGINE=InnoDB;