<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">Rating and Reviews</h2>
    
    <div class="grid grid-cols-2 gap-6 mb-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Rating</label>
            <input type="number" step="0.1" min="0" max="5" name="config[store][rating]" 
                   value="<?php echo e($storeConfig['rating'] ?? 5.0); ?>" 
                   id="rating-input"
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                   onchange="updateRatingDisplay()">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Number of reviews</label>
            <input type="text" name="config[reviewsCount]" value="<?php echo e($config['reviewsCount'] ?? '1M'); ?>" 
                   class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
                   placeholder="1M">
        </div>
    </div>
    
    <!-- Rating Distribution Chart -->
    <div class="mb-6">
        <h3 class="text-lg font-medium text-white mb-4">Rating Distribution</h3>
        <div class="space-y-3">
            <?php for ($rating = 5; $rating >= 1; $rating--): 
                $count = $ratingsConfig[$rating] ?? 0;
                $percentage = 0;
                $total = array_sum($ratingsConfig ?? []);
                if ($total > 0) {
                    $percentage = ($count / $total) * 100;
                }
            ?>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2 w-20">
                    <span class="text-sm text-gray-400"><?php echo $rating; ?></span>
                    <div class="flex">
                        <?php for ($i = 0; $i < 5; $i++): ?>
                        <svg class="w-4 h-4 <?php echo $i < $rating ? 'text-yellow-400' : 'text-gray-600'; ?>" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <?php endfor; ?>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="rating-chart">
                        <div class="rating-chart-bar" id="rating-chart-<?php echo $rating; ?>" style="width: <?php echo $percentage; ?>%"></div>
                    </div>
                </div>
                <div class="w-16">
                    <input type="number" min="0" name="config[ratings][<?php echo $rating; ?>]" 
                           id="rating-<?php echo $rating; ?>"
                           value="<?php echo $count; ?>" 
                           class="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                           onchange="if(typeof window.updateRatingChart === 'function') { window.updateRatingChart(); } else { console.error('updateRatingChart not available'); }">
                </div>
            </div>
            <?php endfor; ?>
        </div>
    </div>
</div>

<script>
function updateRatingChart() {
    const ratings = {
        5: parseInt(document.getElementById('rating-5')?.value || 0),
        4: parseInt(document.getElementById('rating-4')?.value || 0),
        3: parseInt(document.getElementById('rating-3')?.value || 0),
        2: parseInt(document.getElementById('rating-2')?.value || 0),
        1: parseInt(document.getElementById('rating-1')?.value || 0)
    };
    
    const total = Object.values(ratings).reduce((a, b) => a + b, 0);
    if (total === 0) {
        Object.keys(ratings).forEach(rating => {
            const bar = document.getElementById('rating-chart-' + rating);
            if (bar) bar.style.width = '0%';
        });
        return;
    }
    
    Object.keys(ratings).forEach(rating => {
        const percentage = (ratings[rating] / total) * 100;
        const bar = document.getElementById('rating-chart-' + rating);
        if (bar) bar.style.width = percentage + '%';
    });
    
    // Update overall rating
    const weightedSum = Object.keys(ratings).reduce((sum, rating) => {
        return sum + (parseInt(rating) * ratings[rating]);
    }, 0);
    const overallRating = total > 0 ? (weightedSum / total).toFixed(1) : 5.0;
    const ratingInput = document.getElementById('rating-input');
    if (ratingInput) {
        ratingInput.value = overallRating;
    }
    const storeRatingInput = document.querySelector('input[name="config[store][rating]"]');
    if (storeRatingInput) {
        storeRatingInput.value = overallRating;
    }
    
    // Update preview
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

function updateRatingDisplay() {
    updateRatingChart();
}

// Make globally accessible
window.updateRatingChart = updateRatingChart;
window.updateRatingDisplay = updateRatingDisplay;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof updateRatingChart === 'function') {
        updateRatingChart();
    }
});
</script>

