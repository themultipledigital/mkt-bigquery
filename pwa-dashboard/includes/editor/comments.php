<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-4">Comments</h2>
    
    <div class="mb-6 flex items-center justify-between">
        <label class="flex items-center space-x-2">
            <input type="checkbox" name="config[comments][maintainDates]" 
                   <?php echo ($config['comments']['maintainDates'] ?? true) ? 'checked' : ''; ?> 
                   class="rounded bg-gray-700 border-gray-600">
            <span class="text-sm text-gray-300">Maintain up-to-date comment dates</span>
        </label>
        <div class="flex space-x-2">
            <button type="button" onclick="if(typeof window.addComment === 'function') { window.addComment(); } else { console.error('addComment not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                + Add comment
            </button>
            <button type="button" onclick="if(typeof window.generateComments === 'function') { window.generateComments(); } else { console.error('generateComments not available'); alert('Function not loaded. Please refresh the page.'); }" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                Generate by ChatGPT
            </button>
        </div>
    </div>
    
    <div id="comments-list" class="space-y-4">
        <?php 
        $comments = $config['comments']['list'] ?? [];
        foreach ($comments as $index => $comment): 
        ?>
        <div class="border border-gray-700 rounded-lg p-4 comment-item">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="flex">
                        <?php for ($i = 0; $i < 5; $i++): ?>
                        <svg class="w-4 h-4 <?php echo $i < ($comment['rating'] ?? 5) ? 'text-yellow-400' : 'text-gray-600'; ?>" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <?php endfor; ?>
                    </div>
                    <span class="text-sm font-medium text-white"><?php echo e($comment['username'] ?? 'User'); ?></span>
                </div>
                <button type="button" onclick="if(typeof window.removeComment === 'function') { window.removeComment(this); } else { console.error('removeComment not available'); }" class="text-red-500 hover:text-red-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <textarea name="config[comments][list][<?php echo $index; ?>][text]" rows="3" 
                      class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 mb-2"
                      placeholder="Comment text..."><?php echo e($comment['text'] ?? ''); ?></textarea>
            <div class="flex items-center justify-between">
                <input type="text" name="config[comments][list][<?php echo $index; ?>][username]" 
                       value="<?php echo e($comment['username'] ?? ''); ?>" 
                       class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-32"
                       placeholder="Username">
                <input type="number" min="1" max="5" name="config[comments][list][<?php echo $index; ?>][rating]" 
                       value="<?php echo e($comment['rating'] ?? 5); ?>" 
                       class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-20"
                       placeholder="Rating">
                <span class="text-xs text-gray-500">Always up-to-date</span>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    
    <?php if (empty($comments)): ?>
    <p class="text-gray-400 text-center py-8">No comments yet. Click "Add comment" to add one.</p>
    <?php endif; ?>
</div>

<script>
// Initialize commentIndex from PHP - ONLY use window.commentIndex to avoid conflicts
// Never declare 'commentIndex' as a variable - only use window.commentIndex
if (typeof window !== 'undefined') {
    window.commentIndex = <?php echo count($comments); ?>;
}

function addComment() {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.addComment = addComment;
    }
    
    if (typeof window.commentIndex === 'undefined') {
        window.commentIndex = 0;
    }
    
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    const commentHtml = `
        <div class="border border-gray-700 rounded-lg p-4 comment-item">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="flex">
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    </div>
                    <span class="text-sm font-medium text-white">User</span>
                </div>
                <button type="button" onclick="if(typeof window.removeComment === 'function') { window.removeComment(this); } else { console.error('removeComment not available'); }" class="text-red-500 hover:text-red-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <textarea name="config[comments][list][${window.commentIndex}][text]" rows="3" 
                      class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 mb-2"
                      placeholder="Comment text..."></textarea>
            <div class="flex items-center justify-between">
                <input type="text" name="config[comments][list][${window.commentIndex}][username]" 
                       class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-32"
                       placeholder="Username">
                <input type="number" min="1" max="5" name="config[comments][list][${window.commentIndex}][rating]" 
                       value="5" 
                       class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-20"
                       placeholder="Rating">
                <span class="text-xs text-gray-500">Always up-to-date</span>
            </div>
        </div>
    `;
    
    if (commentsList.querySelector('.text-center')) {
        commentsList.innerHTML = commentHtml;
    } else {
        commentsList.insertAdjacentHTML('beforeend', commentHtml);
    }
    window.commentIndex++;
}

function removeComment(button) {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.removeComment = removeComment;
    }
    
    button.closest('.comment-item').remove();
    
    // If no comments left, show placeholder
    const commentsList = document.getElementById('comments-list');
    if (commentsList && commentsList.children.length === 0) {
        commentsList.innerHTML = '<p class="text-gray-400 text-center py-8">No comments yet. Click "Add comment" to add one.</p>';
    }
}

function generateComments() {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.generateComments = generateComments;
    }
    
    const language = document.getElementById('pwa-language')?.value || 'en';
    const count = prompt('How many comments to generate?', '5');
    if (!count || isNaN(count)) return;
    
    const button = (typeof event !== 'undefined' && event.target) || null;
    const originalText = button ? button.textContent : 'Generate by ChatGPT';
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
            type: 'comments',
            language: language,
            count: parseInt(count)
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.comments) {
            const commentsList = document.getElementById('comments-list');
            if (commentsList) {
                commentsList.innerHTML = '';
                if (typeof window.commentIndex === 'undefined') {
                    window.commentIndex = 0;
                }
                result.comments.forEach(comment => {
                    addComment();
                    // Populate the last added comment
                    const items = commentsList.querySelectorAll('.comment-item');
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        const textarea = lastItem.querySelector('textarea');
                        const usernameInput = lastItem.querySelector('input[type="text"]');
                        const ratingInput = lastItem.querySelector('input[type="number"]');
                        if (textarea) textarea.value = comment.text || '';
                        if (usernameInput) usernameInput.value = comment.username || 'User';
                        if (ratingInput) ratingInput.value = comment.rating || 5;
                    }
                });
            }
        } else {
            alert('Error generating comments: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating comments. Please try again.');
    })
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
}

// Make globally accessible
window.addComment = addComment;
window.removeComment = removeComment;
window.generateComments = generateComments;
</script>

