<?php
/**
 * ==========================================================================
 * CONFIG SAMPLE — copy the settings into includes/config.php
 * ==========================================================================
 * 1. Make a copy of this file and name it config.php (same folder).
 * 2. Fill in your Gmail address and 16-character App Password.
 * 3. Never upload this sample file with real values in it, and never commit
 *    config.php to Git (.gitignore already excludes it).
 *
 * Gmail App Password: Google Account -> Security -> 2-Step Verification
 * (turn it on first) -> App passwords -> create one for "Mail".
 * The password looks like "abcd efgh ijkl mnop" — you can paste it with or
 * without the spaces.
 * ==========================================================================
 */

// --- SMTP connection -------------------------------------------------------
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);            // 587 = STARTTLS, 465 = SSL
define('SMTP_SECURE', 'tls');        // 'tls' for port 587, 'ssl' for port 465
define('SMTP_USER', 'your.address@gmail.com');
define('SMTP_PASS', 'your-16-character-app-password');

// --- Who receives the enquiry ---------------------------------------------
define('MAIL_TO', 'vaheedbasha882@gmail.com');   // where enquiries land
define('MAIL_TO_NAME', 'Vaheed Basha');
define('SITE_NAME', 'Vaheed Basha — Portfolio');

// --- Rate limiting ---------------------------------------------------------
define('RATE_LIMIT_MAX', 5);         // submissions allowed per IP…
define('RATE_LIMIT_WINDOW', 3600);   // …in this many seconds (1 hour)

// --- Debugging -------------------------------------------------------------
// true writes the SMTP conversation to the PHP error log. Leave false on the
// live site: it can contain email addresses.
define('CONTACT_DEBUG', false);
