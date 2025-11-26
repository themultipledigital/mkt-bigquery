<div class="bg-gray-800 rounded-lg p-6 sticky top-6">
    <h2 class="text-xl font-semibold text-white mb-4">Mobile Preview</h2>
    
    <div class="mobile-preview">
        <div class="mobile-preview-screen bg-white text-gray-900 overflow-y-auto" style="max-height: 600px;">
            <!-- Preview Content -->
            <div class="p-4">
                <!-- App Header -->
                <div class="text-center mb-6">
                    <!-- Icon with placeholder -->
                    <div class="relative mx-auto mb-3" style="width: 80px; height: 80px;">
                        <img id="preview-icon" 
                             src="<?php 
                             $iconSrc = $imagesConfig['icon'] ?? '';
                             if (strpos($iconSrc, 'data:image') === 0) {
                                 echo $iconSrc;
                             } else {
                                 echo e($iconSrc ?: 'assets/images/default-icon.png');
                             }
                             ?>" 
                             alt="App Icon" 
                             class="w-20 h-20 rounded-2xl mx-auto object-cover"
                             style="display: <?php echo (!empty($iconSrc) || strpos($iconSrc, 'data:image') === 0) ? 'block' : 'none'; ?>"
                             onerror="this.style.display='none'; document.getElementById('preview-icon-placeholder').style.display='flex';">
                        <div id="preview-icon-placeholder" class="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto" 
                             style="display: <?php echo empty($iconSrc) ? 'flex' : 'none'; ?>">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <h3 id="preview-name" class="text-xl font-bold mb-1"><?php echo e($storeConfig['name'] ?? 'App Name'); ?></h3>
                    <p id="preview-developer" class="text-sm text-gray-600 mb-2"><?php echo e($storeConfig['developer'] ?? 'Developer'); ?></p>
                    <div class="flex items-center justify-center space-x-2 mb-4">
                        <span id="preview-rating" class="text-lg font-bold"><?php echo e($storeConfig['rating'] ?? '5.0'); ?></span>
                        <div class="flex" id="preview-stars">
                            <?php 
                            $rating = (float)($storeConfig['rating'] ?? 5.0);
                            for ($i = 0; $i < 5; $i++): 
                            ?>
                            <svg class="w-4 h-4 <?php echo $i < round($rating) ? 'text-yellow-400' : 'text-gray-300'; ?>" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <?php endfor; ?>
                        </div>
                        <span id="preview-reviews" class="text-sm text-gray-600">(<?php echo e($config['reviewsCount'] ?? '1M'); ?>)</span>
                    </div>
                    <button class="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                        Install
                    </button>
                </div>
                
                <!-- Description -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-2">About this game</h4>
                    <p id="preview-description" class="text-sm text-gray-700 leading-relaxed">
                        <?php 
                        $desc = $config['description'] ?? '';
                        if (empty($desc)) {
                            echo 'No description yet. Enter a description to see it here.';
                        } else {
                            echo e(substr($desc, 0, 200));
                            if (strlen($desc) > 200) echo '...';
                        }
                        ?>
                    </p>
                </div>
                
                <!-- Screenshots -->
                <div class="mb-6" id="preview-screenshots-container">
                    <h4 class="font-semibold mb-2">Screenshots</h4>
                    <div class="flex space-x-2 overflow-x-auto pb-2" id="preview-screenshots">
                        <?php 
                        $screenshots = $imagesConfig['screenshots'] ?? [];
                        $hasScreenshots = false;
                        foreach (array_slice($screenshots, 0, 4) as $screenshot): 
                            if (!empty($screenshot)):
                                $hasScreenshots = true;
                        ?>
                        <img src="<?php echo e($screenshot); ?>" alt="Screenshot" class="w-32 h-auto rounded-lg flex-shrink-0 preview-screenshot">
                        <?php 
                            endif;
                        endforeach; 
                        if (!$hasScreenshots):
                        ?>
                        <div class="text-sm text-gray-500 italic">No screenshots yet. Upload screenshots to see them here.</div>
                        <?php endif; ?>
                    </div>
                </div>
                
                <!-- Comments/Reviews -->
                <div class="mb-6" id="preview-comments-container">
                    <h4 class="font-semibold mb-2">Reviews</h4>
                    <div id="preview-comments" class="space-y-3">
                        <?php 
                        $comments = $config['comments']['list'] ?? [];
                        if (empty($comments)):
                        ?>
                        <div class="text-sm text-gray-500 italic">No reviews yet. Add comments to see them here.</div>
                        <?php else: 
                            foreach (array_slice($comments, 0, 3) as $comment): 
                        ?>
                        <div class="border-b border-gray-200 pb-3">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium"><?php echo e($comment['username'] ?? 'User'); ?></span>
                                <div class="flex">
                                    <?php 
                                    $rating = (int)($comment['rating'] ?? 5);
                                    for ($i = 0; $i < 5; $i++): 
                                    ?>
                                    <svg class="w-3 h-3 <?php echo $i < $rating ? 'text-yellow-400' : 'text-gray-300'; ?>" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <?php endfor; ?>
                                </div>
                            </div>
                            <p class="text-xs text-gray-600"><?php echo e(substr($comment['text'] ?? '', 0, 150)); ?><?php echo strlen($comment['text'] ?? '') > 150 ? '...' : ''; ?></p>
                        </div>
                        <?php 
                            endforeach;
                        endif; 
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Update preview when form changes
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pwa-form');
    if (!form) return;
    
    // Watch for changes in all inputs, textareas, and file inputs
    form.addEventListener('input', function(e) {
        if (typeof window.updatePreview === 'function') {
            setTimeout(window.updatePreview, 50); // Small delay to ensure value is updated
        }
    });
    
    form.addEventListener('change', function(e) {
        if (typeof window.updatePreview === 'function') {
            setTimeout(window.updatePreview, 50); // Small delay to ensure value is updated
        }
    });
    
    // Also watch for clicks on comment add/remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.comment-item') || e.target.closest('button[onclick*="addComment"]') || e.target.closest('button[onclick*="removeComment"]')) {
            setTimeout(function() {
                if (typeof window.updatePreview === 'function') {
                    window.updatePreview();
                }
            }, 100);
        }
    });
    
    // Initial preview update
    if (typeof window.updatePreview === 'function') {
        setTimeout(window.updatePreview, 500); // Small delay to ensure all elements are loaded
    }
});

