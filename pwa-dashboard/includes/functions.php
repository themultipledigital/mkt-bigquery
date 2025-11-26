<?php
/**
 * Core Functions for PWA Management System
 */

/**
 * Get data directory path
 */
function getDataDir() {
    return __DIR__ . '/../data/';
}

/**
 * Get templates directory path
 */
function getTemplatesDir() {
    return __DIR__ . '/../templates/';
}

/**
 * Get generated directory path
 */
function getGeneratedDir() {
    return __DIR__ . '/../generated/';
}

/**
 * Load PWA data from JSON
 */
function loadPWAs() {
    $dataFile = getDataDir() . 'pwas.json';
    if (!file_exists($dataFile)) {
        // Create default structure
        $defaultData = [
            'pwas' => []
        ];
        file_put_contents($dataFile, json_encode($defaultData, JSON_PRETTY_PRINT));
        return $defaultData;
    }
    
    $data = json_decode(file_get_contents($dataFile), true);
    return $data ?: ['pwas' => []];
}

/**
 * Save PWA data to JSON
 */
function savePWAs($data) {
    $dataFile = getDataDir() . 'pwas.json';
    $dataDir = dirname($dataFile);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * Get PWA by ID
 */
function getPWAById($id) {
    $data = loadPWAs();
    foreach ($data['pwas'] as $pwa) {
        if ($pwa['id'] === $id) {
            return $pwa;
        }
    }
    return null;
}

/**
 * Save or update PWA
 */
function savePWA($pwaData) {
    $data = loadPWAs();
    $found = false;
    
    foreach ($data['pwas'] as &$pwa) {
        if ($pwa['id'] === $pwaData['id']) {
            $pwa = $pwaData;
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        $data['pwas'][] = $pwaData;
    }
    
    savePWAs($data);
    return true;
}

/**
 * Delete PWA by ID
 */
function deletePWA($id) {
    $data = loadPWAs();
    $data['pwas'] = array_filter($data['pwas'], function($pwa) use ($id) {
        return $pwa['id'] !== $id;
    });
    $data['pwas'] = array_values($data['pwas']); // Re-index
    savePWAs($data);
    return true;
}

/**
 * Generate unique PWA ID
 */
function generatePWAId() {
    return bin2hex(random_bytes(10));
}

/**
 * Get available templates
 */
function getAvailableTemplates() {
    $templatesDir = getTemplatesDir();
    $templates = [];
    
    if (is_dir($templatesDir)) {
        $dirs = scandir($templatesDir);
        foreach ($dirs as $dir) {
            if ($dir !== '.' && $dir !== '..' && is_dir($templatesDir . $dir)) {
                // Check if it's a valid template (has index.html or home.php)
                if (file_exists($templatesDir . $dir . '/index.html') || 
                    file_exists($templatesDir . $dir . '/home.php')) {
                    $templates[] = $dir;
                }
            }
        }
    }
    
    return $templates;
}

/**
 * Get template metadata and defaults
 */
function getTemplateConfig($templateName) {
    $templatesDir = getTemplatesDir();
    $templateDir = $templatesDir . $templateName . '/';
    $configFile = $templateDir . 'template.json';
    
    if (!file_exists($configFile)) {
        return null;
    }
    
    $config = json_decode(file_get_contents($configFile), true);
    if (!$config) {
        return null;
    }
    
    // Resolve relative paths to absolute paths
    if (isset($config['defaults']['images']['icon'])) {
        $iconPath = $config['defaults']['images']['icon'];
        if (strpos($iconPath, './') === 0 || strpos($iconPath, '../') === 0) {
            $iconPath = str_replace(['./', '../'], '', $iconPath);
        }
        $fullIconPath = $templateDir . $iconPath;
        if (file_exists($fullIconPath)) {
            $config['defaults']['images']['icon'] = $fullIconPath;
        }
    }
    
    if (isset($config['defaults']['images']['screenshots'])) {
        foreach ($config['defaults']['images']['screenshots'] as $key => $screenshot) {
            if (strpos($screenshot, './') === 0 || strpos($screenshot, '../') === 0) {
                $screenshot = str_replace(['./', '../'], '', $screenshot);
            }
            $fullScreenshotPath = $templateDir . $screenshot;
            if (file_exists($fullScreenshotPath)) {
                $config['defaults']['images']['screenshots'][$key] = $fullScreenshotPath;
            }
        }
    }
    
    return $config;
}

/**
 * Get template info (display name, description)
 */
function getTemplateInfo($templateName) {
    $config = getTemplateConfig($templateName);
    if (!$config) {
        return [
            'name' => $templateName,
            'displayName' => ucfirst(str_replace('_', ' ', $templateName)),
            'description' => 'No description available'
        ];
    }
    
    return [
        'name' => $templateName,
        'displayName' => $config['displayName'] ?? ucfirst(str_replace('_', ' ', $templateName)),
        'description' => $config['description'] ?? 'No description available',
        'version' => $config['version'] ?? '1.0.0',
        'category' => $config['category'] ?? 'general'
    ];
}

/**
 * Sanitize output
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Format date
 */
function formatDate($date) {
    if (empty($date)) return '';
    try {
        $dt = new DateTime($date);
        return $dt->format('d.m.Y');
    } catch (Exception $e) {
        return $date;
    }
}

/**
 * Get status badge class
 */
function getStatusBadgeClass($status) {
    $classes = [
        'active' => 'bg-green-500',
        'stopped' => 'bg-orange-500',
        'new' => 'bg-blue-500'
    ];
    return $classes[$status] ?? 'bg-gray-500';
}

/**
 * Get status text
 */
function getStatusText($status) {
    return ucfirst($status);
}

