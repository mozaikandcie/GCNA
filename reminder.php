<?php
// Rappel par e-mail : reçoit POST JSON { "email": "..." } et transmet l'adresse à contact@gcna.fr.
// Nécessite un hébergement PHP (Hostinger). Aucune adresse n'est stockée sur le serveur web.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$raw = file_get_contents('php://input', false, null, 0, 2048);
$data = json_decode($raw, true);
$email = is_array($data) && isset($data['email']) ? trim((string)$data['email']) : '';

if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo '{"ok":false}'; exit;
}

$to = 'contact@gcna.fr';
$subject = 'Demande de rappel — Grand Chanté Nwèl d\'Ambyans';
$body = "Demande de rappel par e-mail (consentement donné sur le site) :\r\n" . $email . "\r\n";
$headers = "From: GCNA <contact@gcna.fr>\r\nReply-To: " . $email . "\r\nContent-Type: text/plain; charset=utf-8\r\n";

if (@mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers)) { echo '{"ok":true}'; }
else { http_response_code(500); echo '{"ok":false}'; }
