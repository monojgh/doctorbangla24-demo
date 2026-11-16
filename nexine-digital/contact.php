<?php
/**
 * Nexine Digital — Contact form handler (works on Hostinger shared hosting)
 * EDIT: set $to to the inbox that should receive messages.
 * EDIT: set $from to an email on YOUR domain (create it in Hostinger > Emails),
 *       otherwise mail may land in spam.
 */
$to   = 'admin@nexinedigital.com';
$from = 'admin@nexinedigital.com';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot spam trap
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

function clean($v, $max = 2000) {
    $v = trim((string)$v);
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v); // header-injection safe for single-line fields
    return mb_substr(strip_tags($v), 0, $max);
}

$name    = clean($_POST['name'] ?? '', 120);
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone   = clean($_POST['phone'] ?? '', 40);
$service = clean($_POST['service'] ?? '', 80);
$message = mb_substr(strip_tags(trim((string)($_POST['message'] ?? ''))), 0, 5000);

if ($name === '' || !$email || $message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}

$subject = "New project inquiry: {$service} — {$name}";
$body  = "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Phone: {$phone}\n";
$body .= "Service: {$service}\n\n";
$body .= "Message:\n{$message}\n";

$headers  = "From: Nexine Digital Website <{$from}>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail failed']);
}
