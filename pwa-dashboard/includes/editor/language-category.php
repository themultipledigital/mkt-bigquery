<div class="bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold text-white mb-2">PWA Language and Category</h2>
    <p class="text-gray-400 mb-6">
        Language and category affect system labels, installation page, style, and content generation. Choose carefully.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select name="config[design][language]" id="pwa-language" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2">
                <option value="en" <?php echo ($designConfig['language'] ?? 'en') === 'en' ? 'selected' : ''; ?>>English</option>
                <option value="de" <?php echo ($designConfig['language'] ?? '') === 'de' ? 'selected' : ''; ?>>German</option>
                <option value="fr" <?php echo ($designConfig['language'] ?? '') === 'fr' ? 'selected' : ''; ?>>French</option>
                <option value="es" <?php echo ($designConfig['language'] ?? '') === 'es' ? 'selected' : ''; ?>>Spanish</option>
                <option value="it" <?php echo ($designConfig['language'] ?? '') === 'it' ? 'selected' : ''; ?>>Italian</option>
                <option value="pt" <?php echo ($designConfig['language'] ?? '') === 'pt' ? 'selected' : ''; ?>>Portuguese</option>
                <option value="ru" <?php echo ($designConfig['language'] ?? '') === 'ru' ? 'selected' : ''; ?>>Russian</option>
                <option value="ar" <?php echo ($designConfig['language'] ?? '') === 'ar' ? 'selected' : ''; ?>>Arabic</option>
                <option value="ja" <?php echo ($designConfig['language'] ?? '') === 'ja' ? 'selected' : ''; ?>>Japanese</option>
                <option value="ko" <?php echo ($designConfig['language'] ?? '') === 'ko' ? 'selected' : ''; ?>>Korean</option>
                <option value="zh" <?php echo ($designConfig['language'] ?? '') === 'zh' ? 'selected' : ''; ?>>Chinese</option>
            </select>
        </div>
        
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select name="config[design][category]" id="pwa-category" class="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2">
                <option value="gambling" <?php echo ($designConfig['category'] ?? 'gambling') === 'gambling' ? 'selected' : ''; ?>>Gambling</option>
                <option value="games" <?php echo ($designConfig['category'] ?? '') === 'games' ? 'selected' : ''; ?>>Games</option>
                <option value="entertainment" <?php echo ($designConfig['category'] ?? '') === 'entertainment' ? 'selected' : ''; ?>>Entertainment</option>
                <option value="social" <?php echo ($designConfig['category'] ?? '') === 'social' ? 'selected' : ''; ?>>Social</option>
                <option value="productivity" <?php echo ($designConfig['category'] ?? '') === 'productivity' ? 'selected' : ''; ?>>Productivity</option>
                <option value="education" <?php echo ($designConfig['category'] ?? '') === 'education' ? 'selected' : ''; ?>>Education</option>
                <option value="business" <?php echo ($designConfig['category'] ?? '') === 'business' ? 'selected' : ''; ?>>Business</option>
                <option value="shopping" <?php echo ($designConfig['category'] ?? '') === 'shopping' ? 'selected' : ''; ?>>Shopping</option>
            </select>
        </div>
    </div>
</div>

