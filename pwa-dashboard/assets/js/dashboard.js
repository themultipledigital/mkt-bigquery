// Dashboard JavaScript

// Helper function to set nested object value from bracket notation path
// Example: setNestedValue(data, 'store][name', 'My App') sets data.store.name = 'My App'
// Example: setNestedValue(data, 'comments][list][0][text', 'Comment') sets data.comments.list[0].text = 'Comment'
function setNestedValue(obj, path, value) {
    if (!path) return;
    
    // Parse path segments - remove any leading/trailing brackets and split by ']['
    // Path format: "store][name" or "comments][list][0][text"
    let cleanPath = path.replace(/^\[+|\]+$/g, ''); // Remove leading/trailing brackets
    const segments = cleanPath.split('][');
    
    if (segments.length === 0) return;
    
    let current = obj;
    // Navigate/create nested structure
    for (let i = 0; i < segments.length - 1; i++) {
        let key = segments[i].replace(/^\[|\]$/g, ''); // Clean up any remaining brackets
        if (!key) continue;
        
        const isNumeric = /^\d+$/.test(key);
        const nextKey = segments[i + 1];
        const isNextNumeric = nextKey && /^\d+$/.test(nextKey.replace(/^\[|\]$/g, ''));
        
        if (!current[key]) {
            current[key] = isNextNumeric ? [] : {};
        }
        current = current[key];
    }
    
    // Set the final value
    const lastKey = segments[segments.length - 1].replace(/^\[|\]$/g, '');
    if (/^\d+$/.test(lastKey)) {
        // Array index
        const index = parseInt(lastKey);
        if (!Array.isArray(current)) {
            // Convert to array if needed
            const temp = current;
            current = Array.isArray(current) ? current : [];
            // Need to set it back in parent - this is complex, so just use index
        }
        current[index] = value;
    } else {
        current[lastKey] = value;
    }
}

// Helper function to add array value to nested path
// Example: addArrayValue(data, 'images][screenshots', 'data:image...') 
//          adds to data.images.screenshots array
function addArrayValue(obj, path, value) {
    if (!path || !value) return;
    
    // Remove trailing [] if present
    let cleanPath = path.replace(/\[\]$/, '').replace(/^\[+|\]+$/g, '');
    const segments = cleanPath.split('][');
    
    if (segments.length === 0) return;
    
    let current = obj;
    // Navigate to the array location
    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i].replace(/^\[|\]$/g, '');
        if (!segment) continue;
        
        if (!current[segment]) {
            current[segment] = [];
        }
        current = current[segment];
    }
    
    // Ensure it's an array and add value
    if (!Array.isArray(current)) {
        // Convert existing value to array
        const oldValue = current;
        // Find parent and convert
        let parent = obj;
        for (let i = 0; i < segments.length - 1; i++) {
            parent = parent[segments[i].replace(/^\[|\]$/g, '')];
        }
        const lastSegment = segments[segments.length - 1].replace(/^\[|\]$/g, '');
        parent[lastSegment] = [oldValue];
        current = parent[lastSegment];
    }
    
    // Add value if not empty
    if (value && (typeof value !== 'string' || value.trim() !== '')) {
        current.push(value);
    }
}

