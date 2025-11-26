<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-6">Store page design</h2>
    
    <!-- App Header -->
    <div class="mb-6">
        <h3 class="text-lg font-medium text-white mb-4">App header</h3>
        <div class="flex items-center space-x-6">
            <div class="relative">
                <img id="app-icon-preview" 
                     src="<?php 
                     $iconSrc = $imagesConfig['icon'] ?? '';
                     // Handle data URLs from template
                     if (strpos($iconSrc, 'data:image') === 0) {
                         echo $iconSrc;
                     } elseif (!empty($iconSrc) && (strpos($iconSrc, 'static/') === 0 || strpos($iconSrc, './static/') === 0)) {
                         // Relative path from template
                         echo 'templates/template_bigbasssplashplaygame/' . ltrim($iconSrc, './');
                     } elseif (!empty($iconSrc)) {
                         echo e($iconSrc);
                     } else {
                         echo 'assets/images/default-icon.png';
                     }
                     ?>" 
                     alt="App Icon" 
                     class="w-32 h-32 rounded-2xl object-cover border-2 border-gray-700"
                     style="display: <?php echo !empty($iconSrc) ? 'block' : 'none'; ?>"
                     onerror="this.style.display='none'; document.getElementById('app-icon-placeholder').style.display='flex';">
                <div id="app-icon-placeholder" class="w-32 h-32 rounded-2xl bg-gray-700 flex items-center justify-center border-2 border-gray-600" style="display: <?php echo empty($imagesConfig['icon']) ? 'flex' : 'none'; ?>">
                    <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <input type="file" id="app-icon-upload" accept="image/*" class="hidden" onchange="if(typeof window.handleImageUpload === 'function') { window.handleImageUpload(this, 'app-icon-preview'); } else { console.error('handleImageUpload not available'); }">
                <input type="hidden" name="config[images][icon]" id="app-icon-input" value="<?php echo e($imagesConfig['icon'] ?? ''); ?>">
                <button type="button" onclick="document.getElementById('app-icon-upload').click()" class="mt-2 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                    Upload Icon
                </button>
            </div>
            
            <div class="flex-1 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">App name</label>
                    <input type="text" name="config[store][name]" value="<?php echo e($storeConfig['name'] ?? ''); ?>" 
                           class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                           placeholder="Big Bass Splash">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Developer</label>
                    <input type="text" name="config[store][developer]" value="<?php echo e($storeConfig['developer'] ?? ''); ?>" 
                           class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                           placeholder="HELIX WatchStudio">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white mt-1">Verified</span>
                </div>
                <div class="grid grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                        <input type="number" step="0.1" min="0" max="5" name="config[store][rating]" value="<?php echo e($storeConfig['rating'] ?? 5.0); ?>" 
                               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Size</label>
                        <input type="text" name="config[store][size]" value="<?php echo e($storeConfig['size'] ?? ''); ?>" 
                               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                               placeholder="3ML">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Age</label>
                        <input type="text" name="config[store][age]" value="<?php echo e($storeConfig['age'] ?? ''); ?>" 
                               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                               placeholder="17+">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Installs</label>
                        <input type="text" name="config[store][installs]" value="<?php echo e($storeConfig['installs'] ?? ''); ?>" 
                               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                               placeholder="1,00">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

