<?php
require_once '../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Handle both JSON and form data
$input = [];
if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    // Form data
    $input = $_POST;
    
    // Parse nested config fields
    if (isset($input['config'])) {
        if (is_string($input['config'])) {
            $input['config'] = json_decode($input['config'], true) ?: [];
        }
    } else {
        $input['config'] = [];
    }
    
    // Collect config data from form fields
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'config[') === 0) {
            // Parse nested keys like config[store][name]
            $keys = preg_replace('/^config\[|\]$/', '', $key);
            $keys = explode('][', $keys);
            
            $ref = &$input['config'];
            foreach ($keys as $k) {
                if (!isset($ref[$k])) {
                    $ref[$k] = [];
                }
                $ref = &$ref[$k];
            }
            $ref = $value;
        }
    }
}

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

try {
    // Get or create PWA ID
    $id = $input['id'] ?? generatePWAId();
    
    // Get existing PWA or create new
    $pwa = getPWAById($id);
    if (!$pwa) {
        $pwa = [
            'id' => $id,
            'name' => $input['name'] ?? 'Unnamed PWA',
            'domain' => $input['domain'] ?? '',
            'geo' => $input['geo'] ?? '',
            'status' => $input['status'] ?? 'new',
            'created' => date('Y-m-d'),
            'template' => $input['template'] ?? 'template_bigbasssplashplaygame',
            'config' => []
        ];
    }
    
    // Update basic fields
    if (isset($input['name'])) $pwa['name'] = $input['name'];
    if (isset($input['domain'])) $pwa['domain'] = $input['domain'];
    if (isset($input['geo'])) $pwa['geo'] = $input['geo'];
    if (isset($input['status'])) $pwa['status'] = $input['status'];
    if (isset($input['template'])) $pwa['template'] = $input['template'];
    
    // Update config with deep merge
    if (isset($input['config'])) {
        $existingConfig = $pwa['config'] ?? [];
        $pwa['config'] = array_replace_recursive($existingConfig, $input['config']);
        
        // Handle array fields that shouldn't be merged but replaced
        // Screenshots array should be replaced, not merged
        if (isset($input['config']['images']['screenshots']) && is_array($input['config']['images']['screenshots'])) {
            $pwa['config']['images']['screenshots'] = $input['config']['images']['screenshots'];
        }
        
        // Comments list should be replaced, not merged
        if (isset($input['config']['comments']['list']) && is_array($input['config']['comments']['list'])) {
            $pwa['config']['comments']['list'] = $input['config']['comments']['list'];
        }
    }
    
    // If template changed and config is empty, load template defaults
    if (isset($input['template']) && $input['template'] !== ($pwa['template'] ?? '')) {
        $pwa['template'] = $input['template'];
        // Don't auto-load defaults on template change - let user click button
    } elseif (isset($input['template'])) {
        $pwa['template'] = $input['template'];
    }
    
    // Save PWA
    savePWA($pwa);
    
    echo json_encode([
        'success' => true,
        'id' => $id,
        'redirect' => 'editor.php?id=' . $id
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

