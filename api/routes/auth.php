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

    if ($name === null || $name === '') jsonError('Name is required', 422);

    validateUsername($name);

    if (!validEmail($email)) jsonError('Invalid email address', 422);
    $passwordError = passwordValidationError($pass);
    if ($passwordError !== null) jsonError($passwordError, 422);

    enforceRateLimit('register-email:' . sha1($email), RATE_LIMIT_AUTH, RATE_LIMIT_AUTH_WINDOW);

    $db = db();

    // Check uniqueness
    $stmt = $db->prepare('SELECT user_id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonError('Email already in use', 409);

    $hash = password_hash($pass, PASSWORD_DEFAULT);

    $plan = DEFAULT_SUBSCRIPTION_PLAN;

    $stmt = $db->prepare('INSERT INTO users (name, email, password_hash, subscription_plan) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $email, $hash, $plan]);
    $uid = (int) $db->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['user_id'] = $uid;
    $_SESSION['last_activity_at'] = time();
    rotateCsrfToken();

    securityLog('register_success', ['userId' => $uid]);

    jsonResponse([
        'id'    => $uid,
        'name'  => $name,
        'email' => $email,
        'subscriptionPlan' => $plan,
        'csrfToken' => csrfToken(),
    ], 201);
}

function handleLogin(): never
{
    $data = jsonBody();
    requireFields($data, ['email', 'password']);

    $email = normalizeEmail($data['email']);
    $pass  = $data['password'];

    if (!validEmail($email) || trim((string) $pass) === '') {
        securityLog('login_failed_format', ['emailHash' => sha1($email)]);
        jsonError('Invalid email or password', 401);
    }

    enforceRateLimit('login-email:' . sha1($email), RATE_LIMIT_AUTH, RATE_LIMIT_AUTH_WINDOW);

    $stmt = db()->prepare('SELECT user_id, name, email, password_hash, subscription_plan FROM users WHERE email = ?');
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

    $stmt = db()->prepare('SELECT user_id, name, email, created_at, subscription_plan FROM users WHERE user_id = ?');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();

    if (!$user) {
        // Session references a deleted user
        $_SESSION = [];
        jsonError('Not authenticated', 401);
    }

    jsonResponse([
        'id'        => (int) $user['user_id'],
        'name'      => $user['name'],
        'email'     => $user['email'],
        'subscriptionPlan' => subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN),
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

    db()->prepare('UPDATE users SET subscription_plan = ?, subscription_updated_at = NOW() WHERE user_id = ?')
        ->execute([$plan, $uid]);

    $stmt = db()->prepare('SELECT user_id, name, email, created_at, subscription_plan FROM users WHERE user_id = ?');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();

    jsonResponse([
        'id' => (int) $user['user_id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'subscriptionPlan' => subscriptionPlanKey($user['subscription_plan'] ?? DEFAULT_SUBSCRIPTION_PLAN),
        'createdAt' => $user['created_at'],
    ]);
}
