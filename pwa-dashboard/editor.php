<?php
require_once 'includes/functions.php';

$pwaId = $_GET['id'] ?? '';
$pwa = null;

if ($pwaId) {
    $pwa = getPWAById($pwaId);
}

// If no PWA exists, create a new one
if (!$pwa) {
    $pwaId = $pwaId ?: generatePWAId();
    $pwa = [
        'id' => $pwaId,
        'name' => 'New PWA',
        'domain' => '',
        'geo' => '',
        'status' => 'new',
        'created' => date('Y-m-d'),
        'template' => 'template_bigbasssplashplaygame', // Always need a template for structure
        'config' => [
            'design' => [
                'language' => 'en',
                'category' => 'gambling'
            ],
            'store' => [
                'name' => '',
                'developer' => '',
                'rating' => 5.0,
                'size' => '',
                'age' => '',
                'installs' => ''
            ],
            'description' => '',
            'images' => [
                'icon' => '',
                'header' => '',
                'screenshots' => [],
                'youtube' => ''
            ],
            'ratings' => [
                5 => 70,
                4 => 20,
                3 => 5,
                2 => 3,
                1 => 2
            ],
            'reviewsCount' => '1M',
            'comments' => []
        ]
    ];
}

$config = $pwa['config'] ?? [];
$storeConfig = $config['store'] ?? [];
$designConfig = $config['design'] ?? [];
$imagesConfig = $config['images'] ?? [];
$ratingsConfig = $config['ratings'] ?? [];

$pageTitle = $pwa['name'] ?? 'New PWA';
$pwaStatus = $pwa['status'] ?? 'new';
$pwaPreviewUrl = !empty($pwaId) ? "preview.php?id={$pwaId}" : '';

$activeTab = $_GET['tab'] ?? 'design';

// Handle template selection - template is required for structure (which files to generate)
// Default to template_bigbasssplashplaygame - this determines the PWA structure
$selectedTemplate = $pwa['template'] ?? 'template_bigbasssplashplaygame';
if (empty($selectedTemplate)) {
    // Always default to template_bigbasssplashplaygame (required for structure)
    $selectedTemplate = 'template_bigbasssplashplaygame';
}

$templateConfig = $selectedTemplate ? getTemplateConfig($selectedTemplate) : null;
$availableTemplates = getAvailableTemplates();

// Get template info for all templates
$templatesInfo = [];
foreach ($availableTemplates as $templateName) {
    $templatesInfo[$templateName] = getTemplateInfo($templateName);
}

include 'includes/header.php';
?>

<div class="mb-6">
    <h1 class="text-2xl font-bold text-white"><?php echo e($pwa['name'] ?? 'New PWA'); ?></h1>
    <p class="text-gray-400 mt-1">Dashboard > My PWAs > <?php echo e($pwa['name'] ?? 'New PWA'); ?></p>
</div>

<form id="pwa-form" method="POST" action="api/save-pwa.php" enctype="multipart/form-data">
    <input type="hidden" name="id" id="pwa-id" value="<?php echo e($pwaId); ?>">
    <input type="hidden" name="template" id="template-input" value="<?php echo e($selectedTemplate); ?>">
    
    <!-- Tabs -->
    <div class="border-b border-gray-700 mb-6">
        <nav class="flex space-x-8">
            <a href="?id=<?php echo e($pwaId); ?>&tab=domain" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'domain' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Domain
            </a>
            <a href="?id=<?php echo e($pwaId); ?>&tab=tracker" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'tracker' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Tracker
            </a>
            <a href="?id=<?php echo e($pwaId); ?>&tab=design" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'design' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Design
            </a>
            <a href="?id=<?php echo e($pwaId); ?>&tab=analytics" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'analytics' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Analytics
            </a>
            <a href="?id=<?php echo e($pwaId); ?>&tab=push" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'push' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Push Notifications
            </a>
            <a href="?id=<?php echo e($pwaId); ?>&tab=misc" 
               class="py-4 px-1 border-b-2 <?php echo $activeTab === 'misc' ? 'border-green-500 text-green-500' : 'border-transparent text-gray-400 hover:text-gray-300'; ?>">
                Miscellaneous
            </a>
        </nav>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
            
            <?php if ($activeTab === 'design'): ?>
                <?php 
                // Pass template variables to design-settings.php
                // These variables are already set above in editor.php
                include 'includes/editor/design-settings.php'; 
                ?>
                <?php include 'includes/editor/language-category.php'; ?>
                <?php include 'includes/editor/store-page-design.php'; ?>
                <?php include 'includes/editor/images-video.php'; ?>
                <?php include 'includes/editor/description-tags.php'; ?>
                <?php include 'includes/editor/ratings-reviews.php'; ?>
                <?php include 'includes/editor/comments.php'; ?>
            <?php elseif ($activeTab === 'domain'): ?>
                <?php include 'includes/editor/domain-settings.php'; ?>
            <?php elseif ($activeTab === 'tracker'): ?>
                <?php include 'includes/editor/tracker-settings.php'; ?>
            <?php elseif ($activeTab === 'analytics'): ?>
                <?php include 'includes/editor/analytics-settings.php'; ?>
            <?php elseif ($activeTab === 'push'): ?>
                <?php include 'includes/editor/push-settings.php'; ?>
            <?php elseif ($activeTab === 'misc'): ?>
                <?php include 'includes/editor/misc-settings.php'; ?>
            <?php endif; ?>
            
        </div>
        
        <!-- Right Column -->
        <div class="lg:col-span-1 space-y-6">
            <?php include 'includes/editor/progress-checklist.php'; ?>
            <?php include 'includes/editor/mobile-preview.php'; ?>
        </div>
    </div>
</form>

<script>
// Form submission handler
document.getElementById('pwa-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    savePWA();
});
</script>

<?php include 'includes/footer.php'; ?>

