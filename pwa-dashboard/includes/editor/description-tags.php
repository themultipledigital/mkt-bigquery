<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">App description and Tags</h2>
    <p class="text-gray-400 mb-6">
        A good description and tags significantly improve your conversion rate. Write a compelling description that highlights your app's key features and benefits.
    </p>
    
    <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">App description</label>
        <textarea name="config[description]" id="app-description" rows="8" 
                  class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Welcome to Iced Match! A bright, colorful match-3 game with an amazing interface..."><?php echo e($config['description'] ?? ''); ?></textarea>
    </div>
    
    <div class="flex space-x-4">
        <button type="button" onclick="if(typeof window.generateDescription === 'function') { window.generateDescription(); } else { console.error('generateDescription not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Generate description by ChatGPT
        </button>
        <button type="button" onclick="chooseRandomTags()" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            Choose random tags
        </button>
    </div>
    
    <div class="mt-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Tags</label>
        <input type="text" name="config[tags]" value="<?php echo e(implode(', ', $config['tags'] ?? [])); ?>" 
               class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2" 
               placeholder="game, puzzle, match-3, casino">
        <p class="text-xs text-gray-500 mt-1">Separate tags with commas</p>
    </div>
</div>

<script>
function generateDescription() {
    const prompt = document.getElementById('app-description')?.value || '';
    const language = document.getElementById('pwa-language')?.value || 'en';
    const category = document.getElementById('pwa-category')?.value || '';
    
    // For now, show prompt input
    const userPrompt = prompt('Enter a prompt for generating the description:', '');
    if (!userPrompt) return;
    
    const button = (typeof event !== 'undefined' && event.target) || null;
    const originalText = button ? button.textContent : 'Generate description by ChatGPT';
    if (button) {
        button.disabled = true;
        button.textContent = 'Generating...';
    }
    
    fetch('api/chatgpt.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'description',
            prompt: userPrompt || prompt,
            language: language,
            category: category
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.text) {
            const descTextarea = document.getElementById('app-description');
            if (descTextarea) {
                descTextarea.value = result.text;
                // Update preview
                if (typeof updatePreview === 'function') {
                    updatePreview();
                }
            }
        } else {
            alert('Error generating description: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating description. Please try again.');
    })
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
}

// Make globally accessible
window.generateDescription = generateDescription;

function chooseRandomTags() {
    const categories = ['game', 'puzzle', 'match-3', 'casino', 'gambling', 'entertainment', 'fun', 'addictive'];
    const randomTags = categories.sort(() => 0.5 - Math.random()).slice(0, 4).join(', ');
    document.querySelector('input[name="config[tags]"]').value = randomTags;
}
</script>

