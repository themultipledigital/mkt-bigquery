<?php
require_once '../includes/functions.php';
require_once '../includes/template-engine.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$pwaId = $input['id'] ?? '';

if (empty($pwaId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'PWA ID is required']);
    exit;
}

try {
    // Load PWA data
    $pwa = getPWAById($pwaId);
    if (!$pwa) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'PWA not found']);
        exit;
    }
    
    // Generate PWA from template (template is required - determines structure)
    $templateName = $pwa['template'] ?? 'template_bigbasssplashplaygame';
    if (empty($templateName)) {
        $templateName = 'template_bigbasssplashplaygame'; // Always default to this template
    }
    $result = generatePWAFromTemplate($pwaId, $pwa, $templateName);
    
    echo json_encode([
        'success' => true,
        'generated_dir' => $result['generated_dir'],
        'files_processed' => count($result['files_processed']),
        'download_url' => 'api/download-pwa.php?id=' . $pwaId
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

