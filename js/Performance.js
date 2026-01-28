// ============================================
// PERFORMANCE UTILITIES
// ============================================

/**
 * Classe per ottimizzazioni performance
 */
class Performance {
    /**
     * Lazy load di un'immagine
     * @param {HTMLImageElement} img - Elemento immagine
     */
    static lazyLoadImage(img) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                            image.removeAttribute('data-src');
                        }
                        obs.unobserve(image);
                    }
                });
            });
            observer.observe(img);
        } else {
            // Fallback per browser vecchi
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        }
    }

    /**
     * Setup lazy loading per tutte le immagini con data-src
     */
    static setupLazyLoading() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            Performance.lazyLoadImage(img);
        });
    }

    /**
     * Preload di risorse critiche
     * @param {string[]} urls - Array di URL da preloadare
     * @param {string} as - Tipo di risorsa (script, style, image, font)
     */
    static preload(urls, as = 'script') {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = as;
            document.head.appendChild(link);
        });
    }

    /**
     * Prefetch di risorse per navigazione futura
     * @param {string[]} urls - Array di URL da prefetchare
     */
    static prefetch(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Misura il tempo di esecuzione di una funzione
     * @param {string} label - Etichetta per il log
     * @param {Function} fn - Funzione da misurare
     * @returns {*} Risultato della funzione
     */
    static measure(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Misura async il tempo di esecuzione
     * @param {string} label - Etichetta per il log
     * @param {Function} fn - Funzione async da misurare
     * @returns {Promise<*>} Risultato della funzione
     */
    static async measureAsync(label, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Ottiene metriche di performance della pagina
     * @returns {object} Metriche
     */
    static getMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const metrics = {
            // Tempo totale di caricamento
            loadTime: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
            // DOM Content Loaded
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.startTime : 0,
            // First Paint
            firstPaint: 0,
            // First Contentful Paint
            firstContentfulPaint: 0,
            // Memoria usata (se disponibile)
            memoryUsed: 0
        };

        paint.forEach(entry => {
            if (entry.name === 'first-paint') {
                metrics.firstPaint = entry.startTime;
            }
            if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = entry.startTime;
            }
        });

        // Memoria (solo Chrome)
        if (performance.memory) {
            metrics.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }

        return metrics;
    }

    /**
     * Log delle metriche di performance
     */
    static logMetrics() {
        const metrics = Performance.getMetrics();
        console.group('📊 Performance Metrics');
        console.log(`Load Time: ${metrics.loadTime.toFixed(0)}ms`);
        console.log(`DOM Ready: ${metrics.domContentLoaded.toFixed(0)}ms`);
        console.log(`First Paint: ${metrics.firstPaint.toFixed(0)}ms`);
        console.log(`First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms`);
        if (metrics.memoryUsed > 0) {
            console.log(`Memory Used: ${metrics.memoryUsed}MB`);
        }
        console.groupEnd();
    }

    /**
     * Request Idle Callback polyfill
     * @param {Function} callback - Funzione da eseguire
     * @param {object} options - Opzioni
     */
    static requestIdleCallback(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, options);
        } else {
            // Fallback con setTimeout
            setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining: () => 50
                });
            }, options.timeout || 1);
        }
    }

    /**
     * Esegue task in background durante idle time
     * @param {Function[]} tasks - Array di funzioni da eseguire
     */
    static runIdleTasks(tasks) {
        const taskQueue = [...tasks];

        const runTask = (deadline) => {
            while (taskQueue.length > 0 && deadline.timeRemaining() > 0) {
                const task = taskQueue.shift();
                task();
            }

            if (taskQueue.length > 0) {
                Performance.requestIdleCallback(runTask);
            }
        };

        Performance.requestIdleCallback(runTask);
    }

    /**
     * Virtual scrolling helper - restituisce elementi visibili
     * @param {array} items - Tutti gli elementi
     * @param {number} scrollTop - Posizione scroll
     * @param {number} containerHeight - Altezza container
     * @param {number} itemHeight - Altezza singolo elemento
     * @param {number} buffer - Elementi extra da renderizzare
     * @returns {object} { startIndex, endIndex, visibleItems, offsetY }
     */
    static getVisibleItems(items, scrollTop, containerHeight, itemHeight, buffer = 3) {
        const totalItems = items.length;
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2;
        const endIndex = Math.min(totalItems, startIndex + visibleCount);

        return {
            startIndex,
            endIndex,
            visibleItems: items.slice(startIndex, endIndex),
            offsetY: startIndex * itemHeight,
            totalHeight: totalItems * itemHeight
        };
    }
}

/**
 * Classe per caching in memoria
 */
class MemoryCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * Ottiene un valore dalla cache
     * @param {string} key - Chiave
     * @returns {*} Valore o undefined
     */
    get(key) {
        if (this.cache.has(key)) {
            // Move to end (LRU)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }

    /**
     * Imposta un valore nella cache
     * @param {string} key - Chiave
     * @param {*} value - Valore
     */
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Rimuovi il più vecchio (primo)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    /**
     * Verifica se una chiave esiste
     * @param {string} key - Chiave
     * @returns {boolean}
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Rimuove una chiave
     * @param {string} key - Chiave
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Pulisce tutta la cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Dimensione attuale della cache
     * @returns {number}
     */
    get size() {
        return this.cache.size;
    }
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.Performance = Performance;
    window.MemoryCache = MemoryCache;

    // Log metrics dopo il caricamento
    window.addEventListener('load', () => {
        setTimeout(() => Performance.logMetrics(), 100);
    });
}