// Save PWA function
function savePWA() {
    const form = document.getElementById('pwa-form');
    if (!form) return;
    
    const data = {
        id: document.getElementById('pwa-id')?.value || '',
        name: document.querySelector('input[name="name"]')?.value || '',
        domain: document.querySelector('input[name="domain"]')?.value || '',
        geo: document.querySelector('input[name="geo"]')?.value || '',
        template: document.querySelector('select[name="template"]')?.value || 'template_bigbasssplashplaygame',
        status: document.querySelector('input[name="status"]')?.value || 'new',
        config: {}
    };
    
    // Collect all form inputs including hidden fields
    const allInputs = form.querySelectorAll('input, textarea, select');
    
    allInputs.forEach(input => {
        const name = input.name;
        if (!name || name === 'id') return; // Skip unnamed inputs and ID field
        
        let value = input.value;
        
        // Handle checkboxes
        if (input.type === 'checkbox') {
            value = input.checked;
            if (!value && !name.includes('[')) {
                // For simple checkboxes, skip unchecked
                return;
            }
        }
        
        // Handle file inputs - skip, we handle images separately
        if (input.type === 'file') return;
        
        // Skip empty hidden fields that aren't part of config
        if (input.type === 'hidden' && !name.startsWith('config[') && !value) return;
        
        // Parse nested field names like "config[store][name]" or "config[comments][list][0][text]"
        if (name.startsWith('config[')) {
            // Handle array notation like "config[images][screenshots][]"
            if (name.endsWith('[]')) {
                if (value) { // Only add if value exists
                    addArrayValue(data.config, name.replace('config[', ''), value);
                }
            } else {
                // Handle regular nested fields
                const configPath = name.replace(/^config\[/, '').replace(/\]$/, '');
                setNestedValue(data.config, configPath, value);
            }
        } else if (!['id', 'name', 'domain', 'geo', 'template', 'status'].includes(name)) {
            // Top-level fields (already handled above)
            data[name] = value;
        }
    });
    
    // Ensure icon is saved from hidden input (handleImageUpload already sets it)
    // Screenshots are already handled via hidden inputs in the form
    
    // Filter out empty screenshot values
    if (data.config.images && Array.isArray(data.config.images.screenshots)) {
        data.config.images.screenshots = data.config.images.screenshots.filter(s => {
            return s && typeof s === 'string' && s.trim() !== '';
        });
    }
    
    console.log('Saving PWA data:', JSON.stringify(data, null, 2));
    
    // Send to API
    fetch('api/save-pwa.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('PWA saved successfully!');
            
            // Update preview after save (without reloading)
            if (typeof window.updatePreview === 'function') {
                setTimeout(function() {
                    window.updatePreview();
                }, 100);
            }
            
            // Don't reload - allow user to continue editing
            // if (result.redirect) {
            //     window.location.href = result.redirect;
            // } else {
            //     window.location.reload();
            // }
        } else {
            alert('Error saving PWA: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving PWA. Please try again.');
    });
}

// Stop PWA function
function stopPWA() {
    const pwaId = document.getElementById('pwa-id')?.value;
    if (!pwaId) return;
    
    if (confirm('Are you sure you want to stop this PWA?')) {
        fetch('api/save-pwa.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: pwaId,
                status: 'stopped'
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                window.location.reload();
            } else {
                alert('Error stopping PWA: ' + (result.error || 'Unknown error'));
            }
        });
    }
}

// Generate description with ChatGPT
function generateDescription() {
    const prompt = document.getElementById('description-prompt')?.value || '';
    const language = document.getElementById('pwa-language')?.value || 'en';
    const category = document.getElementById('pwa-category')?.value || '';
    
    if (!prompt) {
        alert('Please enter a prompt for the description');
        return;
    }
    
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Generating...';
    
    fetch('api/chatgpt.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'description',
            prompt: prompt,
            language: language,
            category: category
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.text) {
            const textarea = document.getElementById('app-description');
            if (textarea) {
                textarea.value = result.text;
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
        button.disabled = false;
        button.textContent = originalText;
    });
}

// Generate comments with ChatGPT
function generateComments() {
    const language = document.getElementById('pwa-language')?.value || 'en';
    const count = document.getElementById('comment-count')?.value || 5;
    
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Generating...';
    
    fetch('api/chatgpt.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'comments',
            language: language,
            count: count
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.comments) {
            // Populate comments
            const commentsContainer = document.getElementById('comments-list');
            if (commentsContainer) {
                result.comments.forEach((comment, index) => {
                    // Add comment to list
                    // Implementation depends on comment structure
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
        button.disabled = false;
        button.textContent = originalText;
    });
}

// Image upload handler
function handleImageUpload(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById('app-icon-placeholder');
        const hiddenInput = document.getElementById('app-icon-input');
        
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }
        
        // Save to hidden input field so it gets saved with form
        if (hiddenInput) {
            hiddenInput.value = e.target.result;
        }
        
        // Update mobile preview
        if (typeof updatePreview === 'function') {
            setTimeout(updatePreview, 100);
        }
    };
    reader.readAsDataURL(file);
}

