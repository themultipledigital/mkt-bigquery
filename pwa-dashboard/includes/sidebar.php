<aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
    <div class="p-6 border-b border-gray-700">
        <h1 class="text-xl font-bold text-white">PWA BOT</h1>
    </div>
    
    <nav class="flex-1 p-4 space-y-2">
        <div class="mb-6">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">OVERVIEW</p>
            <a href="index.php" class="flex items-center space-x-3 px-4 py-2 rounded-lg <?php echo (basename($_SERVER['PHP_SELF']) == 'index.php') ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'; ?>">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <span>My PWAs</span>
            </a>
            <a href="#" class="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">
                <span>Analytics</span>
                <span class="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded">New</span>
            </a>
            <a href="#" class="flex items-center justify-between px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">
                <span>Push Notifications</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </a>
        </div>
        
        <div class="mb-6">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">IOS</p>
            <a href="#" class="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">Apps</a>
            <a href="#" class="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">AppLinks</a>
            <a href="#" class="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">Geo Rent</a>
        </div>
        
        <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">FINANCE</p>
            <a href="#" class="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">Invoices</a>
            <a href="#" class="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">Transactions</a>
        </div>
    </nav>
</aside>

