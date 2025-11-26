<?php
// Template selection variables are passed from editor.php
// If not set, initialize them here
if (!isset($selectedTemplate)) {
    require_once __DIR__ . '/../../includes/functions.php';
    $selectedTemplate = isset($pwa['template']) ? $pwa['template'] : '';
    if (empty($selectedTemplate)) {
        // Default to template_bigbasssplashplaygame if it exists
        $defaultTemplate = 'template_bigbasssplashplaygame';
        if (is_dir(getTemplatesDir() . $defaultTemplate)) {
            $selectedTemplate = $defaultTemplate;
        }
    }
}

if (!isset($templateConfig)) {
    $templateConfig = $selectedTemplate ? getTemplateConfig($selectedTemplate) : null;
}

if (!isset($availableTemplates)) {
    $availableTemplates = getAvailableTemplates();
}

if (!isset($templatesInfo) || empty($templatesInfo)) {
    $templatesInfo = [];
    foreach ($availableTemplates as $templateName) {
        $templatesInfo[$templateName] = getTemplateInfo($templateName);
    }
}
?>

<!-- Template Selection Section -->
<div class="bg-gray-800 rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold text-white mb-2">Select Template Structure</h2>
    <p class="text-gray-400 mb-6">The template determines the PWA structure (which files and layout are generated). You can load default values from the template or fill in all fields manually.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="templates-grid">
        <?php foreach ($availableTemplates as $templateName): 
            $templateInfo = $templatesInfo[$templateName] ?? [];
            $isSelected = $selectedTemplate === $templateName;
            // Check multiple possible icon locations
            $iconPath1 = getTemplatesDir() . $templateName . '/static/icons/icon.png';
            $iconPath2 = getTemplatesDir() . $templateName . '/static/icons/icon-512x512.png';
            $hasIcon = file_exists($iconPath1) || file_exists($iconPath2);
            $iconSrc = '';
            if (file_exists($iconPath1)) {
                $iconSrc = 'templates/' . $templateName . '/static/icons/icon.png';
            } elseif (file_exists($iconPath2)) {
                $iconSrc = 'templates/' . $templateName . '/static/icons/icon-512x512.png';
            }
        ?>
        <div class="template-card border-2 rounded-lg p-4 cursor-pointer transition-all <?php echo $isSelected ? 'border-green-500 bg-gray-700' : 'border-gray-700 bg-gray-800 hover:border-gray-600'; ?>" 
             data-template="<?php echo e($templateName); ?>"
             onclick="if(typeof window.selectTemplate === 'function') { window.selectTemplate('<?php echo e($templateName); ?>'); } else { console.error('selectTemplate not available'); alert('Function not loaded. Please refresh the page.'); }">
            <div class="flex items-center space-x-4 mb-3">
                <?php if ($hasIcon && !empty($iconSrc)): ?>
                <img src="<?php echo e($iconSrc); ?>" 
                     alt="<?php echo e($templateInfo['displayName'] ?? $templateName); ?>" 
                     class="w-16 h-16 rounded-lg object-cover">
                <?php else: ?>
                <div class="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <?php endif; ?>
                <div class="flex-1">
                    <h3 class="font-semibold text-white"><?php echo e($templateInfo['displayName'] ?? $templateName); ?></h3>
                    <p class="text-xs text-gray-400">v<?php echo e($templateInfo['version'] ?? '1.0'); ?></p>
                </div>
                <?php if ($isSelected): ?>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <?php endif; ?>
            </div>
            <p class="text-sm text-gray-400 mb-3"><?php echo e($templateInfo['description'] ?? 'No description'); ?></p>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"><?php echo e($templateInfo['category'] ?? 'general'); ?></span>
                <?php if ($isSelected): ?>
                <span class="px-2 py-1 bg-green-600 text-xs text-white rounded">Active</span>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    
    <input type="hidden" name="template" id="selected-template" value="<?php echo e($selectedTemplate); ?>">
    
    <div class="mt-6 flex items-center justify-between">
        <p class="text-sm text-gray-400">
            <span id="template-status">
                <?php if ($selectedTemplate && $templateConfig): ?>
                Template "<strong><?php echo e($templateConfig['displayName'] ?? $selectedTemplate); ?></strong>" selected. 
                This template provides the PWA structure. Click "Load Template Defaults" to populate all fields with template values.
                <?php elseif ($selectedTemplate): ?>
                Template "<strong><?php echo e($selectedTemplate); ?></strong>" selected. 
                This template provides the PWA structure. No default values available - fill in all fields manually.
                <?php else: ?>
                Template "<strong><?php echo e($selectedTemplate); ?></strong>" selected. Fill in all fields manually.
                <?php endif; ?>
            </span>
        </p>
        <?php if ($selectedTemplate && $templateConfig): ?>
        <button type="button" onclick="if(typeof window.loadTemplateDefaults === 'function') { window.loadTemplateDefaults('<?php echo e($selectedTemplate); ?>', this); } else { console.error('loadTemplateDefaults not available'); alert('Function not loaded. Please refresh the page.'); }" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Load Template Defaults
        </button>
        <?php endif; ?>
    </div>
</div>

<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Design Settings</h2>
    <p class="text-gray-400 mb-6">You can do everything yourself or copy the design of an existing application.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button type="button" onclick="copyFromAppStore()" class="px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <div class="font-semibold">Copy from App Store</div>
            </div>
        </button>
        
        <button type="button" onclick="copyFromGooglePlay()" class="px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <div class="font-semibold">Copy from Google Play</div>
            </div>
        </button>
        
        <button type="button" onclick="doItManually()" class="px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
            <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <div class="font-semibold">Do it manually</div>
            </div>
        </button>
    </div>
</div>

