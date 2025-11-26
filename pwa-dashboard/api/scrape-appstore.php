<?php
require_once '../includes/functions.php';

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

$appUrl = $input['url'] ?? '';

if (empty($appUrl)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'App URL is required']);
    exit;
}

try {
    // Scrape App Store
    $ch = curl_init($appUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Failed to fetch App Store page');
    }
    
    // Parse HTML (simple regex-based extraction)
    // Note: For production, use a proper HTML parser like SimpleHTMLDOM
    $data = [];
    
    // Extract app name
    if (preg_match('/<h1[^>]*class="product-header__title"[^>]*>(.*?)<\/h1>/i', $html, $matches)) {
        $data['name'] = strip_tags($matches[1]);
    }
    
    // Extract developer
    if (preg_match('/<a[^>]*class="product-header__identity[^>]*>(.*?)<\/a>/i', $html, $matches)) {
        $data['developer'] = strip_tags($matches[1]);
    }
    
    // Extract rating
    if (preg_match('/<span[^>]*class="we-rating-count[^>]*>(.*?)<\/span>/i', $html, $matches)) {
        $data['rating'] = floatval(strip_tags($matches[1]));
    }
    
    // Extract description
    if (preg_match('/<div[^>]*class="product-description[^>]*>(.*?)<\/div>/is', $html, $matches)) {
        $data['description'] = strip_tags($matches[1]);
    }
    
    // Extract icon (simplified)
    if (preg_match('/<img[^>]*class="product-header__icon"[^>]*src="([^"]*)"/i', $html, $matches)) {
        $data['icon'] = $matches[1];
    }
    
    // Extract screenshots (simplified)
    $screenshots = [];
    if (preg_match_all('/<img[^>]*class="[^"]*screenshot[^"]*"[^>]*src="([^"]*)"/i', $html, $matches)) {
        $screenshots = array_slice($matches[1], 0, 6);
    }
    $data['screenshots'] = $screenshots;
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

