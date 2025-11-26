<?php
require_once 'includes/functions.php';

$pageTitle = 'My PWAs';
$breadcrumb = 'Dashboard > My PWAs';

// Load PWAs
$data = loadPWAs();
$pwas = $data['pwas'] ?? [];

// Filtering
$statusFilter = $_GET['status'] ?? 'all';
$geoFilter = $_GET['geo'] ?? '';
$searchQuery = $_GET['search'] ?? '';

// Apply filters
$filteredPWAs = $pwas;
if ($statusFilter !== 'all') {
    $filteredPWAs = array_filter($filteredPWAs, function($pwa) use ($statusFilter) {
        return ($pwa['status'] ?? 'new') === $statusFilter;
    });
}

if ($geoFilter) {
    $filteredPWAs = array_filter($filteredPWAs, function($pwa) use ($geoFilter) {
        return ($pwa['geo'] ?? '') === $geoFilter;
    });
}

if ($searchQuery) {
    $filteredPWAs = array_filter($filteredPWAs, function($pwa) use ($searchQuery) {
        $searchLower = strtolower($searchQuery);
        return strpos(strtolower($pwa['name'] ?? ''), $searchLower) !== false ||
               strpos(strtolower($pwa['id'] ?? ''), $searchLower) !== false ||
               strpos(strtolower($pwa['domain'] ?? ''), $searchLower) !== false;
    });
}

$filteredPWAs = array_values($filteredPWAs); // Re-index

// Counts
$counts = [
    'all' => count($pwas),
    'active' => count(array_filter($pwas, fn($p) => ($p['status'] ?? 'new') === 'active')),
    'new' => count(array_filter($pwas, fn($p) => ($p['status'] ?? 'new') === 'new')),
    'stopped' => count(array_filter($pwas, fn($p) => ($p['status'] ?? 'new') === 'stopped'))
];

// Get unique geos
$geos = array_unique(array_filter(array_column($pwas, 'geo')));
sort($geos);

include 'includes/header.php';
?>

<div class="space-y-6">
    <!-- Filters and Search -->
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <a href="?status=all<?php echo $geoFilter ? '&geo=' . urlencode($geoFilter) : ''; ?><?php echo $searchQuery ? '&search=' . urlencode($searchQuery) : ''; ?>" 
               class="px-4 py-2 rounded-lg <?php echo $statusFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'; ?>">
                All <?php echo $counts['all']; ?>
            </a>
            <a href="?status=active<?php echo $geoFilter ? '&geo=' . urlencode($geoFilter) : ''; ?><?php echo $searchQuery ? '&search=' . urlencode($searchQuery) : ''; ?>" 
               class="px-4 py-2 rounded-lg <?php echo $statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'; ?>">
                Active <?php echo $counts['active']; ?>
            </a>
            <a href="?status=new<?php echo $geoFilter ? '&geo=' . urlencode($geoFilter) : ''; ?><?php echo $searchQuery ? '&search=' . urlencode($searchQuery) : ''; ?>" 
               class="px-4 py-2 rounded-lg <?php echo $statusFilter === 'new' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'; ?>">
                New <?php echo $counts['new']; ?>
            </a>
            <a href="?status=stopped<?php echo $geoFilter ? '&geo=' . urlencode($geoFilter) : ''; ?><?php echo $searchQuery ? '&search=' . urlencode($searchQuery) : ''; ?>" 
               class="px-4 py-2 rounded-lg <?php echo $statusFilter === 'stopped' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'; ?>">
                Stopped <?php echo $counts['stopped']; ?>
            </a>
        </div>
        
        <div class="flex items-center space-x-4">
            <select name="geo" onchange="window.location.href='?status=<?php echo $statusFilter; ?>&geo=' + this.value + '<?php echo $searchQuery ? '&search=' . urlencode($searchQuery) : ''; ?>'" 
                    class="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-4 py-2">
                <option value="">All Geo</option>
                <?php foreach ($geos as $geo): ?>
                <option value="<?php echo e($geo); ?>" <?php echo $geoFilter === $geo ? 'selected' : ''; ?>>
                    <?php echo e($geo); ?>
                </option>
                <?php endforeach; ?>
            </select>
            
            <form method="GET" class="flex items-center space-x-2">
                <input type="hidden" name="status" value="<?php echo e($statusFilter); ?>">
                <input type="hidden" name="geo" value="<?php echo e($geoFilter); ?>">
                <input type="text" name="search" value="<?php echo e($searchQuery); ?>" 
                       placeholder="Search by name, id or domain" 
                       class="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-4 py-2 w-64">
                <button type="submit" class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </button>
            </form>
            
            <a href="editor.php" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                New PWA
            </a>
        </div>
    </div>

    <!-- PWA Table -->
    <div class="bg-gray-800 rounded-lg overflow-hidden">
        <table class="w-full">
            <thead class="bg-gray-700">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Geo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date of creation</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
                <?php if (empty($filteredPWAs)): ?>
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                        No PWAs found. <a href="editor.php" class="text-green-500 hover:underline">Create your first PWA</a>
                    </td>
                </tr>
                <?php else: ?>
                <?php foreach ($filteredPWAs as $pwa): ?>
                <tr class="hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-white"><?php echo e($pwa['name'] ?? 'Unnamed'); ?></div>
                        <div class="text-sm text-gray-400"><?php echo e($pwa['id'] ?? ''); ?></div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <?php echo e($pwa['domain'] ?? '-'); ?>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <?php if (!empty($pwa['geo'])): ?>
                        <span class="text-sm text-gray-400"><?php echo e($pwa['geo']); ?></span>
                        <?php else: ?>
                        <span class="text-sm text-gray-500">-</span>
                        <?php endif; ?>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <?php echo formatDate($pwa['created'] ?? ''); ?>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo getStatusBadgeClass($pwa['status'] ?? 'new'); ?> text-white">
                            <?php echo getStatusText($pwa['status'] ?? 'new'); ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href="editor.php?id=<?php echo e($pwa['id'] ?? ''); ?>" class="text-green-500 hover:text-green-400 mr-4">Edit</a>
                        <a href="api/delete-pwa.php?id=<?php echo e($pwa['id'] ?? ''); ?>" 
                           onclick="return confirm('Are you sure you want to delete this PWA?')" 
                           class="text-red-500 hover:text-red-400">Delete</a>
                    </td>
                </tr>
                <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if (!empty($filteredPWAs)): ?>
    <div class="flex items-center justify-between">
        <div class="text-sm text-gray-400">
            Rows per page: 10
        </div>
        <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">1-<?php echo min(10, count($filteredPWAs)); ?> of <?php echo count($filteredPWAs); ?></span>
            <button class="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50" disabled>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <button class="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50" <?php echo count($filteredPWAs) <= 10 ? 'disabled' : ''; ?>>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
        <label class="flex items-center space-x-2 text-sm text-gray-400">
            <input type="checkbox" class="rounded bg-gray-800 border-gray-700">
            <span>Dense</span>
        </label>
    </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>

