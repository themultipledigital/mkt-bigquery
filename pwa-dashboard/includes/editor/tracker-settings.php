<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Tracker Settings</h2>
    <p class="text-gray-400 mb-6">Configure tracking and analytics settings.</p>
    
    <div class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Offer Link</label>
            <input type="url" name="config[tracker][offerLink]" value="<?php echo e($config['tracker']['offerLink'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="https://example.com/offer">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Tracking Parameters</label>
            <textarea name="config[tracker][params]" rows="4" 
                      class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                      placeholder="utm_source=...&utm_medium=..."><?php echo e($config['tracker']['params'] ?? ''); ?></textarea>
        </div>
    </div>
</div>