// Initialize rating chart
function initRatingChart() {
    const ratings = {
        5: parseInt(document.getElementById('rating-5')?.value || 0),
        4: parseInt(document.getElementById('rating-4')?.value || 0),
        3: parseInt(document.getElementById('rating-3')?.value || 0),
        2: parseInt(document.getElementById('rating-2')?.value || 0),
        1: parseInt(document.getElementById('rating-1')?.value || 0)
    };
    
    const total = Object.values(ratings).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    
    Object.keys(ratings).forEach(rating => {
        const percentage = (ratings[rating] / total) * 100;
        const bar = document.getElementById(`rating-chart-${rating}`);
        if (bar) {
            bar.style.width = percentage + '%';
        }
    });
}

// Generate PWA function
function generatePWA(event) {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.generatePWA = generatePWA;
    }
    
    const pwaId = document.getElementById('pwa-id')?.value;
    if (!pwaId) {
        alert('PWA ID not found');
        return;
    }
    
    if (!confirm('Generate PWA files from template? This may take a moment.')) {
        return;
    }
    
    const button = (typeof event !== 'undefined' && event.target) || null;
    const originalText = button ? button.textContent : 'Generate PWA';
    if (button) {
        button.disabled = true;
        button.textContent = 'Generating...';
    }
    
    // Use relative path for API call
    const apiPath = 'api/generate-pwa.php';
    
    fetch(apiPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: pwaId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Please check if the API file exists at: ${apiPath}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            alert('PWA generated successfully! Files processed: ' + result.files_processed);
            if (result.download_url) {
                if (confirm('Download generated PWA as ZIP file?')) {
                    window.location.href = result.download_url;
                }
            }
        } else {
            alert('Error generating PWA: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating PWA. Please check the console for details.');
        if (error.message) {
            console.error('Error details:', error.message);
        }
    })
    .finally(() => {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
}

// Copy from App Store
function copyFromAppStore() {
    const url = prompt('Enter App Store URL:', '');
    if (!url) return;
    
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Scraping...';
    
    fetch('api/scrape-appstore.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: url
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.data) {
            const data = result.data;
            if (data.name) {
                const nameInput = document.querySelector('input[name="config[store][name]"]');
                if (nameInput) nameInput.value = data.name;
            }
            if (data.developer) {
                const devInput = document.querySelector('input[name="config[store][developer]"]');
                if (devInput) devInput.value = data.developer;
            }
            if (data.rating) {
                const ratingInput = document.querySelector('input[name="config[store][rating]"]');
                if (ratingInput) ratingInput.value = data.rating;
            }
            if (data.description) {
                const descTextarea = document.getElementById('app-description');
                if (descTextarea) descTextarea.value = data.description;
            }
            alert('App Store data copied successfully!');
        } else {
            alert('Error scraping App Store: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error scraping App Store. Please try again.');
    })
    .finally(() => {
        button.disabled = false;
        button.textContent = originalText;
    });
}

