<?php
/**
 * ==========================================================================
 * CONTACT ENDPOINT — /contact.php
 * ==========================================================================
 * Accepts POST only, validates everything server-side, then sends the
 * enquiry through Gmail SMTP with PHPMailer.
 *
 * Response (fetch/AJAX): JSON  {"ok":true}  or  {"ok":false,"error":"..."}
 * Response (plain form post, no JavaScript): a small HTML thank-you page.
 *
 * Requirements: PHP 8.x, the openssl extension (standard on Hostinger), and
 * real credentials in includes/config.php.
 * ==========================================================================
 */

declare(strict_types=1);

// Never show errors or stack traces to visitors; log them instead.
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

const MAX_NAME    = 80;
const MAX_EMAIL   = 120;
const MAX_MESSAGE = 4000;
const MIN_ELAPSED = 2500; // ms; a human needs at least this long to type

/**
 * Send a JSON response and stop.
 */
function respond_json(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Was this request made by our fetch() call, or by a plain browser submit?
 */
// If anything fails fatally, answer with a clean JSON error instead of a blank
// 500 page, and keep the details in the server log.
register_shutdown_function(static function (): void {
    $error = error_get_last();
    $fatal = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
    if ($error === null || !in_array($error['type'], $fatal, true)) {
        return;
    }
    error_log('[contact] Fatal error: ' . $error['message']);
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Your message could not be sent right now. Please email vaheedbasha882@gmail.com directly.']);
    }
});

function wants_json(): bool
{
    $xhr = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    return strcasecmp($xhr, 'XMLHttpRequest') === 0 || stripos($accept, 'application/json') !== false;
}

/**
 * Minimal HTML page for visitors without JavaScript.
 */
