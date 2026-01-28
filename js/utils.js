// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function - ritarda l'esecuzione fino a quando
 * non sono passati 'wait' ms dall'ultima chiamata
 * @param {Function} func - Funzione da eseguire
 * @param {number} wait - Millisecondi di attesa
 * @returns {Function} Funzione con debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - esegue la funzione al massimo una volta
 * ogni 'limit' millisecondi
 * @param {Function} func - Funzione da eseguire
 * @param {number} limit - Millisecondi minimi tra le esecuzioni
 * @returns {Function} Funzione con throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Escape HTML per prevenire XSS
 * @param {string} text - Testo da sanitizzare
 * @returns {string} Testo sanitizzato
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Mostra un toast notification
 * @param {string} message - Messaggio da mostrare
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durata in ms (default 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element not found');
        return;
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Formatta una data in formato locale italiano
 * @param {Date|string} date - Data da formattare
 * @param {object} options - Opzioni di formattazione
 * @returns {string} Data formattata
 */
function formatDate(date, options = {}) {
    const d = new Date(date);
    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    };
    return d.toLocaleDateString('it-IT', defaultOptions);
}

/**
 * Formatta un orario
 * @param {Date|string} date - Data/ora da formattare
 * @returns {string} Orario formattato HH:MM
 */
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatta una durata in secondi come MM:SS
 * @param {number} seconds - Secondi
 * @returns {string} Durata formattata
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera un ID univoco
 * @returns {string} ID univoco
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Clona un oggetto in modo profondo
 * @param {object} obj - Oggetto da clonare
 * @returns {object} Clone dell'oggetto
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica se un valore è vuoto (null, undefined, stringa vuota)
 * @param {*} value - Valore da verificare
 * @returns {boolean} True se vuoto
 */
function isEmpty(value) {
    return value === null || value === undefined || value === '';
}

/**
 * Calcola la media di un array di numeri
 * @param {number[]} numbers - Array di numeri
 * @returns {number} Media
 */
function average(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Trova il valore massimo in un array di numeri
 * @param {number[]} numbers - Array di numeri
 * @returns {number} Valore massimo
 */
function max(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return Math.max(...numbers);
}

/**
 * Trova il valore minimo in un array di numeri
 * @param {number[]} numbers - Array di numeri
 * @returns {number} Valore minimo
 */
function min(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return Math.min(...numbers);
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.Utils = {
        debounce,
        throttle,
        escapeHtml,
        showToast,
        formatDate,
        formatTime,
        formatDuration,
        generateId,
        deepClone,
        isEmpty,
        average,
        max,
        min
    };
}
