<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Images and Video</h2>
    <p class="text-gray-400 mb-4">Upload images for decorating store page.</p>
    
    <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Youtube video URL</label>
        <input type="url" name="config[images][youtube]" value="<?php echo e($imagesConfig['youtube'] ?? ''); ?>" 
               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
               placeholder="https://www.youtube.com/watch?v=...">
        <p class="text-xs text-gray-500 mt-1">Video is always shown first.</p>
    </div>
    
    <div>
        <label class="block text-sm font-medium text-gray-300 mb-4">Screenshots</label>
        <div class="grid grid-cols-3 gap-4 mb-4" id="screenshots-grid">
            <?php 
            $screenshots = $imagesConfig['screenshots'] ?? [];
            for ($i = 0; $i < 6; $i++): 
                $screenshot = $screenshots[$i] ?? '';
            ?>
            <div class="relative group">
                <div class="aspect-video bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center">
                    <?php if (!empty($screenshot)): ?>
                    <img src="<?php 
                        // Handle data URLs or relative paths
                        if (strpos($screenshot, 'data:image') === 0) {
                            echo $screenshot;
                        } else {
                            // Try to show from template path if it's a relative path
                            if (strpos($screenshot, 'static/') === 0 || strpos($screenshot, './static/') === 0) {
                                echo 'templates/template_bigbasssplashplaygame/' . ltrim($screenshot, './');
                            } else {
                                echo e($screenshot);
                            }
                        }
                    ?>" alt="Screenshot <?php echo $i + 1; ?>" class="w-full h-full object-cover" id="screenshot-preview-<?php echo $i; ?>" 
                    onerror="this.style.display='none'; document.getElementById('screenshot-placeholder-<?php echo $i; ?>').style.display='block';">
                    <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="screenshot-placeholder-<?php echo $i; ?>" style="display: none;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <?php else: ?>
                    <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="screenshot-placeholder-<?php echo $i; ?>">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <?php endif; ?>
                </div>
                <input type="file" id="screenshot-upload-<?php echo $i; ?>" accept="image/*" class="hidden" 
                       onchange="if(typeof window.handleScreenshotUpload === 'function') { window.handleScreenshotUpload(this, <?php echo $i; ?>); } else { console.error('handleScreenshotUpload not available'); }">
                <button type="button" onclick="document.getElementById('screenshot-upload-<?php echo $i; ?>').click()" 
                        class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </button>
                <input type="hidden" name="config[images][screenshots][]" value="<?php echo e($screenshot); ?>" id="screenshot-input-<?php echo $i; ?>">
            </div>
            <?php endfor; ?>
        </div>
    </div>
</div>

<script>
function handleScreenshotUpload(input, index) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('screenshot-preview-' + index);
        const placeholder = document.getElementById('screenshot-placeholder-' + index);
        const hiddenInput = document.getElementById('screenshot-input-' + index);
        
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (hiddenInput) {
            hiddenInput.value = e.target.result;
        }
        
        // Update mobile preview
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    };
    reader.readAsDataURL(file);
}

// Make globally accessible
window.handleScreenshotUpload = handleScreenshotUpload;
</script>

