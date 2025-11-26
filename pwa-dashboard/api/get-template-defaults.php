<?php
require_once '../includes/functions.php';

// Ensure we have getTemplatesDir function
if (!function_exists('getTemplatesDir')) {
    function getTemplatesDir() {
        return __DIR__ . '/../templates/';
    }
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$templateName = $_GET['template'] ?? '';

if (empty($templateName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Template name is required']);
    exit;
}

try {
    $config = getTemplateConfig($templateName);
    
    if (!$config) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template not found or no config available']);
        exit;
    }
    
    // Convert file paths to data URLs for images (or keep as relative paths)
    $defaults = $config['defaults'] ?? [];
    
    // Handle icon - convert to base64 data URL if file exists
    if (isset($defaults['images']['icon'])) {
        $iconPath = $defaults['images']['icon'];
        $templateDir = getTemplatesDir() . $templateName . '/';
        
        // If relative path, make it absolute
        if (!file_exists($iconPath) && strpos($iconPath, '/') !== 0 && strpos($iconPath, 'data:') !== 0) {
            $iconPath = $templateDir . $iconPath;
        }
        
        if (file_exists($iconPath)) {
            $iconData = file_get_contents($iconPath);
            $iconMime = mime_content_type($iconPath);
            if (!$iconMime) $iconMime = 'image/png';
            $iconBase64 = base64_encode($iconData);
            $defaults['images']['icon'] = 'data:' . $iconMime . ';base64,' . $iconBase64;
        } else {
            // Keep original path if file doesn't exist (will be handled on frontend)
            $defaults['images']['icon'] = $defaults['images']['icon'];
        }
    }
    
    // Handle screenshots - convert to base64 data URLs if files exist
    if (isset($defaults['images']['screenshots']) && is_array($defaults['images']['screenshots'])) {
        $screenshots = [];
        $templateDir = getTemplatesDir() . $templateName . '/';
        
        foreach ($defaults['images']['screenshots'] as $screenshot) {
            if (empty($screenshot)) {
                $screenshots[] = '';
                continue;
            }
            
            // If relative path, make it absolute
            $screenshotPath = $screenshot;
            if (!file_exists($screenshotPath) && strpos($screenshotPath, '/') !== 0 && strpos($screenshotPath, 'data:') !== 0) {
                $screenshotPath = $templateDir . $screenshot;
            }
            
            if (file_exists($screenshotPath)) {
                $screenshotData = file_get_contents($screenshotPath);
                $screenshotMime = mime_content_type($screenshotPath);
                if (!$screenshotMime) $screenshotMime = 'image/jpeg';
                $screenshotBase64 = base64_encode($screenshotData);
                $screenshots[] = 'data:' . $screenshotMime . ';base64,' . $screenshotBase64;
            } else {
                // Keep original path if file doesn't exist (will be handled on frontend)
                $screenshots[] = $screenshot;
            }
        }
        $defaults['images']['screenshots'] = $screenshots;
    }
    
    echo json_encode([
        'success' => true,
        'defaults' => $defaults,
        'templateName' => $templateName,
        'displayName' => $config['displayName'] ?? $templateName
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

