<?php
/*
 * Auth routes: register, login, logout, me
 */

function handleRegister(): never
{
    $data = jsonBody();
    requireFields($data, ['name', 'email', 'password']);

    $name  = clampString($data['name'], 100);
    $email = normalizeEmail($data['email']);
    $pass  = $data['password'];

    validateUsername($name);

    if (!validEmail($email)) jsonError('Invalid email address', 422);
    if (!validPassword($pass)) jsonError('Password is required', 422);

    $planInput = $data['subscriptionPlan'] ?? DEFAULT_SUBSCRIPTION_PLAN;
    if (!validSubscriptionPlan($planInput)) {
        jsonError('Invalid subscription plan', 422);
    }
    $plan = subscriptionPlanKey($planInput);

    enforceRateLimit('register-email:' . sha1($email), RATE_LIMIT_AUTH, RATE_LIMIT_AUTH_WINDOW);

    $db = db();

    // Check uniqueness
    $stmt = $db->prepare('SELECT user_id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonError('Email already in use', 409);

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (name, email, password_hash, subscription_plan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $email, $hash, $plan]);
    $uid = (int) $db->lastInsertId();

    $subscriptionStartedAt = null;
    $subscriptionExpiresAt = null;
    if ($plan !== 'free') {
        $subscriptionStartedAt = date('Y-m-d H:i:s');
        $subscriptionExpiresAt = subscriptionPlanExpirationFrom($plan);
        db()->prepare('UPDATE users SET subscription_started_at = ?, subscription_expires_at = ?, subscription_updated_at = NOW() WHERE user_id = ?')
            ->execute([$subscriptionStartedAt, $subscriptionExpiresAt, $uid]);
        db()->prepare('INSERT INTO subscription_plan_events (user_id, from_plan, to_plan, event_type, started_at, expires_at, applied_at) VALUES (?, ?, ?, ?, ?, ?, NOW())')
            ->execute([$uid, 'free', $plan, 'activate', $subscriptionStartedAt, $subscriptionExpiresAt]);
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $uid;
    $_SESSION['last_activity_at'] = time();
    rotateCsrfToken();

    securityLog('register_success', ['userId' => $uid]);

    jsonResponse([
        'id' => $uid,
        'name' => $name,
        'email' => $email,
        'subscriptionPlan' => subscriptionPlanKey($plan),
        'subscriptionStartedAt' => $subscriptionStartedAt,
        'subscriptionExpiresAt' => $subscriptionExpiresAt,
        'subscriptionNextPlan' => null,
        'subscriptionNextStartsAt' => null,
        'subscriptionNextExpiresAt' => null,
        'csrfToken' => csrfToken(),
    ], 201);
}

function handleLogin(): never
{
    $data = jsonBody();
    requireFields($data, ['email', 'password']);

    $email = normalizeEmail($data['email']);
    $pass  = $data['password'];

    enforceRateLimit('login-email:' . sha1($email), RATE_LIMIT_AUTH, RATE_LIMIT_AUTH_WINDOW);

    $stmt = db()->prepare('SELECT user_id, name, email, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        securityLog('login_failed', ['emailHash' => sha1($email)]);
        jsonError('Invalid email or password', 401);
    }

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        $rehash = password_hash($pass, PASSWORD_DEFAULT);
        db()->prepare('UPDATE users SET password_hash = ? WHERE user_id = ?')
            ->execute([$rehash, (int) $user['user_id']]);
    }

    $user = refreshUserSubscriptionState((int) $user['user_id']) ?? $user;

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['user_id'];
    $_SESSION['last_activity_at'] = time();
    rotateCsrfToken();

    securityLog('login_success', ['userId' => (int) $user['user_id']]);

    jsonResponse([
        'id'    => (int) $user['user_id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'subscriptionPlan' => subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN),
        'subscriptionStartedAt' => $user['subscription_started_at'] ?? null,
        'subscriptionExpiresAt' => $user['subscription_expires_at'] ?? null,
        'subscriptionNextPlan' => $user['subscription_next_plan'] ?? null,
        'subscriptionNextStartsAt' => $user['subscription_next_starts_at'] ?? null,
        'subscriptionNextExpiresAt' => $user['subscription_next_expires_at'] ?? null,
        'csrfToken' => csrfToken(),
    ]);
}

function handleLogout(): never
{
    $uid = currentUserId();
    clearSessionState();
    securityLog('logout', ['userId' => $uid]);
    jsonSuccess('Logged out');
}

function handleMe(): never
{
    $uid = currentUserId();
    if (!$uid) jsonError('Not authenticated', 401);

    $user = refreshUserSubscriptionState($uid);

    if (!$user) {
        // Session references a deleted user
        $_SESSION = [];
        jsonError('Not authenticated', 401);
    }

    jsonResponse([
        'id' => (int) $user['user_id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'subscriptionPlan' => subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN),
        'subscriptionStartedAt' => $user['subscription_started_at'] ?? null,
        'subscriptionExpiresAt' => $user['subscription_expires_at'] ?? null,
        'subscriptionNextPlan' => $user['subscription_next_plan'] ?? null,
        'subscriptionNextStartsAt' => $user['subscription_next_starts_at'] ?? null,
        'subscriptionNextExpiresAt' => $user['subscription_next_expires_at'] ?? null,
        'createdAt' => $user['created_at'],
    ]);
}

function handleUpdateSubscription(): never
{
    $uid = requireAuth();
    $data = jsonBody();
    requireFields($data, ['subscriptionPlan']);

    if (!validSubscriptionPlan($data['subscriptionPlan'])) {
        jsonError('Invalid subscription plan', 422);
    }

    $plan = subscriptionPlanKey($data['subscriptionPlan']);
    $user = refreshUserSubscriptionState($uid);
    if (!$user) {
        jsonError('Not authenticated', 401);
    }

    $now = new DateTimeImmutable('now');
    $currentPlan = subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN);
    $currentExpiresAt = !empty($user['subscription_expires_at']) ? new DateTimeImmutable($user['subscription_expires_at']) : null;
    $isCurrentPaidAndActive = $currentPlan !== 'free' && $currentExpiresAt !== null && $currentExpiresAt > $now;

    if ($plan === $currentPlan && !$isCurrentPaidAndActive) {
        jsonResponse([
            'id' => (int) $user['user_id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'subscriptionPlan' => $currentPlan,
            'subscriptionStartedAt' => $user['subscription_started_at'] ?? null,
            'subscriptionExpiresAt' => $user['subscription_expires_at'] ?? null,
            'subscriptionNextPlan' => $user['subscription_next_plan'] ?? null,
            'subscriptionNextStartsAt' => $user['subscription_next_starts_at'] ?? null,
            'subscriptionNextExpiresAt' => $user['subscription_next_expires_at'] ?? null,
            'createdAt' => $user['created_at'],
        ]);
    }

    if ($currentPlan === 'free' || !$isCurrentPaidAndActive) {
        $startedAt = $now->format('Y-m-d H:i:s');
        $expiresAt = subscriptionPlanExpirationFrom($plan, $now);
        db()->prepare('UPDATE users SET subscription_plan = ?, subscription_started_at = ?, subscription_expires_at = ?, subscription_next_plan = NULL, subscription_next_starts_at = NULL, subscription_next_expires_at = NULL, subscription_updated_at = NOW() WHERE user_id = ?')
            ->execute([$plan, $startedAt, $expiresAt, $uid]);
        db()->prepare('INSERT INTO subscription_plan_events (user_id, from_plan, to_plan, event_type, started_at, expires_at, applied_at) VALUES (?, ?, ?, ?, ?, ?, NOW())')
            ->execute([$uid, $currentPlan, $plan, 'activate', $startedAt, $expiresAt]);
    } else {
        $nextStartsAt = $currentExpiresAt->format('Y-m-d H:i:s');
        $nextExpiresAt = subscriptionPlanExpirationFrom($plan, $currentExpiresAt);
        db()->prepare('UPDATE users SET subscription_next_plan = ?, subscription_next_starts_at = ?, subscription_next_expires_at = ?, subscription_updated_at = NOW() WHERE user_id = ?')
            ->execute([$plan, $nextStartsAt, $nextExpiresAt, $uid]);
        db()->prepare('INSERT INTO subscription_plan_events (user_id, from_plan, to_plan, event_type, started_at, expires_at, scheduled_for) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([$uid, $currentPlan, $plan, 'schedule', $nextStartsAt, $nextExpiresAt, $nextStartsAt]);
    }

    $user = refreshUserSubscriptionState($uid) ?: $user;

    jsonResponse([
        'id' => (int) $user['user_id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'subscriptionPlan' => subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN),
        'subscriptionStartedAt' => $user['subscription_started_at'] ?? null,
        'subscriptionExpiresAt' => $user['subscription_expires_at'] ?? null,
        'subscriptionNextPlan' => $user['subscription_next_plan'] ?? null,
        'subscriptionNextStartsAt' => $user['subscription_next_starts_at'] ?? null,
        'subscriptionNextExpiresAt' => $user['subscription_next_expires_at'] ?? null,
        'createdAt' => $user['created_at'],
    ]);
}
