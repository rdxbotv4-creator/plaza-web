// ========================================
// PLAZA RATE LIST - PWA Module
// ========================================

let deferredPrompt;
let isAppInstalled = false;

// Initialize PWA features
document.addEventListener('DOMContentLoaded', () => {
    initPWA();
});

function initPWA() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isAppInstalled = true;
        console.log('App is running in standalone mode');
    }

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();

        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show custom install prompt after a delay
        setTimeout(() => {
            showInstallPrompt();
        }, 3000);

        console.log('beforeinstallprompt event fired');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', (e) => {
        console.log('App was installed');
        hideInstallPrompt();

        // Show success toast
        showToast('App installed successfully! 🎉');

        // Clear the deferredPrompt
        deferredPrompt = null;
        isAppInstalled = true;
    });

    // Register service worker
    registerServiceWorker();
}

function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt && !isAppInstalled) {
        installPrompt.classList.add('show');
    }
}

function hideInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.remove('show');
    }
}

function promptInstall() {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

            // Clear the deferredPrompt
            deferredPrompt = null;
            hideInstallPrompt();
        });
    } else {
        // Fallback for browsers that don't support beforeinstallprompt
        showManualInstallInstructions();
    }
}

function showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    let message = '';

    if (isIOS) {
        message = 'For iOS: Tap the Share button in Safari, then tap "Add to Home Screen"';
    } else if (isAndroid) {
        message = 'For Android: Tap the menu (⋮) and select "Add to Home Screen"';
    } else {
        message = 'Use your browser\'s "Install App" or "Add to Home Screen" option';
    }

    showToast(message, 5000);
}

function triggerInstall(platform) {
    if (deferredPrompt) {
        promptInstall();
        return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    if (platform === 'ios' || isIOS) {
        showToast('For iOS: Tap Share → Add to Home Screen', 4000);
    } else if (platform === 'android' || isAndroid) {
        showToast('For Android: Tap menu → Add to Home Screen', 4000);
    } else {
        showToast('Use browser menu to install the app', 3000);
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available
                            showToast('New version available! Refresh to update.', 5000);
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('ServiceWorker registration failed:', error);
            });
    }
}

// Check for network status
function checkOnlineStatus() {
    const isOnline = navigator.onLine;

    if (!isOnline) {
        showToast('You are offline. Some features may not work.', 5000);
    }

    return isOnline;
}

window.addEventListener('online', () => {
    showToast('Back online!', 2000);
});

window.addEventListener('offline', () => {
    showToast('You are offline.', 3000);
});

// Initialize network check
checkOnlineStatus();
window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);

// Export functions
window.triggerInstall = triggerInstall;
window.promptInstall = promptInstall;