function updatePreview() {
    // Update app name
    const nameInput = document.querySelector('input[name="config[store][name]"]');
    if (nameInput) {
        const previewName = document.getElementById('preview-name');
        if (previewName) {
            const name = nameInput.value || 'App Name';
            previewName.textContent = name;
        }
    }
    
    // Update developer
    const developerInput = document.querySelector('input[name="config[store][developer]"]');
    if (developerInput) {
        const previewDeveloper = document.getElementById('preview-developer');
        if (previewDeveloper) {
            const developer = developerInput.value || 'Developer';
            previewDeveloper.textContent = developer;
        }
    }
    
    // Update rating and stars
    const ratingInput = document.querySelector('input[name="config[store][rating]"]');
    if (ratingInput) {
        const previewRating = document.getElementById('preview-rating');
        const previewStars = document.getElementById('preview-stars');
        const rating = parseFloat(ratingInput.value) || 5.0;
        
        if (previewRating) {
            previewRating.textContent = rating.toFixed(1);
        }
        
        // Update star display
        if (previewStars) {
            previewStars.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                star.setAttribute('class', 'w-4 h-4 ' + (i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'));
                star.setAttribute('fill', 'currentColor');
                star.setAttribute('viewBox', '0 0 20 20');
                star.innerHTML = '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>';
                previewStars.appendChild(star);
            }
        }
    }
    
    // Update reviews count
    const reviewsInput = document.querySelector('input[name="config[reviewsCount]"]');
    if (reviewsInput) {
        const previewReviews = document.getElementById('preview-reviews');
        if (previewReviews) {
            const reviews = reviewsInput.value || '1M';
            previewReviews.textContent = '(' + reviews + ')';
        }
    }
    
    // Update description
    const descriptionTextarea = document.getElementById('app-description');
    if (descriptionTextarea) {
        const previewDescription = document.getElementById('preview-description');
        if (previewDescription) {
            const text = descriptionTextarea.value || 'Enter a description to see it here.';
            previewDescription.textContent = text.length > 200 ? text.substring(0, 200) + '...' : text;
        }
    }
    
    // Update icon - get from app-icon-preview element
    const iconPreview = document.getElementById('app-icon-preview');
    const previewIcon = document.getElementById('preview-icon');
    const iconPlaceholder = document.getElementById('preview-icon-placeholder');
    
    if (previewIcon && iconPlaceholder) {
        if (iconPreview) {
            // Get icon src from the store page design icon preview
            let iconSrc = iconPreview.src;
            const iconDisplay = window.getComputedStyle(iconPreview).display;
            
            // Check if icon is visible and has a valid src
            if (iconDisplay !== 'none' && iconSrc && iconSrc !== window.location.href && !iconSrc.includes('default-icon.png')) {
                previewIcon.src = iconSrc;
                previewIcon.style.display = 'block';
                previewIcon.onerror = function() {
                    this.style.display = 'none';
                    iconPlaceholder.style.display = 'flex';
                };
                iconPlaceholder.style.display = 'none';
            } else {
                // No icon - show placeholder
                previewIcon.style.display = 'none';
                iconPlaceholder.style.display = 'flex';
            }
        } else {
            // No icon element - show placeholder
            previewIcon.style.display = 'none';
            iconPlaceholder.style.display = 'flex';
        }
    }
    
    // Update screenshots
    const screenshotInputs = document.querySelectorAll('input[id^="screenshot-input-"]');
    const previewScreenshots = document.getElementById('preview-screenshots');
    if (previewScreenshots) {
        previewScreenshots.innerHTML = '';
        let hasScreenshots = false;
        
        screenshotInputs.forEach((input, index) => {
            const screenshot = input.value;
            if (screenshot && screenshot.trim() !== '') {
                hasScreenshots = true;
                const img = document.createElement('img');
                
                // Handle data URLs or file paths
                if (screenshot.startsWith('data:image')) {
                    img.src = screenshot;
                } else if (screenshot.startsWith('static/') || screenshot.startsWith('./static/')) {
                    // Relative path from template
                    img.src = 'templates/template_bigbasssplashplaygame/' + screenshot.replace(/^\.\//, '');
                } else {
                    img.src = screenshot;
                }
                
                img.alt = 'Screenshot ' + (index + 1);
                img.className = 'w-32 h-auto rounded-lg flex-shrink-0 preview-screenshot';
                img.onerror = function() {
                    // If image fails to load, try to hide it gracefully
                    this.style.display = 'none';
                };
                previewScreenshots.appendChild(img);
            }
        });
        
        if (!hasScreenshots) {
            const placeholder = document.createElement('div');
            placeholder.className = 'text-sm text-gray-500 italic';
            placeholder.textContent = 'No screenshots yet. Upload screenshots to see them here.';
            previewScreenshots.appendChild(placeholder);
        }
    }
    
    // Update comments/reviews
    const previewComments = document.getElementById('preview-comments');
    if (previewComments) {
        // Get all comment items from the comments list
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            const commentItems = commentsList.querySelectorAll('.comment-item');
            previewComments.innerHTML = '';
            
            if (commentItems.length === 0) {
                const placeholder = document.createElement('div');
                placeholder.className = 'text-sm text-gray-500 italic';
                placeholder.textContent = 'No reviews yet. Add comments to see them here.';
                previewComments.appendChild(placeholder);
            } else {
                // Show first 3 comments
                Array.from(commentItems).slice(0, 3).forEach(item => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'border-b border-gray-200 pb-3';
                    
                    // Get username
                    const usernameInput = item.querySelector('input[type="text"]');
                    const username = usernameInput ? usernameInput.value || 'User' : 'User';
                    
                    // Get rating
                    const ratingInput = item.querySelector('input[type="number"]');
                    const rating = ratingInput ? parseInt(ratingInput.value) || 5 : 5;
                    
                    // Get text
                    const textarea = item.querySelector('textarea');
                    const text = textarea ? textarea.value || '' : '';
                    const displayText = text.length > 150 ? text.substring(0, 150) + '...' : text;
                    
                    // Create stars
                    let starsHtml = '';
                    for (let i = 0; i < 5; i++) {
                        starsHtml += '<svg class="w-3 h-3 ' + (i < rating ? 'text-yellow-400' : 'text-gray-300') + '" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
                    }
                    
                    commentDiv.innerHTML = `
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium">${username}</span>
                            <div class="flex">${starsHtml}</div>
                        </div>
                        <p class="text-xs text-gray-600">${displayText}</p>
                    `;
                    
                    previewComments.appendChild(commentDiv);
                });
            }
        } else {
            // No comments list element - show placeholder
            previewComments.innerHTML = '<div class="text-sm text-gray-500 italic">No reviews yet. Add comments to see them here.</div>';
        }
    }
}

// Make updatePreview globally accessible
if (typeof window !== 'undefined') {
    window.updatePreview = updatePreview;
}
</script>

