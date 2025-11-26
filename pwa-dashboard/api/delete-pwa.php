<?php
require_once '../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$id = $_GET['id'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'PWA ID is required']);
    exit;
}

try {
    $result = deletePWA($id);
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'PWA not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

