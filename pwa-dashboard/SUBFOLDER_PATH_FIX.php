<?php
/**
 * Helper function to get correct paths when deployed in subfolder
 * This file helps resolve template asset paths correctly
 */

/**
 * Get base URL path for assets
 */
function getBasePath() {
    // Get current script directory
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    // Remove subfolder if we're in one (e.g., /pwa-dashboard)
    // For now, return the script directory as base
    return rtrim($scriptDir, '/');
}

/**
 * Get template asset URL
 */
function getTemplateAssetUrl($templateName, $assetPath) {
    $basePath = getBasePath();
    return $basePath . '/templates/' . $templateName . '/' . ltrim($assetPath, './');
}

