<?php
// create-template-page.php
// Creates a new admin-templates-<slug>.html file (copied from
// admin-templates-STARTER.html) whenever a service that "needs a
// design/template" is added from the admin panel. This is the one piece
// of real server-side logic in an otherwise front-end-only demo project —
// browsers can't write new files to disk on their own, so this small PHP
// script (running on your XAMPP/Apache server) does it instead.

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$slug = isset($input['slug']) ? trim($input['slug']) : '';

// Strict whitelist: lowercase letters, numbers, and single dashes only.
// This blocks path traversal (../) and any other unsafe characters —
// never build a file path from unvalidated input.
if (!preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid service slug.']);
  exit;
}

$dir = __DIR__;
$starterPath = $dir . '/admin-templates-STARTER.html';
$targetPath = $dir . '/admin-templates-' . $slug . '.html';

// Already exists (e.g. one of the original sample services, or the admin
// re-submitted) — don't overwrite an existing page's uploaded templates.
if (file_exists($targetPath)) {
  echo json_encode(['success' => true, 'created' => false, 'file' => basename($targetPath), 'message' => 'Page already exists.']);
  exit;
}

if (!file_exists($starterPath)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'admin-templates-STARTER.html was not found in this folder.']);
  exit;
}

$template = file_get_contents($starterPath);
$newPage = str_replace('{{SLUG}}', $slug, $template);

if (file_put_contents($targetPath, $newPage) === false) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Could not write the new file. Check that this folder is writable.']);
  exit;
}

echo json_encode(['success' => true, 'created' => true, 'file' => basename($targetPath), 'message' => 'Template page created.']);
