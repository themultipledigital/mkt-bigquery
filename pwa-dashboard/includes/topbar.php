<header class="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-4">
        <?php if (isset($pwaName) && !empty($pwaName)): ?>
        <div>
            <h2 class="text-lg font-semibold text-white"><?php echo e($pwaName); ?></h2>
            <?php if (isset($pwaStatus)): ?>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?php echo getStatusBadgeClass($pwaStatus); ?> text-white">
                <?php echo getStatusText($pwaStatus); ?>
            </span>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
    
    <div class="flex items-center space-x-4">
        <?php if (isset($pwaPreviewUrl) && !empty($pwaPreviewUrl)): ?>
        <a href="<?php echo e($pwaPreviewUrl); ?>" target="_blank" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            Preview
        </a>
        <button onclick="if(typeof window.stopPWA === 'function') { window.stopPWA(); } else { console.error('stopPWA not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Stop
        </button>
        <?php endif; ?>
        <button onclick="if(typeof window.generatePWA === 'function') { window.generatePWA(event); } else { console.error('generatePWA not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Generate
        </button>
        <button onclick="if(typeof window.savePWA === 'function') { window.savePWA(); } else { console.error('savePWA not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Save
        </button>
        <div class="text-green-500 font-semibold">$29.04</div>
        <button class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
        </button>
        <button class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
        </button>
        <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer">
            <span class="text-sm font-semibold text-white">S</span>
        </div>
    </div>
</header>

