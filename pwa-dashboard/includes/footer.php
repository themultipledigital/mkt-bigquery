            </main>
        </div>
    </div>
    <script src="assets/js/dashboard.js"></script>
    <script>
    // Functions should already be assigned in dashboard.js
    // Double-check critical functions are available after script loads
    (function() {
        // Wait a tiny bit to ensure IIFE at end of dashboard.js has executed
        setTimeout(function() {
            // Re-assign if somehow not assigned (safety net)
            if (typeof savePWA === 'function' && typeof window.savePWA !== 'function') {
                window.savePWA = savePWA;
            }
            if (typeof generatePWA === 'function' && typeof window.generatePWA !== 'function') {
                window.generatePWA = generatePWA;
            }
            if (typeof loadTemplateDefaults === 'function' && typeof window.loadTemplateDefaults !== 'function') {
                window.loadTemplateDefaults = loadTemplateDefaults;
            }
            if (typeof selectTemplate === 'function' && typeof window.selectTemplate !== 'function') {
                window.selectTemplate = selectTemplate;
            }
            
            console.log('[footer.php] Functions available on window after dashboard.js loads:', {
                loadTemplateDefaults: typeof window.loadTemplateDefaults === 'function' ? 'OK' : 'MISSING',
                selectTemplate: typeof window.selectTemplate === 'function' ? 'OK' : 'MISSING',
                generatePWA: typeof window.generatePWA === 'function' ? 'OK' : 'MISSING',
                savePWA: typeof window.savePWA === 'function' ? 'OK' : 'MISSING'
            });
        }, 10);
    })();
    </script>
</body>
</html>