// Copy from Google Play
function copyFromGooglePlay() {
    const url = prompt('Enter Google Play Store URL:', '');
    if (!url) return;
    
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Scraping...';
    
    fetch('api/scrape-playstore.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: url
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success && result.data) {
            const data = result.data;
            if (data.name) {
                const nameInput = document.querySelector('input[name="config[store][name]"]');
                if (nameInput) nameInput.value = data.name;
            }
            if (data.developer) {
                const devInput = document.querySelector('input[name="config[store][developer]"]');
                if (devInput) devInput.value = data.developer;
            }
            if (data.rating) {
                const ratingInput = document.querySelector('input[name="config[store][rating]"]');
                if (ratingInput) ratingInput.value = data.rating;
            }
            if (data.installs) {
                const installsInput = document.querySelector('input[name="config[store][installs]"]');
                if (installsInput) installsInput.value = data.installs;
            }
            if (data.description) {
                const descTextarea = document.getElementById('app-description');
                if (descTextarea) descTextarea.value = data.description;
            }
            alert('Google Play Store data copied successfully!');
        } else {
            alert('Error scraping Google Play Store: ' + (result.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error scraping Google Play Store. Please try again.');
    })
    .finally(() => {
        button.disabled = false;
        button.textContent = originalText;
    });
}

// Do it manually
function doItManually() {
    alert('Manual mode activated. You can now fill in all fields manually.');
}

// Template Selection
function selectTemplate(templateName) {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.selectTemplate = selectTemplate;
    }
    
    // Update visual selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('border-green-500', 'bg-gray-700');
        card.classList.add('border-gray-700', 'bg-gray-800');
        // Remove checkmark
        const checkmark = card.querySelector('svg.text-green-500');
        if (checkmark) checkmark.remove();
        // Remove Active badge
        const activeBadge = card.querySelector('.bg-green-600');
        if (activeBadge && activeBadge.textContent === 'Active') {
            activeBadge.remove();
        }
    });
    
    const selectedCard = document.querySelector(`[data-template="${templateName}"]`);
    if (selectedCard) {
        selectedCard.classList.remove('border-gray-700', 'bg-gray-800');
        selectedCard.classList.add('border-green-500', 'bg-gray-700');
        
        // Add checkmark
        const iconContainer = selectedCard.querySelector('.flex-1').parentElement;
        const checkmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        checkmark.setAttribute('class', 'w-6 h-6 text-green-500');
        checkmark.setAttribute('fill', 'none');
        checkmark.setAttribute('stroke', 'currentColor');
        checkmark.setAttribute('viewBox', '0 0 24 24');
        checkmark.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
        iconContainer.appendChild(checkmark);
        
        // Add Active badge if not exists
        const badgeContainer = selectedCard.querySelector('.flex.items-center.space-x-2');
        if (badgeContainer && !badgeContainer.querySelector('.bg-green-600')) {
            const activeBadge = document.createElement('span');
            activeBadge.className = 'px-2 py-1 bg-green-600 text-xs text-white rounded';
            activeBadge.textContent = 'Active';
            badgeContainer.appendChild(activeBadge);
        }
    }
    
    // Update hidden input
    document.getElementById('selected-template').value = templateName;
    document.getElementById('template-input').value = templateName;
    
    // Update status and show/hide Load button
    updateTemplateStatus(templateName);
    
    // Show/hide Load Template Defaults button
    const loadButton = document.querySelector('button[onclick*="loadTemplateDefaults"]');
    const statusText = document.getElementById('template-status');
    if (templateName && statusText) {
        // Check if template has defaults by making a quick check
        // For now, just update the status message
        if (loadButton) {
            loadButton.style.display = templateName ? 'block' : 'none';
            loadButton.setAttribute('onclick', `loadTemplateDefaults('${templateName}', this)`);
        }
    } else {
        if (loadButton) loadButton.style.display = 'none';
    }
}

