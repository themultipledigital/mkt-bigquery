<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Push Notifications Settings</h2>
    <p class="text-gray-400 mb-6">Configure push notification settings.</p>
    
    <div class="space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">OneSignal App ID</label>
            <input type="text" name="config[push][oneSignalAppId]" value="<?php echo e($config['push']['oneSignalAppId'] ?? ''); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="cbb9cb6a-8723-47b2-9faf-fc00c77c05a1">
        </div>
        
        <div>
            <label class="flex items-center space-x-2">
                <input type="checkbox" name="config[push][enabled]" 
                       <?php echo ($config['push']['enabled'] ?? false) ? 'checked' : ''; ?> 
                       class="rounded bg-gray-700 border-gray-600">
                <span class="text-sm text-gray-300">Enable push notifications</span>
            </label>
        </div>
    </div>
</div>

