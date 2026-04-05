/* ============================================
   MAIN.JS - Plaza Rate List 3D Edition
   ============================================ */

let allProducts = [];
let deferredPrompt;

// ============================================
// Load Products from JSON
// ============================================
async function loadProducts() {
    try {
        const response = await fetch('data/items.json');
        const data = await response.json();
        
        allProducts = data.filter(item => item.Status === 'online');
        
        document.getElementById('totalBadge').textContent = `${allProducts.length} Products`;
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productList').innerHTML = `
            <div class="no-results-3d">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading products</p>
            </div>
        `;
    }
}

// ============================================
// Display Products
// ============================================
function displayProducts(products, searchTerm = '') {
    const productList = document.getElementById('productList');
    const resultCount = document.getElementById('resultCount');
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'none';
    
    if (products.length === 0) {
        productList.innerHTML = `
            <div class="no-results-3d">
                <i class="fas fa-search"></i>
                <p>No products found</p>
            </div>
        `;
        resultCount.textContent = '';
        return;
    }
    
    resultCount.textContent = `Showing ${products.length} products`;
    
    productList.innerHTML = products.map((product, index) => {
        let name = product['Item Description'];
        
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            name = name.replace(regex, '<span class="highlight-3d">$1</span>');
        }
        
        return `
            <div class="product-card-3d" style="animation-delay: ${index * 0.03}s">
                <div class="card-shine"></div>
                <div class="product-name-3d">${name}</div>
                <div class="product-price-3d">Rs. ${formatNumber(product.Price)}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// Search Functionality
// ============================================
const searchBox = document.getElementById('searchBox');
let debounceTimer;

searchBox.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 300);
});

function performSearch(query) {
    if (!query.trim()) {
        displayProducts(allProducts);
        return;
    }
    
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);
    
    const filtered = allProducts.filter(product => {
        const desc = product['Item Description'].toLowerCase();
        return searchTerms.every(term => desc.includes(term));
    });
    
    displayProducts(filtered, query.trim());
}

// ============================================
// Utility Functions
// ============================================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Toast Notification
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// Install App
// ============================================
function installApp(platform) {
    if (platform === 'android') {
        showToast('Android: Use "Add to Home Screen" in browser menu');
    } else {
        showToast('iOS: Use Safari Share > Add to Home Screen');
    }
}

// ============================================
// PWA Install Prompt
// ============================================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt) installPrompt.classList.add('show');
    }, 3000);
});

function promptInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                showToast('App installed successfully!');
                triggerConfetti();
            }
            deferredPrompt = null;
            document.getElementById('installPrompt').classList.remove('show');
        });
    }
}

// ============================================
// Confetti Effect
// ============================================
function triggerConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#87CEEB', '#00B4DB', '#FFFFFF', '#FFD700', '#00E676'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-3d ' + (Math.random() > 0.5 ? 'square' : 'circle');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

// ============================================
// Service Worker
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});