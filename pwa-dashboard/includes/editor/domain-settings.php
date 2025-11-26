<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Domain Settings</h2>
    <p class="text-gray-400 mb-6">Configure domain settings for your PWA.</p>
    
    <div class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Domain</label>
            <input type="text" name="domain" value="<?php echo e($pwa['domain'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="example.com">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Geo</label>
            <input type="text" name="geo" value="<?php echo e($pwa['geo'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="KW">
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select name="status" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2">
                <option value="new" <?php echo ($pwa['status'] ?? 'new') === 'new' ? 'selected' : ''; ?>>New</option>
                <option value="active" <?php echo ($pwa['status'] ?? '') === 'active' ? 'selected' : ''; ?>>Active</option>
                <option value="stopped" <?php echo ($pwa['status'] ?? '') === 'stopped' ? 'selected' : ''; ?>>Stopped</option>
            </select>
        </div>
    </div>
</div>

