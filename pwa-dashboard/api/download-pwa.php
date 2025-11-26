<?php
require_once '../includes/functions.php';

header('Content-Type: application/zip');

$pwaId = $_GET['id'] ?? '';

if (empty($pwaId)) {
    http_response_code(400);
    die('PWA ID is required');
}

$generatedDir = getGeneratedDir() . $pwaId . '/';

if (!is_dir($generatedDir)) {
    http_response_code(404);
    die('Generated PWA not found. Please generate it first.');
}

try {
    // Create ZIP file
    $zipPath = sys_get_temp_dir() . '/' . $pwaId . '.zip';
    $zip = new ZipArchive();
    
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        throw new Exception('Cannot create ZIP file');
    }
    
    // Normalize the generated directory path (use forward slashes for consistency)
    $generatedDirNormalized = str_replace('\\', '/', realpath($generatedDir));
    if (!$generatedDirNormalized) {
        throw new Exception('Cannot resolve generated directory path');
    }
    if (substr($generatedDirNormalized, -1) !== '/') {
        $generatedDirNormalized .= '/';
    }
    
    // Add files to ZIP
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($generatedDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($iterator as $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            if (!$filePath) {
                continue; // Skip if path cannot be resolved
            }
            
            // Normalize file path (use forward slashes)
            $filePathNormalized = str_replace('\\', '/', $filePath);
            
            // Get relative path properly
            if (strpos($filePathNormalized, $generatedDirNormalized) === 0) {
                $relativePath = substr($filePathNormalized, strlen($generatedDirNormalized));
                // Ensure relative path uses forward slashes (ZIP standard)
                $relativePath = str_replace('\\', '/', $relativePath);
                $zip->addFile($filePath, $relativePath);
            } else {
                // Fallback: use file name only if path matching fails
                $relativePath = basename($filePath);
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
    
    $zip->close();
    
    // Load PWA for filename
    $pwa = getPWAById($pwaId);
    $filename = ($pwa['name'] ?? 'pwa') . '-' . $pwaId . '.zip';
    $filename = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $filename);
    
    // Send file
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($zipPath));
    readfile($zipPath);
    
    // Clean up
    unlink($zipPath);
    
} catch (Exception $e) {
    http_response_code(500);
    die('Error creating ZIP file: ' . $e->getMessage());
}