// Load Template Defaults
function loadTemplateDefaults(templateName, buttonElement) {
    // Assign to window immediately
    if (typeof window !== 'undefined') {
        window.loadTemplateDefaults = loadTemplateDefaults;
    }
    
    if (!confirm('This will replace all current values with template defaults. Continue?')) {
        return;
    }
    
    const button = buttonElement || (typeof event !== 'undefined' ? event.target : null);
    const originalText = button ? button.textContent : 'Load Template Defaults';
    if (button) {
        button.disabled = true;
        button.textContent = 'Loading...';
    }
    
    fetch('api/get-template-defaults.php?template=' + encodeURIComponent(templateName))
        .then(response => response.json())
        .then(result => {
            if (result.success && result.defaults) {
                populateFormFromTemplate(result.defaults);
                alert('Template defaults loaded successfully!');
                updateTemplateStatus(templateName, true);
            } else {
                alert('Error loading template defaults: ' + (result.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading template defaults. Please try again.');
        })
        .finally(() => {
            if (button) {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
}

// Populate form from template defaults
function populateFormFromTemplate(defaults) {
    // Store page design
    if (defaults.store) {
        if (defaults.store.name) {
            const nameInput = document.querySelector('input[name="config[store][name]"]');
            if (nameInput) nameInput.value = defaults.store.name;
            updatePreview();
        }
        if (defaults.store.developer) {
            const devInput = document.querySelector('input[name="config[store][developer]"]');
            if (devInput) devInput.value = defaults.store.developer;
            updatePreview();
        }
        if (defaults.store.rating !== undefined) {
            const ratingInput = document.querySelector('input[name="config[store][rating]"]');
            if (ratingInput) ratingInput.value = defaults.store.rating;
            updatePreview();
        }
        if (defaults.store.size) {
            const sizeInput = document.querySelector('input[name="config[store][size]"]');
            if (sizeInput) sizeInput.value = defaults.store.size;
        }
        if (defaults.store.age) {
            const ageInput = document.querySelector('input[name="config[store][age]"]');
            if (ageInput) ageInput.value = defaults.store.age;
        }
        if (defaults.store.installs) {
            const installsInput = document.querySelector('input[name="config[store][installs]"]');
            if (installsInput) installsInput.value = defaults.store.installs;
        }
    }
    
    // Description
    if (defaults.description) {
        const descTextarea = document.getElementById('app-description');
        if (descTextarea) {
            descTextarea.value = defaults.description;
            updatePreview();
        }
    }
    
    // Design settings
    if (defaults.design) {
        if (defaults.design.language) {
            const langSelect = document.getElementById('pwa-language');
            if (langSelect) langSelect.value = defaults.design.language;
        }
        if (defaults.design.category) {
            const catSelect = document.getElementById('pwa-category');
            if (catSelect) catSelect.value = defaults.design.category;
        }
    }
    
    // Ratings
    if (defaults.ratings) {
        Object.keys(defaults.ratings).forEach(rating => {
            const ratingInput = document.getElementById('rating-' + rating);
            if (ratingInput) ratingInput.value = defaults.ratings[rating];
        });
        // Update rating chart after a delay
        setTimeout(function() {
            if (typeof updateRatingChart === 'function') {
                updateRatingChart();
            }
        }, 100);
    }
    
    if (defaults.reviewsCount) {
        const reviewsInput = document.querySelector('input[name="config[reviewsCount]"]');
        if (reviewsInput) reviewsInput.value = defaults.reviewsCount;
    }
    
    // Images (icons and screenshots)
    if (defaults.images) {
        // Icon - if it's a data URL, display it
        if (defaults.images.icon) {
            const iconPreview = document.getElementById('app-icon-preview');
            const iconPlaceholder = document.getElementById('app-icon-placeholder');
            
            if (iconPreview) {
                if (defaults.images.icon.startsWith('data:image')) {
                    // Handle base64 data URL
                    iconPreview.src = defaults.images.icon;
                    iconPreview.style.display = 'block';
                    if (iconPlaceholder) iconPlaceholder.style.display = 'none';
                } else {
                    // Handle relative path - try to load from template
                    const iconPath = 'templates/template_bigbasssplashplaygame/' + defaults.images.icon.replace(/^\.\//, '');
                    iconPreview.src = iconPath;
                    iconPreview.style.display = 'block';
                    iconPreview.onerror = function() {
                        // If fails, try original path
                        iconPreview.src = defaults.images.icon;
                        iconPreview.onerror = function() {
                            // If still fails, show placeholder
                            if (iconPlaceholder) iconPlaceholder.style.display = 'flex';
                            iconPreview.style.display = 'none';
                        };
                    };
                    if (iconPlaceholder) iconPlaceholder.style.display = 'none';
                }
                // Trigger preview update after icon loads
                iconPreview.onload = function() {
                    if (typeof updatePreview === 'function') updatePreview();
                };
                if (typeof updatePreview === 'function') updatePreview();
            }
        }
        
        // Screenshots - if they're data URLs, display them
        if (defaults.images.screenshots && Array.isArray(defaults.images.screenshots)) {
            defaults.images.screenshots.forEach((screenshot, index) => {
                if (index >= 6) return; // Max 6 screenshots
                
                const screenshotPreview = document.getElementById('screenshot-preview-' + index);
                const screenshotPlaceholder = document.getElementById('screenshot-placeholder-' + index);
                const screenshotInput = document.getElementById('screenshot-input-' + index);
                
                if (screenshot && screenshot.startsWith('data:image')) {
                    // Handle base64 data URL
                    if (screenshotPreview) {
                        screenshotPreview.src = screenshot;
                        screenshotPreview.style.display = 'block';
                    }
                    if (screenshotPlaceholder) {
                        screenshotPlaceholder.style.display = 'none';
                    }
                    if (screenshotInput) {
                        screenshotInput.value = screenshot; // Store data URL
                    }
                } else if (screenshot) {
                    // Handle relative path - try to load from template
                    const screenshotPath = 'templates/template_bigbasssplashplaygame/' + screenshot.replace(/^\.\//, '');
                    if (screenshotPreview) {
                        screenshotPreview.src = screenshotPath;
                        screenshotPreview.style.display = 'block';
                        screenshotPreview.onerror = function() {
                            // If fails, try original path
                            this.src = screenshot;
                            this.onerror = function() {
                                // If still fails, show placeholder
                                if (screenshotPlaceholder) screenshotPlaceholder.style.display = 'block';
                                this.style.display = 'none';
                            };
                        };
                    }
                    if (screenshotPlaceholder) {
                        screenshotPlaceholder.style.display = 'none';
                    }
                    if (screenshotInput) {
                        // Store screenshot path/data URL
                        screenshotInput.value = screenshot;
                    }
                }
            });
            // Update preview after screenshots loaded
            setTimeout(function() {
                if (typeof updatePreview === 'function') {
                    updatePreview();
                }
            }, 200);
        }
    }
    
    // Comments - clear existing and add new ones properly
    if (defaults.comments && defaults.comments.list && Array.isArray(defaults.comments.list)) {
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            // Clear existing comments
            commentsList.innerHTML = '';
            
            // Reset comment index
            if (typeof window.commentIndex === 'undefined') {
                window.commentIndex = 0;
            }
            window.commentIndex = 0;
            
            // Add each comment from template
            defaults.comments.list.forEach(comment => {
                const rating = comment.rating || 5;
                const stars = Array(5).fill(0).map((_, i) => 
                    `<svg class="w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`
                ).join('');
                
                // Escape HTML in text values
                const commentText = (comment.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                const commentUsername = (comment.username || 'User').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                
                // Create comment HTML
                const commentHtml = `
                    <div class="border border-gray-700 rounded-lg p-4 comment-item">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="flex">
                                    ${stars}
                                </div>
                                <span class="text-sm font-medium text-white">${commentUsername}</span>
                            </div>
                            <button type="button" onclick="removeComment(this)" class="text-red-500 hover:text-red-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                        <textarea name="config[comments][list][${window.commentIndex}][text]" rows="3" 
                                  class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 mb-2"
                                  placeholder="Comment text...">${commentText}</textarea>
                        <div class="flex items-center justify-between">
                            <input type="text" name="config[comments][list][${window.commentIndex}][username]" 
                                   value="${commentUsername}" 
                                   class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-32"
                                   placeholder="Username">
                            <input type="number" min="1" max="5" name="config[comments][list][${window.commentIndex}][rating]" 
                                   value="${rating}" 
                                   class="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm w-20"
                                   placeholder="Rating">
                            <span class="text-xs text-gray-500">Always up-to-date</span>
                        </div>
                    </div>
                `;
                
                commentsList.insertAdjacentHTML('beforeend', commentHtml);
                window.commentIndex++;
            });
            
            // If no comments, show placeholder
            if (defaults.comments.list.length === 0) {
                commentsList.innerHTML = '<p class="text-gray-400 text-center py-8">No comments yet. Click "Add comment" to add one.</p>';
            }
        }
    }
    
    // Tags
    if (defaults.tags && Array.isArray(defaults.tags)) {
        const tagsInput = document.querySelector('input[name="config[tags]"]');
        if (tagsInput) tagsInput.value = defaults.tags.join(', ');
    }
    
    // Update rating chart after loading defaults
    setTimeout(function() {
        if (typeof updateRatingChart === 'function') {
            updateRatingChart();
        }
    }, 100);
    
    // Update preview after loading all defaults (with delay to ensure DOM updates)
    setTimeout(function() {
        if (typeof updatePreview === 'function') {
            updatePreview();
        }
    }, 500);
}

// Update template status
function updateTemplateStatus(templateName, loaded = false) {
    const statusEl = document.getElementById('template-status');
    if (!statusEl) return;
    
    if (templateName && loaded) {
        statusEl.innerHTML = `Template "<strong>${templateName}</strong>" selected. Defaults loaded successfully!`;
    } else if (templateName) {
        statusEl.innerHTML = `Template "<strong>${templateName}</strong>" selected. Click "Load Template Defaults" to populate all fields.`;
    } else {
        statusEl.innerHTML = 'No template selected. Fill in all fields manually.';
    }
    
    // Show/hide Load button
    const loadButton = document.querySelector('button[onclick*="loadTemplateDefaults"]');
    if (loadButton) {
        loadButton.style.display = templateName && !loaded ? 'block' : 'none';
        if (templateName) {
            loadButton.setAttribute('onclick', `loadTemplateDefaults('${templateName}', this)`);
        }
    }
}

// Initialize commentIndex - ONLY use window.commentIndex (never declare as a variable)
// window.commentIndex is set in comments.php, so we just ensure it exists here
if (typeof window === 'undefined' || typeof window.commentIndex === 'undefined') {
    if (typeof window !== 'undefined') {
        window.commentIndex = 0;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initRatingChart();
    
    // Initialize commentIndex from existing comments
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        const existingComments = commentsList.querySelectorAll('.comment-item');
        if (existingComments.length > 0) {
            // Find the highest index from existing comments
            let maxIndex = -1;
            existingComments.forEach(item => {
                const textarea = item.querySelector('textarea');
                if (textarea && textarea.name) {
                    const match = textarea.name.match(/\[(\d+)\]\[text\]/);
                    if (match) {
                        const index = parseInt(match[1]);
                        if (index > maxIndex) maxIndex = index;
                    }
                }
            });
            window.commentIndex = maxIndex + 1;
        }
    }
    
});

// CRITICAL: Assign all functions to window immediately after all declarations
// Function declarations are hoisted, so they're available here
// This must be at the end of the file to ensure all functions are declared first
(function() {
    'use strict';
    if (typeof window === 'undefined') return;
    
    // Function declarations are hoisted, so assign them directly
    window.savePWA = savePWA;
    window.stopPWA = stopPWA;
    window.generateDescription = generateDescription;
    window.generateComments = generateComments;
    window.handleImageUpload = handleImageUpload;
    window.initRatingChart = initRatingChart;
    window.generatePWA = generatePWA;
    window.copyFromAppStore = copyFromAppStore;
    window.copyFromGooglePlay = copyFromGooglePlay;
    window.doItManually = doItManually;
    window.selectTemplate = selectTemplate;
    window.loadTemplateDefaults = loadTemplateDefaults;
    window.populateFormFromTemplate = populateFormFromTemplate;
    window.updateTemplateStatus = updateTemplateStatus;
    
    console.log('[dashboard.js] Functions assigned to window at end of file:', {
        loadTemplateDefaults: typeof window.loadTemplateDefaults === 'function' ? 'OK' : 'MISSING',
        selectTemplate: typeof window.selectTemplate === 'function' ? 'OK' : 'MISSING',
        generatePWA: typeof window.generatePWA === 'function' ? 'OK' : 'MISSING',
        savePWA: typeof window.savePWA === 'function' ? 'OK' : 'MISSING'
    });
})();

