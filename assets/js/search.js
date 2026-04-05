// ========================================
// PLAZA RATE LIST - Search Module
// ========================================

// Search functionality is integrated into index.html
// This file contains helper functions

/**
 * Perform real-time search on products
 * @param {Array} products - Array of product objects
 * @param {string} query - Search query
 * @returns {Array} - Filtered products
 */
function searchProducts(products, query) {
    if (!query.trim()) {
        return products;
    }

    const terms = query.toLowerCase()
        .split(' ')
        .filter(t => t.length > 0);

    return products.filter(product => {
        const desc = product.description.toLowerCase();
        return terms.every(term => desc.includes(term));
    });
}

/**
 * Highlight search terms in text
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} - Text with highlighted terms
 */
function highlightSearchTerms(text, query) {
    if (!query.trim()) {
        return escapeHtml(text);
    }

    const terms = query.toLowerCase()
        .split(' ')
        .filter(t => t.length > 0);

    let result = escapeHtml(text);

    terms.forEach(term => {
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    return result;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        searchProducts,
        highlightSearchTerms,
        formatNumber,
        escapeHtml
    };
}
