<div class="bg-gray-800 rounded-lg p-6 sticky top-6">
    <h2 class="text-xl font-semibold text-white mb-4">Setting progress</h2>
    
    <div class="space-y-3">
        <?php
        $checklistItems = [
            'domain' => 'Domain',
            'offer' => 'Offer',
            'cloak' => 'Cloak',
            'design' => 'Design',
            'description' => 'App description',
            'comments' => 'Comments',
            'pixels' => 'Pixels'
        ];
        
        $configChecklist = $config['checklist'] ?? [];
        
        foreach ($checklistItems as $key => $label):
            $isReady = $configChecklist[$key] ?? false;
            // Auto-check based on config
            if (!$isReady) {
                if ($key === 'domain' && !empty($pwa['domain'])) $isReady = true;
                if ($key === 'design' && !empty($storeConfig['name'])) $isReady = true;
                if ($key === 'description' && !empty($config['description'])) $isReady = true;
                if ($key === 'comments' && !empty($config['comments']['list'])) $isReady = true;
            }
        ?>
        <div class="flex items-center justify-between">
            <span class="text-sm text-gray-300"><?php echo e($label); ?></span>
            <span class="px-2 py-1 rounded text-xs font-medium <?php echo $isReady ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'; ?>">
                <?php echo $isReady ? 'Ready' : 'Not But'; ?>
            </span>
        </div>
        <?php endforeach; ?>
    </div>
</div>

