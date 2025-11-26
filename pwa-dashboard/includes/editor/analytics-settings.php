<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Analytics Settings</h2>
    <p class="text-gray-400 mb-6">Configure analytics integration.</p>
    
    <div class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Google Analytics ID</label>
            <input type="text" name="config[analytics][gaId]" value="<?php echo e($config['analytics']['gaId'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="G-XXXXXXXXXX">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Facebook Pixel ID</label>
            <input type="text" name="config[analytics][fbPixel]" value="<?php echo e($config['analytics']['fbPixel'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="1234567890">
        </div>
    </div>
</div>

