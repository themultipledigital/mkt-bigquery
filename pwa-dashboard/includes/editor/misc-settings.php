<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Miscellaneous Settings</h2>
    <p class="text-gray-400 mb-6">Additional configuration options.</p>
    
    <div class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Template</label>
            <select name="template" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2">
                <?php 
                $templates = getAvailableTemplates();
                foreach ($templates as $template): 
                ?>
                <option value="<?php echo e($template); ?>" <?php echo ($pwa['template'] ?? 'template_bigbasssplashplaygame') === $template ? 'selected' : ''; ?>>
                    <?php echo e($template); ?>
                </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">PWA Name</label>
            <input type="text" name="name" value="<?php echo e($pwa['name'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="Big Bass Splash">
        </div>
    </div>
</div>

