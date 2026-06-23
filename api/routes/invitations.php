<?php
/*
 * Invitation routes: list, create, accept, decline
 */

function currentUserEmail(int $userId): ?string
{
    $stmt = db()->prepare('SELECT email FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return $row ? normalizeEmail($row['email']) : null;
}

function fetchInvitationById(int $invitationId): ?array
{
    ensureRuntimeSchema();
    $stmt = db()->prepare('
        SELECT i.invitation_id, i.project_id, i.invited_email, i.token, i.role, i.invited_by_user_id, i.status,
               i.expires_at, i.accepted_by_user_id, i.invited_at, i.responded_at,
               p.title AS project_title, p.description AS project_description, p.main_color AS project_color,
               p.archived_at AS project_archived_at,
               u.name AS inviter_name
        FROM project_invitations i
        JOIN projects p ON p.project_id = i.project_id
        JOIN users u ON u.user_id = i.invited_by_user_id
        WHERE i.invitation_id = ?
    ');
    $stmt->execute([$invitationId]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function fetchInvitationByToken(string $token): ?array
{
    ensureRuntimeSchema();
    $stmt = db()->prepare('
        SELECT i.invitation_id, i.project_id, i.invited_email, i.token, i.role, i.invited_by_user_id, i.status,
               i.expires_at, i.accepted_by_user_id, i.invited_at, i.responded_at,
               p.title AS project_title, p.description AS project_description, p.main_color AS project_color,
               p.archived_at AS project_archived_at,
               u.name AS inviter_name
        FROM project_invitations i
        JOIN projects p ON p.project_id = i.project_id
        JOIN users u ON u.user_id = i.invited_by_user_id
        WHERE i.token = ?
    ');
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function formatInvitationRow(array $row): array
{
    return [
        'id' => (int) $row['invitation_id'],
        'projectId' => (int) $row['project_id'],
        'projectName' => $row['project_title'],
        'projectDescription' => $row['project_description'] ?? '',
        'projectColor' => $row['project_color'] ?? '#5b5bd6',
        'email' => normalizeEmail($row['invited_email']),
        'token' => $row['token'] ?? null,
        'inviteUrl' => !empty($row['token']) ? appBaseUrl() . '/invite/' . $row['token'] : null,
        'role' => $row['role'],
        'invitedBy' => $row['inviter_name'],
        'status' => $row['status'],
        'expiresAt' => $row['expires_at'] ?? null,
        'invitedAt' => $row['invited_at'],
        'respondedAt' => $row['responded_at'],
        'projectArchived' => $row['project_archived_at'] !== null,
    ];
}

function handleListInvitations(): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    $email = currentUserEmail($uid);
    if ($email === null) {
        jsonError('Not authenticated', 401);
    }

    $stmt = db()->prepare("
        SELECT i.invitation_id, i.project_id, i.invited_email, i.token, i.role, i.invited_by_user_id, i.status,
               i.expires_at, i.accepted_by_user_id, i.invited_at, i.responded_at,
               p.title AS project_title, p.description AS project_description, p.main_color AS project_color,
               p.archived_at AS project_archived_at,
               u.name AS inviter_name
        FROM project_invitations i
        JOIN projects p ON p.project_id = i.project_id
        JOIN users u ON u.user_id = i.invited_by_user_id
        WHERE i.invited_email = ? AND i.status = 'pending'
        ORDER BY i.invited_at DESC
    ");
    $stmt->execute([$email]);

    jsonResponse(array_map(fn($row) => formatInvitationRow($row), $stmt->fetchAll()));
}

function handleCreateInvitation(int $projectId): never
{
    ensureRuntimeSchema();
    $uid = requireAuth();
    requireProjectAdmin($projectId, $uid);

    $data = jsonBody();
    requireFields($data, ['email']);

    $email = normalizeEmail($data['email']);
    if (!validEmail($email)) {
        jsonError('Invalid email address', 422);
    }

    $role = canonicalProjectRole((string) ($data['role'] ?? 'collaborator'));
    $role = requireEnumValue($role, ['admin', 'collaborator', 'viewer'], 'role');
    if ($role === 'admin') {
        if (!currentUserRolesEnabled($uid)) {
            jsonError('Roles are not available on your plan', 403);
        }
        requireProjectOwner($projectId, $uid);
    }

    $currentEmail = currentUserEmail($uid);
    if ($currentEmail !== null && $email === $currentEmail) {
        jsonError('You cannot invite yourself', 422);
    }

    $db = db();
    $token = bin2hex(random_bytes(32));
    $expiresAt = (new DateTimeImmutable('now'))->modify('+14 days')->format('Y-m-d H:i:s');

    $stmt = $db->prepare('SELECT user_id, name, email FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $targetUser = $stmt->fetch();
    if ($targetUser && projectRole($projectId, (int) $targetUser['user_id'])) {
        jsonError('User is already a member of this project', 409);
    }

    $stmt = $db->prepare('SELECT invitation_id FROM project_invitations WHERE project_id = ? AND invited_email = ? AND status = ?');
    $stmt->execute([$projectId, $email, 'pending']);
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $db->prepare('UPDATE project_invitations SET role = ?, token = ?, invited_by_user_id = ?, invited_at = NOW(), expires_at = ?, responded_at = NULL, accepted_by_user_id = NULL WHERE invitation_id = ?');
        $stmt->execute([$role, $token, $uid, $expiresAt, (int) $existing['invitation_id']]);
        $invitationId = (int) $existing['invitation_id'];
    } else {
        $stmt = $db->prepare('INSERT INTO project_invitations (project_id, invited_email, token, role, invited_by_user_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$projectId, $email, $token, $role, $uid, $expiresAt]);
        $invitationId = (int) $db->lastInsertId();
    }

    $invitation = fetchInvitationById($invitationId);
    if (!$invitation) {
        jsonError('Invitation could not be created', 500);
    }

    logActivity($projectId, $uid, 'member_invited', sprintf('Invitation sent to %s as %s', $email, $role));
    if ($targetUser) {
        createNotification((int) $targetUser['user_id'], 'invitation_received', 'Project invitation received', sprintf('%s invited you to %s', $invitation['inviter_name'], $invitation['project_title']), $projectId);
    }

    jsonResponse(formatInvitationRow($invitation), $existing ? 200 : 201);
}

function handleGetInvitationByToken(string $token): never
{
    $uid = requireAuth();
    $email = currentUserEmail($uid);
    $invitation = fetchInvitationByToken($token);
    if (!$invitation) {
        jsonError('Invitation not found', 404);
    }
    if (normalizeEmail($invitation['invited_email']) !== $email) {
        jsonError('This invitation is not for your account', 403);
    }
    if ($invitation['status'] !== 'pending') {
        jsonError('Invitation is no longer pending', 409);
    }
    if (!empty($invitation['expires_at']) && new DateTimeImmutable($invitation['expires_at']) < new DateTimeImmutable('now')) {
        jsonError('Invitation has expired', 410);
    }

    jsonResponse(formatInvitationRow($invitation));
}

function handleAcceptInvitation(int $invitationId): never
{
    $uid = requireAuth();
    $email = currentUserEmail($uid);
    if ($email === null) {
        jsonError('Not authenticated', 401);
    }

    $invitation = fetchInvitationById($invitationId);
    if (!$invitation) {
        jsonError('Invitation not found', 404);
    }

    if (normalizeEmail($invitation['invited_email']) !== $email) {
        jsonError('This invitation is not for your account', 403);
    }

    if ($invitation['status'] !== 'pending') {
        jsonError('Invitation is no longer pending', 409);
    }
    if (!empty($invitation['expires_at']) && new DateTimeImmutable($invitation['expires_at']) < new DateTimeImmutable('now')) {
        jsonError('Invitation has expired', 410);
    }

    $projectId = (int) $invitation['project_id'];
    $role = $invitation['role'];

    if (!projectRole($projectId, $uid)) {
        db()->prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)')
            ->execute([$projectId, $uid, $role]);
    } else {
        db()->prepare('UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ? AND role <> ?')
            ->execute([$role, $projectId, $uid, 'owner']);
    }

    db()->prepare('UPDATE project_invitations SET status = ?, accepted_by_user_id = ?, responded_at = NOW() WHERE invitation_id = ?')
        ->execute(['accepted', $uid, $invitationId]);

    logActivity($projectId, $uid, 'member_joined', 'Invitation accepted');
    createNotification((int) $invitation['invited_by_user_id'], 'invitation_accepted', 'Invitation accepted', sprintf('%s joined %s', $email, $invitation['project_title']), $projectId);

    jsonResponse([
        'invitationId' => $invitationId,
        'projectId' => $projectId,
        'status' => 'accepted',
    ]);
}

function handleDeclineInvitation(int $invitationId): never
{
    $uid = requireAuth();
    $email = currentUserEmail($uid);
    if ($email === null) {
        jsonError('Not authenticated', 401);
    }

    $invitation = fetchInvitationById($invitationId);
    if (!$invitation) {
        jsonError('Invitation not found', 404);
    }

    if (normalizeEmail($invitation['invited_email']) !== $email) {
        jsonError('This invitation is not for your account', 403);
    }

    if ($invitation['status'] !== 'pending') {
        jsonError('Invitation is no longer pending', 409);
    }

    db()->prepare('UPDATE project_invitations SET status = ?, accepted_by_user_id = NULL, responded_at = NOW() WHERE invitation_id = ?')
        ->execute(['declined', $invitationId]);

    jsonResponse([
        'invitationId' => $invitationId,
        'projectId' => (int) $invitation['project_id'],
        'status' => 'declined',
    ]);
}

function handleAcceptInvitationByToken(string $token): never
{
    $invitation = fetchInvitationByToken($token);
    if (!$invitation) {
        jsonError('Invitation not found', 404);
    }
    handleAcceptInvitation((int) $invitation['invitation_id']);
}

function handleRevokeInvitation(int $invitationId): never
{
    $uid = requireAuth();
    $invitation = fetchInvitationById($invitationId);
    if (!$invitation) {
        jsonError('Invitation not found', 404);
    }
    requireProjectAdmin((int) $invitation['project_id'], $uid);
    db()->prepare('UPDATE project_invitations SET status = ?, responded_at = NOW() WHERE invitation_id = ?')
        ->execute(['cancelled', $invitationId]);
    logActivity((int) $invitation['project_id'], $uid, 'invitation_revoked', sprintf('Invitation for %s revoked', $invitation['invited_email']));
    jsonResponse(['invitationId' => $invitationId, 'projectId' => (int) $invitation['project_id'], 'status' => 'cancelled']);
}
