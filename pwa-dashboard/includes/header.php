<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? e($pageTitle) . ' - ' : ''; ?>PWA BOT</title>
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <!-- Tailwind CSS CDN - Note: For production, use PostCSS or Tailwind CLI instead -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'pwa-green': '#10b981',
                        'pwa-dark': '#1f2937',
                        'pwa-darker': '#111827'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-900 text-gray-100">
    <div class="flex h-screen overflow-hidden">
        <?php include __DIR__ . '/sidebar.php'; ?>
        
        <div class="flex-1 flex flex-col overflow-hidden">
            <?php include __DIR__ . '/topbar.php'; ?>
            
            <main class="flex-1 overflow-y-auto p-6">