function render_html_page(bool $success, string $heading, string $body, int $status = 0): void
{
    http_response_code($status > 0 ? $status : ($success ? 200 : 400));
    header('Content-Type: text/html; charset=utf-8');
    $safeHeading = htmlspecialchars($heading, ENT_QUOTES, 'UTF-8');
    $safeBody = htmlspecialchars($body, ENT_QUOTES, 'UTF-8');
    echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{$safeHeading}</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0A0A0A; color:#F5F5F5;
         font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; padding:24px; }
  .card { max-width:460px; text-align:center; background:#111111; border:1px solid #262626;
          border-radius:16px; padding:36px 28px; }
  h1 { font-size:1.4rem; margin:0 0 12px; letter-spacing:-0.03em; }
  p { margin:0 0 20px; color:#A3A3A3; line-height:1.65; }
  a { color:#F5F5F5; font-weight:600; text-decoration:none; border-bottom:1px solid #3A3A3A; padding-bottom:2px; }
  a:hover { border-color:#F5F5F5; }
</style>
</head>
<body>
  <div class="card">
    <h1>{$safeHeading}</h1>
    <p>{$safeBody}</p>
    <a href="./">&larr; Back to the site</a>
  </div>
</body>
</html>
HTML;
    exit;
}

// --------------------------------------------------------------------------
// Request method and CSRF token
// --------------------------------------------------------------------------
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// GET ?csrf=1 hands the page a token for the hidden form field.
if ($method === 'GET' && isset($_GET['csrf'])) {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    respond_json(200, ['ok' => true, 'token' => $_SESSION['csrf_token']]);
}

if ($method !== 'POST') {
    header('Allow: POST');
    if (wants_json()) {
        respond_json(405, ['ok' => false, 'error' => 'Method not allowed.']);
    }
    render_html_page(false, 'Method not allowed', 'Please use the contact form on the website.', 405);
}

// --------------------------------------------------------------------------
// Collect and clean input
// --------------------------------------------------------------------------
$rawName    = (string)($_POST['name'] ?? '');
$rawEmail   = (string)($_POST['email'] ?? '');
$rawMessage = (string)($_POST['message'] ?? '');
$honeypot   = trim((string)($_POST['company'] ?? ''));
$elapsed    = (int)($_POST['elapsed'] ?? 0);
$csrf       = (string)($_POST['csrf_token'] ?? '');

$name    = trim(strip_tags($rawName));
$email   = trim(strip_tags($rawEmail));
$message = trim(strip_tags($rawMessage));

// Header-injection guard: no CR/LF in fields that end up in mail headers.
$headerInjection = preg_match('/[\r\n]/', $rawName) || preg_match('/[\r\n]/', $rawEmail);

$errors = [];

if ($honeypot !== '') {
    // Bots fill every field they find. Reject politely.
    $errors[] = 'Your message could not be sent. Please email vaheedbasha882@gmail.com instead.';
} elseif ($headerInjection) {
    $errors[] = 'Please remove line breaks from your name and email address.';
} else {
    if ($name === '' || mb_strlen($name) < 2) {
        $errors[] = 'Please enter your name.';
    } elseif (mb_strlen($name) > MAX_NAME) {
        $errors[] = 'Please keep your name under ' . MAX_NAME . ' characters.';
    }

    if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors[] = 'Please enter a valid email address.';
    } elseif (mb_strlen($email) > MAX_EMAIL) {
        $errors[] = 'That email address is too long.';
    }

    if (mb_strlen($message) < 10) {
        $errors[] = 'Please add a little more detail to your message.';
    } elseif (mb_strlen($message) > MAX_MESSAGE) {
        $errors[] = 'Please keep your message under ' . MAX_MESSAGE . ' characters.';
    }

    // Time-based check: forms submitted within a couple of seconds are bots.
    if ($elapsed > 0 && $elapsed < MIN_ELAPSED) {
        $errors[] = 'That was a little too quick — please try sending again.';
    }

    // CSRF: only enforced once the browser has a token from this server.
    if (!empty($_SESSION['csrf_token']) && !hash_equals($_SESSION['csrf_token'], $csrf)) {
        $errors[] = 'Your session expired. Please reload the page and try again.';
    }
}

if ($errors) {
    $first = $errors[0];
    if (wants_json()) {
        respond_json(422, ['ok' => false, 'error' => $first]);
    }
    render_html_page(false, 'Message not sent', $first);
}

// --------------------------------------------------------------------------
// Per-IP rate limit (file based, 5 per hour by default)
// --------------------------------------------------------------------------
function rate_limit_exceeded(int $max, int $window): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = sys_get_temp_dir() . '/vb_contact_' . hash('sha256', $ip) . '.json';

    $now = time();
    $hits = [];
    if (is_file($file)) {
        $data = json_decode((string)@file_get_contents($file), true);
        if (is_array($data)) {
            $hits = array_values(array_filter($data, static fn($t) => is_int($t) && $t > $now - $window));
        }
    }

    if (count($hits) >= $max) {
        return true;
    }

    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

// Limits come from includes/config.php when it exists; fall back to defaults
// so the endpoint cannot be abused before the config is in place.
$limitMax    = defined('RATE_LIMIT_MAX') ? (int)constant('RATE_LIMIT_MAX') : 5;
$limitWindow = defined('RATE_LIMIT_WINDOW') ? (int)constant('RATE_LIMIT_WINDOW') : 3600;

if (rate_limit_exceeded($limitMax, $limitWindow)) {
    $msg = 'Too many messages from this connection. Please try again later, or email vaheedbasha882@gmail.com directly.';
    if (wants_json()) {
        respond_json(429, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Slow down', $msg);
}

// --------------------------------------------------------------------------
// Configuration and PHPMailer
// --------------------------------------------------------------------------
$configFile = __DIR__ . '/includes/config.php';

if (!is_file($configFile)) {
    error_log('[contact] includes/config.php is missing — contact form cannot send mail.');
    $msg = 'The contact form is not set up yet. Please email vaheedbasha882@gmail.com instead.';
    if (wants_json()) {
        respond_json(500, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Form not available', $msg, 503);
}

require_once $configFile;

$smtpUser = defined('SMTP_USER') ? (string)SMTP_USER : '';
$smtpPass = defined('SMTP_PASS') ? (string)SMTP_PASS : '';

if (
    $smtpUser === '' || $smtpPass === ''
    || stripos($smtpUser, 'your.address') !== false
    || stripos($smtpPass, 'your-16') !== false
) {
    error_log('[contact] SMTP credentials are still placeholders in includes/config.php.');
    $msg = 'The contact form is not set up yet. Please email vaheedbasha882@gmail.com instead.';
    if (wants_json()) {
        respond_json(503, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Form not available', $msg, 503);
}

$mailerBase = __DIR__ . '/includes/PHPMailer/';
if (!is_file($mailerBase . 'PHPMailer.php')) {
    error_log('[contact] PHPMailer is missing from includes/PHPMailer/.');
    $msg = 'The contact form is not set up yet. Please email vaheedbasha882@gmail.com instead.';
    if (wants_json()) {
        respond_json(503, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Form not available', $msg, 503);
}

require_once $mailerBase . 'Exception.php';
require_once $mailerBase . 'PHPMailer.php';
require_once $mailerBase . 'SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// --------------------------------------------------------------------------
// Build and send the message
// --------------------------------------------------------------------------
$subject = 'New enquiry from portfolio: ' . preg_replace('/\s+/', ' ', $name);

$plainBody = "New enquiry from the portfolio website\n\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Sent: " . date('Y-m-d H:i:s') . " (server time)\n\n"
    . "Message:\n{$message}\n";

$htmlBody = '<h2 style="font-family:Arial,sans-serif;font-size:18px;margin:0 0 16px">New enquiry from your portfolio</h2>'
    . '<table cellpadding="6" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#222">'
    . '<tr><td><strong>Name</strong></td><td>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</td></tr>'
    . '<tr><td><strong>Email</strong></td><td>' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</td></tr>'
    . '<tr><td><strong>Sent</strong></td><td>' . date('Y-m-d H:i:s') . ' (server time)</td></tr>'
    . '</table>'
    . '<p style="font-family:Arial,sans-serif;font-size:14px;color:#222;white-space:pre-wrap;margin-top:18px">'
    . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p>';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = defined('SMTP_HOST') ? (string)SMTP_HOST : 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = str_replace(' ', '', $smtpPass); // App Passwords are shown with spaces
    $mail->SMTPSecure = (defined('SMTP_SECURE') && SMTP_SECURE === 'ssl')
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = defined('SMTP_PORT') ? (int)SMTP_PORT : 587;

    if (defined('CONTACT_DEBUG') && CONTACT_DEBUG) {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;               // logged, never printed
        $mail->Debugoutput = static function (string $str): void {
            error_log('[contact][smtp] ' . $str);
        };
    }

    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->Timeout = 15;

    $mail->setFrom($smtpUser, defined('SITE_NAME') ? (string)SITE_NAME : 'Portfolio');
    $mail->addAddress(defined('MAIL_TO') ? (string)MAIL_TO : $smtpUser,
                      defined('MAIL_TO_NAME') ? (string)MAIL_TO_NAME : '');
    $mail->addReplyTo($email, $name);

    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $htmlBody;
    $mail->AltBody = $plainBody;

    $mail->send();
} catch (PHPMailerException $e) {
    error_log('[contact] PHPMailer error: ' . $e->getMessage());
    $msg = 'Your message could not be sent right now. Please email vaheedbasha882@gmail.com directly.';
    if (wants_json()) {
        respond_json(500, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Message not sent', $msg, 500);
} catch (Throwable $e) {
    error_log('[contact] Unexpected error: ' . $e->getMessage());
    $msg = 'Your message could not be sent right now. Please email vaheedbasha882@gmail.com directly.';
    if (wants_json()) {
        respond_json(500, ['ok' => false, 'error' => $msg]);
    }
    render_html_page(false, 'Message not sent', $msg, 500);
}

if (wants_json()) {
    respond_json(200, ['ok' => true, 'message' => 'Thanks — your message has been sent.']);
}

render_html_page(true, 'Message sent', 'Thank you — your enquiry is on its way. I usually reply within 24 hours.');
