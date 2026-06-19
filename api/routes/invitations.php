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
    $stmt = db()->prepare('
        SELECT i.invitation_id, i.project_id, i.invited_email, i.role, i.invited_by_user_id, i.status,
               i.accepted_by_user_id, i.invited_at, i.responded_at,
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

function formatInvitationRow(array $row): array
{
    return [
        'id' => (int) $row['invitation_id'],
        'projectId' => (int) $row['project_id'],
        'projectName' => $row['project_title'],
        'projectDescription' => $row['project_description'] ?? '',
        'projectColor' => $row['project_color'] ?? '#5b5bd6',
        'email' => normalizeEmail($row['invited_email']),
        'role' => $row['role'],
        'invitedBy' => $row['inviter_name'],
        'status' => $row['status'],
        'invitedAt' => $row['invited_at'],
        'respondedAt' => $row['responded_at'],
        'projectArchived' => $row['project_archived_at'] !== null,
    ];
}

function handleListInvitations(): never
{
    $uid = requireAuth();
    $email = currentUserEmail($uid);
    if ($email === null) {
        jsonError('Not authenticated', 401);
    }

    $stmt = db()->prepare("
        SELECT i.invitation_id, i.project_id, i.invited_email, i.role, i.invited_by_user_id, i.status,
               i.accepted_by_user_id, i.invited_at, i.responded_at,
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
    $uid = requireAuth();
    requireProjectAdmin($projectId, $uid);

    $data = jsonBody();
    requireFields($data, ['email']);

    $email = normalizeEmail($data['email']);
    if (!validEmail($email)) {
        jsonError('Invalid email address', 422);
    }

    $role = requireEnumValue($data['role'] ?? 'collaborator', ['admin', 'collaborator'], 'role');
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
        $stmt = $db->prepare('UPDATE project_invitations SET role = ?, invited_by_user_id = ?, invited_at = NOW(), responded_at = NULL, accepted_by_user_id = NULL WHERE invitation_id = ?');
        $stmt->execute([$role, $uid, (int) $existing['invitation_id']]);
        $invitationId = (int) $existing['invitation_id'];
    } else {
        $stmt = $db->prepare('INSERT INTO project_invitations (project_id, invited_email, role, invited_by_user_id) VALUES (?, ?, ?, ?)');
        $stmt->execute([$projectId, $email, $role, $uid]);
        $invitationId = (int) $db->lastInsertId();
    }

    $invitation = fetchInvitationById($invitationId);
    if (!$invitation) {
        jsonError('Invitation could not be created', 500);
    }

    logActivity($projectId, $uid, 'member_invited', sprintf('Invitation sent to %s as %s', $email, $role));

    jsonResponse(formatInvitationRow($invitation), $existing ? 200 : 201);
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