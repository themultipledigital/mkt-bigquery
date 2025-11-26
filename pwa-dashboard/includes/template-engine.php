<?php
/**
 * Template Engine for PWA Generation
 */

/**
 * Replace variables in template content
 */
function replaceTemplateVariables($content, $variables) {
    foreach ($variables as $key => $value) {
        // Handle different placeholder formats
        $patterns = [
            '/\{\{' . preg_quote($key, '/') . '\}\}/',
            '/\{\{' . preg_quote($key, '/') . '\|escape\}\}/',
            '/\$\{' . preg_quote($key, '/') . '\}/',
            '/<%=' . preg_quote($key, '/') . '%>/'
        ];
        
        $escapedValue = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        
        foreach ($patterns as $pattern) {
            if (preg_match('/\|escape\}/', $pattern)) {
                $content = preg_replace($pattern, $escapedValue, $content);
            } else {
                $content = preg_replace($pattern, $value, $content);
            }
        }
    }
    
    return $content;
}

/**
 * Generate PWA from template
 */
function generatePWAFromTemplate($pwaId, $pwaData, $templateName) {
    // Template is required - always need a template for structure
    if (empty($templateName)) {
        $templateName = 'template_bigbasssplashplaygame';
    }
    
    $templatesDir = getTemplatesDir();
    $templateDir = $templatesDir . $templateName . '/';
    $generatedDir = getGeneratedDir() . $pwaId . '/';
    
    if (!is_dir($templateDir)) {
        throw new Exception("Template not found: {$templateName}");
    }
    
    // Create generated directory
    if (!is_dir($generatedDir)) {
        mkdir($generatedDir, 0755, true);
    }
    
    // Prepare variables for substitution
    $variables = prepareTemplateVariables($pwaData);
    
    // Process template files
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($templateDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    $filesProcessed = [];
    
    // Normalize template directory path for consistent path handling
    $templateDirNormalized = str_replace('\\', '/', realpath($templateDir));
    if (!$templateDirNormalized) {
        throw new Exception("Cannot resolve template directory: {$templateDir}");
    }
    if (substr($templateDirNormalized, -1) !== '/') {
        $templateDirNormalized .= '/';
    }
    
    foreach ($iterator as $item) {
        if ($item->isDir()) {
            // Create directory in generated folder
            $sourcePathname = str_replace('\\', '/', $item->getPathname());
            $relativePath = str_replace($templateDirNormalized, '', $sourcePathname);
            // Ensure relative path uses forward slashes
            $relativePath = str_replace('\\', '/', $relativePath);
            $targetPath = $generatedDir . $relativePath;
            
            if (!is_dir($targetPath)) {
                mkdir($targetPath, 0755, true);
            }
        } else {
            // Process file
            $sourcePathname = str_replace('\\', '/', $item->getPathname());
            $relativePath = str_replace($templateDirNormalized, '', $sourcePathname);
            // Ensure relative path uses forward slashes
            $relativePath = str_replace('\\', '/', $relativePath);
            $targetPath = $generatedDir . $relativePath;
            $sourcePath = $item->getPathname();
            
            // Get file content
            $content = file_get_contents($sourcePath);
            
            // Process based on file type
            $extension = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
            
            if (in_array($extension, ['html', 'php', 'js', 'json', 'css'])) {
                // Text files - apply variable substitution
                $content = replaceTemplateVariables($content, $variables);
                
                // Special handling for manifest.json
                if (basename($sourcePath) === 'manifest.json') {
                    $content = generateManifest($pwaData, $content);
                }
                
                // Special handling for home.php and index.html
                if (in_array(basename($sourcePath), ['home.php', 'index.html'])) {
                    $content = processHTMLTemplate($content, $pwaData);
                }
            }
            
            // Write processed file
            $targetDir = dirname($targetPath);
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            file_put_contents($targetPath, $content);
            $filesProcessed[] = $relativePath;
        }
    }
    
    // Copy/process assets
    processAssets($pwaData, $templateDir, $generatedDir);
    
    return [
        'generated_dir' => $generatedDir,
        'files_processed' => $filesProcessed
    ];
}

/**
 * Prepare template variables from PWA data
 */
function prepareTemplateVariables($pwaData) {
    $config = $pwaData['config'] ?? [];
    $store = $config['store'] ?? [];
    $design = $config['design'] ?? [];
    
    return [
        'PWA_NAME' => $pwaData['name'] ?? 'PWA',
        'PWA_ID' => $pwaData['id'] ?? '',
        'PWA_DOMAIN' => $pwaData['domain'] ?? '',
        'APP_NAME' => $store['name'] ?? '',
        'APP_DEVELOPER' => $store['developer'] ?? '',
        'APP_RATING' => $store['rating'] ?? '5.0',
        'APP_SIZE' => $store['size'] ?? '',
        'APP_AGE' => $store['age'] ?? '',
        'APP_INSTALLS' => $store['installs'] ?? '',
        'APP_DESCRIPTION' => $config['description'] ?? '',
        'LANGUAGE' => $design['language'] ?? 'en',
        'CATEGORY' => $design['category'] ?? 'gambling',
        'REVIEWS_COUNT' => $config['reviewsCount'] ?? '1M',
        'ONE_SIGNAL_APP_ID' => $config['push']['oneSignalAppId'] ?? '',
    ];
}

/**
 * Generate manifest.json
 */
function generateManifest($pwaData, $existingContent = '') {
    $config = $pwaData['config'] ?? [];
    $store = $config['store'] ?? [];
    $images = $config['images'] ?? [];
    
    $manifest = [
        'dir' => 'ltr',
        'name' => $store['name'] ?? $pwaData['name'] ?? 'PWA',
        'short_name' => substr($store['name'] ?? $pwaData['name'] ?? 'PWA', 0, 12),
        'scope' => './',
        'display' => 'standalone',
        'start_url' => './home.php',
        'theme_color' => '#1f1f1f',
        'background_color' => '#1f1f1f',
        'description' => $config['description'] ?? '',
        'orientation' => 'any',
        'prefer_related_applications' => false,
        'icons' => [
            [
                'src' => './static/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            ],
            [
                'src' => './static/icons/icon-384x384.png',
                'sizes' => '384x384',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            ],
            [
                'src' => './static/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            ]
        ],
        'screenshots' => []
    ];
    
    // Add screenshots
    if (!empty($images['screenshots'])) {
        foreach (array_slice($images['screenshots'], 0, 4) as $screenshot) {
            if (!empty($screenshot)) {
                $manifest['screenshots'][] = [
                    'src' => $screenshot,
                    'sizes' => '1280x720',
                    'type' => 'image/jpeg',
                    'label' => 'Screenshot'
                ];
            }
        }
    }
    
    return json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}

/**
 * Process HTML template files
 */
function processHTMLTemplate($content, $pwaData) {
    $config = $pwaData['config'] ?? [];
    $store = $config['store'] ?? [];
    $images = $config['images'] ?? [];
    $design = $config['design'] ?? [];
    
    // Log data received for debugging (can be removed later)
    error_log('[PWA Generation] Processing HTML template with data: ' . json_encode([
        'store_name' => $store['name'] ?? 'NOT SET',
        'store_developer' => $store['developer'] ?? 'NOT SET',
        'store_rating' => $store['rating'] ?? 'NOT SET',
        'store_size' => $store['size'] ?? 'NOT SET',
        'store_age' => $store['age'] ?? 'NOT SET',
        'store_installs' => $store['installs'] ?? 'NOT SET',
        'pwa_name' => $pwaData['name'] ?? 'NOT SET',
        'reviews_count' => $config['reviewsCount'] ?? 'NOT SET',
        'has_icon' => !empty($images['icon']),
        'screenshots_count' => isset($images['screenshots']) ? count($images['screenshots']) : 0
    ]));
    
    // App name - PRIORITY: config[store][name] > config[store][name] (even if empty) > PWA name
    // Only use PWA name as last resort if store name is not set at all
    if (isset($store['name'])) {
        $appName = $store['name']; // Use even if empty - user may have intentionally cleared it
    } else {
        $appName = $pwaData['name'] ?? 'PWA'; // Fallback only if store name not in config
    }
    $appNameEscaped = htmlspecialchars($appName, ENT_QUOTES, 'UTF-8');
    
    // Developer name - use config value, default only if not set
    $developer = $store['developer'] ?? 'Developer';
    $developerEscaped = htmlspecialchars($developer, ENT_QUOTES, 'UTF-8');
    
    // Rating
    $rating = $store['rating'] ?? '5.0';
    $ratingEscaped = htmlspecialchars($rating, ENT_QUOTES, 'UTF-8');
    
    // Reviews count
    $reviewsCount = $config['reviewsCount'] ?? '1M';
    $reviewsCountEscaped = htmlspecialchars($reviewsCount, ENT_QUOTES, 'UTF-8');
    
    // Size
    $size = $store['size'] ?? '';
    $sizeEscaped = htmlspecialchars($size, ENT_QUOTES, 'UTF-8');
    
    // Age
    $age = $store['age'] ?? '';
    $ageEscaped = htmlspecialchars($age, ENT_QUOTES, 'UTF-8');
    
    // Installs
    $installs = $store['installs'] ?? '';
    $installsEscaped = htmlspecialchars($installs, ENT_QUOTES, 'UTF-8');
    
    // Description
    $description = $config['description'] ?? '';
    $descriptionEscaped = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
    
    // Replace title tag
    $content = preg_replace('/<title[^>]*>.*?<\/title>/is', '<title>' . $appNameEscaped . '</title>', $content);
    
    // Replace app name in various locations
    // Pattern: class="name" with skiptranslate or without
    $content = preg_replace('/(<p[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $appNameEscaped . '$3', $content);
    $content = preg_replace('/(<span[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $appNameEscaped . '$3', $content);
    $content = preg_replace('/(<h1[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/h1>)/is', '$1' . $appNameEscaped . '$3', $content);
    $content = preg_replace('/(<h2[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/h2>)/is', '$1' . $appNameEscaped . '$3', $content);
    $content = preg_replace('/(<h3[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/h3>)/is', '$1' . $appNameEscaped . '$3', $content);
    
    // Replace smallname class (used in modals/fullscreen views in index.html)
    $content = preg_replace('/(<p[^>]*class="[^"]*smallname[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $appNameEscaped . '$3', $content);
    
    // Replace title tag with name class
    $content = preg_replace('/(<title[^>]*class="[^"]*name[^"]*"[^>]*>)(.*?)(<\/title>)/is', '$1' . $appNameEscaped . '$2', $content);
    
    // Replace specific hardcoded values
    $content = str_ireplace('Big Bass Splash', $appNameEscaped, $content);
    $content = str_ireplace('Gates of Olympus', $appNameEscaped, $content);
    
    // Replace subtitle/tagline (use description first part or custom)
    if (!empty($description)) {
        $subtitle = strip_tags($description);
        $subtitle = preg_replace('/\n.*/s', '', $subtitle); // First line only
        $subtitle = mb_substr($subtitle, 0, 100); // Limit length
        if (mb_strlen($subtitle) > 100) {
            $subtitle = mb_substr($subtitle, 0, 97) . '...';
        }
    } else {
        $subtitle = $store['tagline'] ?? $config['tagline'] ?? 'Premium gaming experience';
    }
    $subtitleEscaped = htmlspecialchars($subtitle, ENT_QUOTES, 'UTF-8');
    $content = preg_replace('/(<p[^>]*class="[^"]*subtitle[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $subtitleEscaped . '$3', $content);
    $content = preg_replace('/(<span[^>]*class="[^"]*tagline[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $subtitleEscaped . '$3', $content);
    
    // Replace developer name - comprehensive patterns
    $content = preg_replace('/(<p[^>]*class="[^"]*developer[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $developerEscaped . '$3', $content);
    $content = preg_replace('/(<span[^>]*class="[^"]*devname[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $developerEscaped . '$3', $content);
    $content = preg_replace('/(<div[^>]*class="[^"]*developer-name[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $developerEscaped . '$3', $content);
    
    // Replace developer in information-value divs with devname class
    $content = preg_replace('/(<div[^>]*class="[^"]*information-value[^"]*devname[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $developerEscaped . '$3', $content);
    
    // Replace developer in value spans (home.php style)
    $content = preg_replace('/(<span[^>]*class="[^"]*value[^"]*"[^>]*>)(Zayd Group|IGAMING AGENCY|HELIX WatchStudio)(<\/span>)/i', '$1' . $developerEscaped . '$3', $content);
    
    // Replace specific hardcoded developer names (fallback)
    $content = str_ireplace('IGAMING AGENCY', $developerEscaped, $content);
    $content = str_ireplace('HELIX WatchStudio', $developerEscaped, $content);
    $content = str_ireplace('Zayd Group', $developerEscaped, $content);
    
    // Replace rating - comprehensive patterns for index.html
    // ratingvalue class (main rating display)
    $content = preg_replace('/(<div[^>]*class="[^"]*ratingvalue[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $ratingEscaped . '$3', $content);
    // rating-big ratingvalue combination
    $content = preg_replace('/(<div[^>]*class="[^"]*rating-big[^"]*ratingvalue[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $ratingEscaped . '$3', $content);
    // Standard rating class
    $content = preg_replace('/(<span[^>]*class="[^"]*rating[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $ratingEscaped . '$3', $content);
    // rating-badge pattern (home.php style)
    $content = preg_replace('/(<div[^>]*class="[^"]*rating-badge[^"]*"[^>]*>.*?<span>)(.*?)(<\/span>)/is', '$1' . $ratingEscaped . '$3', $content);
    
    // Replace reviews count - comprehensive patterns
    // ratingscountshort class (index.html)
    if (!empty($reviewsCount)) {
        $content = preg_replace('/(<span[^>]*class="[^"]*ratingscountshort[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $reviewsCountEscaped . '$3', $content);
        // ratingscountlong class (index.html long format)
        $content = preg_replace('/(<span[^>]*class="[^"]*ratingscountlong[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $reviewsCountEscaped . '$3', $content);
        $content = preg_replace('/(<div[^>]*class="[^"]*rating-count[^"]*ratingscountlong[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $reviewsCountEscaped . '$3', $content);
    }
    // Generic pattern for reviews text
    $content = preg_replace('/(<span[^>]*>)(\d+[KM]?\s*(?:reviews?|ratings?))(<\/span>)/i', '$1' . $reviewsCountEscaped . ' reviews$3', $content);
    $content = preg_replace('/(<span[^>]*>)(1M\s*reviews?)(<\/span>)/i', '$1' . $reviewsCountEscaped . ' reviews$3', $content);
    
    // Replace size - comprehensive patterns
    if (!empty($size)) {
        // Combined format: "12 MB"
        $content = preg_replace('/(<div[^>]*class="[^"]*size[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $sizeEscaped . '$3', $content);
        $content = preg_replace('/(<span[^>]*class="[^"]*size[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $sizeEscaped . '$3', $content);
        // Information value with size class
        $content = preg_replace('/(<div[^>]*class="[^"]*information-value[^"]*size[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $sizeEscaped . '$3', $content);
        
        // Split format for iOS (sizeNmbr and sizeLttr)
        // Parse size to get number and unit
        if (preg_match('/(\d+(?:\.\d+)?)\s*([A-Za-z]+)/i', $size, $sizeMatches)) {
            $sizeNumber = $sizeMatches[1];
            $sizeUnit = strtoupper($sizeMatches[2]);
            $content = preg_replace('/(<div[^>]*class="[^"]*sizeNmbr[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . htmlspecialchars($sizeNumber, ENT_QUOTES, 'UTF-8') . '$3', $content);
            $content = preg_replace('/(<div[^>]*class="[^"]*sizeLttr[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . htmlspecialchars($sizeUnit, ENT_QUOTES, 'UTF-8') . '$3', $content);
        }
    }
    
    // Replace age - comprehensive patterns
    if (!empty($age)) {
        // iOS shortinfo pattern
        $content = preg_replace('/(<div[^>]*class="[^"]*ios[^"]*shortinfo[^"]*"[^>]*>)(18\+|17\+)(<\/div>)/i', '$1' . $ageEscaped . '$3', $content);
        // Android label pattern
        $content = preg_replace('/(<div[^>]*class="[^"]*android[^"]*label[^"]*"[^>]*>)(18\+|17\+)(<\/div>)/i', '$1' . $ageEscaped . '$3', $content);
        // Information value pattern (iOS information section)
        $content = preg_replace('/(<div[^>]*class="[^"]*information-value[^"]*"[^>]*>)(18\+|17\+)(<\/div>)/i', '$1' . $ageEscaped . '$3', $content);
    }
    
    // Replace installs - comprehensive patterns
    if (!empty($installs)) {
        // Standard installs class
        $content = preg_replace('/(<div[^>]*class="[^"]*installs[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $installsEscaped . '$3', $content);
        // installslong class (in app info section)
        $content = preg_replace('/(<span[^>]*class="[^"]*installslong[^"]*"[^>]*>)(.*?)(<\/span>)/is', '$1' . $installsEscaped . '$3', $content);
    }
    
    // Replace description in subtitle sections and main content
    if (!empty($description)) {
        // Replace in subtitle/content paragraphs
        $content = preg_replace('/(<p[^>]*class="[^"]*subtitle[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $descriptionEscaped . '$3', $content, 1); // First occurrence
        // Replace description in about sections
        $content = preg_replace('/(<p[^>]*id="[^"]*app-description[^"]*"[^>]*>)(.*?)(<\/p>)/is', '$1' . $descriptionEscaped . '$3', $content);
        $content = preg_replace('/(<div[^>]*class="[^"]*bodytext[^"]*"[^>]*>)(.*?)(<\/div>)/is', '$1' . $descriptionEscaped . '$3', $content);
        $content = preg_replace('/(<div[^>]*class="[^"]*copy[^"]*"[^>]*>.*?<p>)(.*?)(<\/p>)/is', '$1' . $descriptionEscaped . '$3', $content, 1);
    }
    
    // Replace OneSignal App ID
    if (!empty($config['push']['oneSignalAppId'])) {
        $appId = $config['push']['oneSignalAppId'];
        $content = preg_replace('/ONE_SIGNAL_APP_ID\s*=\s*["\'][^"\']*["\']/', 'ONE_SIGNAL_APP_ID = "' . $appId . '"', $content);
        $content = preg_replace('/"cbb9cb6a-8723-47b2-9faf-fc00c77c05a1"/', '"' . $appId . '"', $content);
    }
    
    // Replace alt text for images
    $content = preg_replace('/alt="[^"]*Gates of Olympus[^"]*"/i', 'alt="' . $appNameEscaped . ' icon"', $content);
    $content = preg_replace('/alt="[^"]*Big Bass Splash[^"]*"/i', 'alt="' . $appNameEscaped . ' icon"', $content);
    
    // Replace screenshot alt text
    $content = preg_replace('/alt="[^"]*gameplay screenshot[^"]*"/i', 'alt="' . $appNameEscaped . ' gameplay screenshot"', $content);
    
    // Replace icon src if custom icon was provided
    if (!empty($images['icon'])) {
        // Determine icon extension from upload or default to png
        $iconExt = 'png';
        if (strpos($images['icon'], 'jpeg') !== false || strpos($images['icon'], 'jpg') !== false) {
            $iconExt = 'jpg';
        }
        
        // For index.html: use static/icons/icon.png
        $iconSrcIndex = './static/icons/icon.png';
        $content = preg_replace('/src="[^"]*\/static\/icons\/icon\.(png|jpg|jpeg)"/i', 'src="' . $iconSrcIndex . '"', $content);
        $content = preg_replace('/src="\.\/static\/icons\/icon\.(png|jpg|jpeg)"/i', 'src="' . $iconSrcIndex . '"', $content);
        
        // For home.php: use static/home/images/app-icon.jpg or .png
        $iconSrcHome = './static/home/images/app-icon.' . $iconExt;
        $content = preg_replace('/src="[^"]*app-icon\.(jpg|png|jpeg)"/i', 'src="' . $iconSrcHome . '"', $content);
        $content = preg_replace('/src="\.\/static\/home\/images\/app-icon\.(jpg|png|jpeg)"/i', 'src="' . $iconSrcHome . '"', $content);
    }
    
    return $content;
}

/**
 * Save base64 image data to file
 */
function saveBase64Image($base64Data, $targetPath) {
    // Handle data URL format: data:image/png;base64,iVBORw0KGgo...
    if (strpos($base64Data, 'data:image') === 0) {
        // Extract image data
        if (preg_match('/data:image\/(\w+);base64,(.+)/', $base64Data, $matches)) {
            $imageType = $matches[1];
            $imageData = base64_decode($matches[2]);
            
            if ($imageData !== false) {
                // Determine extension from image type
                $extension = ($imageType === 'png') ? 'png' : (($imageType === 'jpeg' || $imageType === 'jpg') ? 'jpg' : 'png');
                
                // Ensure target directory exists
                $targetDir = dirname($targetPath);
                if (!is_dir($targetDir)) {
                    mkdir($targetDir, 0755, true);
                }
                
                // Save file
                return file_put_contents($targetPath, $imageData) !== false;
            }
        }
    }
    
    return false;
}

/**
 * Process and copy assets
 */
function processAssets($pwaData, $templateDir, $generatedDir) {
    $config = $pwaData['config'] ?? [];
    $images = $config['images'] ?? [];
    
    // Process icon if provided
    if (!empty($images['icon'])) {
        $iconPath = $images['icon'];
        
        // Template uses ./static/home/images/app-icon.jpg, but also need icons/ for manifest
        $targetHomeIconDir = $generatedDir . 'static/home/images/';
        $targetIconDir = $generatedDir . 'static/icons/';
        
        if (!is_dir($targetHomeIconDir)) {
            mkdir($targetHomeIconDir, 0755, true);
        }
        if (!is_dir($targetIconDir)) {
            mkdir($targetIconDir, 0755, true);
        }
        
        $savedIconPath = null;
        
        // Check if it's a base64 data URL
        if (strpos($iconPath, 'data:image') === 0) {
            // Determine extension from data URL
            $extension = 'png';
            if (preg_match('/data:image\/(\w+);base64/', $iconPath, $matches)) {
                $imgType = strtolower($matches[1]);
                $extension = ($imgType === 'jpeg' || $imgType === 'jpg') ? 'jpg' : 'png';
            }
            
            // Save to home/images for template use
            $targetIconPath = $targetHomeIconDir . 'app-icon.' . $extension;
            if (saveBase64Image($iconPath, $targetIconPath)) {
                $savedIconPath = $targetIconPath;
                
                // Also save to icons/ for manifest
                $targetManifestIcon = $targetIconDir . 'icon-512x512.' . $extension;
                copy($targetIconPath, $targetManifestIcon);
                // Generate different sizes (simplified - copies same file)
                copy($targetIconPath, $targetIconDir . 'icon-192x192.' . $extension);
                copy($targetIconPath, $targetIconDir . 'icon-384x384.' . $extension);
            }
        } elseif (file_exists($iconPath)) {
            // It's a file path - copy it
            $extension = pathinfo($iconPath, PATHINFO_EXTENSION) ?: 'png';
            $targetIconPath = $targetHomeIconDir . 'app-icon.' . $extension;
            copy($iconPath, $targetIconPath);
            $savedIconPath = $targetIconPath;
            
            // Also copy to icons/ for manifest
            copy($iconPath, $targetIconDir . 'icon-512x512.' . $extension);
            copy($iconPath, $targetIconDir . 'icon-192x192.' . $extension);
            copy($iconPath, $targetIconDir . 'icon-384x384.' . $extension);
        } elseif (strpos($iconPath, 'static/') === 0 || strpos($iconPath, './static/') === 0) {
            // Relative path from template
            $sourceIconPath = $templateDir . ltrim($iconPath, './');
            if (file_exists($sourceIconPath)) {
                $extension = pathinfo($sourceIconPath, PATHINFO_EXTENSION) ?: 'png';
                $targetIconPath = $targetHomeIconDir . 'app-icon.' . $extension;
                copy($sourceIconPath, $targetIconPath);
                $savedIconPath = $targetIconPath;
                
                // Also copy to icons/
                copy($sourceIconPath, $targetIconDir . 'icon-512x512.' . $extension);
                copy($sourceIconPath, $targetIconDir . 'icon-192x192.' . $extension);
                copy($sourceIconPath, $targetIconDir . 'icon-384x384.' . $extension);
            }
        }
    }
    
    // Process screenshots
    if (!empty($images['screenshots']) && is_array($images['screenshots'])) {
        // Template uses static/home/images/screenshot1.jpg, screenshot2.jpg, etc.
        $targetScreenshotsDir = $generatedDir . 'static/home/images/';
        if (!is_dir($targetScreenshotsDir)) {
            mkdir($targetScreenshotsDir, 0755, true);
        }
        
        foreach ($images['screenshots'] as $index => $screenshot) {
            if (empty($screenshot)) continue;
            
            // Determine target path - template uses screenshot1.jpg, screenshot2.jpg, etc. (no dash)
            $targetPath = $targetScreenshotsDir . 'screenshot' . ($index + 1) . '.jpg';
            
            // Determine extension from data URL or file
            $extension = 'jpg';
            if (strpos($screenshot, 'data:image') === 0) {
                if (preg_match('/data:image\/(\w+);base64/', $screenshot, $matches)) {
                    $imgType = strtolower($matches[1]);
                    $extension = ($imgType === 'jpeg' || $imgType === 'jpg' || $imgType === 'png') ? $imgType : 'jpg';
                }
                $targetPath = $targetScreenshotsDir . 'screenshot' . ($index + 1) . '.' . $extension;
                saveBase64Image($screenshot, $targetPath);
            } elseif (file_exists($screenshot)) {
                // It's a file path - copy it
                $ext = pathinfo($screenshot, PATHINFO_EXTENSION) ?: 'jpg';
                $targetPath = $targetScreenshotsDir . 'screenshot' . ($index + 1) . '.' . $ext;
                copy($screenshot, $targetPath);
            } elseif (strpos($screenshot, 'static/') === 0 || strpos($screenshot, './static/') === 0) {
                // Relative path from template
                $sourceScreenshotPath = $templateDir . ltrim($screenshot, './');
                if (file_exists($sourceScreenshotPath)) {
                    $ext = pathinfo($sourceScreenshotPath, PATHINFO_EXTENSION) ?: 'jpg';
                    $targetPath = $targetScreenshotsDir . 'screenshot' . ($index + 1) . '.' . $ext;
                    copy($sourceScreenshotPath, $targetPath);
                }
            }
        }
    }
}

