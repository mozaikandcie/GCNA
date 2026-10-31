<?php
// Rappel par e-mail : reçoit POST JSON { "email": "..." } et transmet l'adresse à contact@gcna.fr.
// Nécessite un hébergement PHP (Hostinger). Aucune adresse n'est stockée dans le dossier du site.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail($code) { http_response_code($code); echo '{"ok":false}'; exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405);

// Même origine uniquement (le formulaire du site, pas un script extérieur)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !preg_match('#^https://(www\.)?gcna\.fr$#', $origin)) fail(403);

// Limites anti-abus : 5 demandes / heure / adresse IP, 200 / jour au total
$dir = sys_get_temp_dir();
$ipKey = $dir . '/gcna-rem-' . sha1(($_SERVER['REMOTE_ADDR'] ?? '') . date('YmdH'));
$dayKey = $dir . '/gcna-rem-day-' . date('Ymd');
$ipCount = is_file($ipKey) ? (int)file_get_contents($ipKey) : 0;
$dayCount = is_file($dayKey) ? (int)file_get_contents($dayKey) : 0;
if ($ipCount >= 5 || $dayCount >= 200) fail(429);

$raw = file_get_contents('php://input', false, null, 0, 2048);
$data = json_decode($raw, true);
$email = is_array($data) && isset($data['email']) ? trim((string)$data['email']) : '';
if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail(422);
// Empêche l'injection d'en-têtes
if (preg_match('/[\r\n]/', $email)) fail(422);

$subject = "Demande de rappel — Grand Chanté Nwèl d'Ambyans";
$body = "Demande de rappel par e-mail (consentement donné sur le site) :\r\n" . $email . "\r\n";
$headers = "From: GCNA <contact@gcna.fr>\r\nReply-To: " . $email . "\r\nContent-Type: text/plain; charset=utf-8\r\n";

if (@mail('contact@gcna.fr', '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers)) {
  @file_put_contents($ipKey, $ipCount + 1);
  @file_put_contents($dayKey, $dayCount + 1);
  echo '{"ok":true}';
} else {
  fail(500);
}
