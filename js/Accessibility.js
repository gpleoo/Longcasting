// ============================================
// ACCESSIBILITY (a11y) MODULE
// ============================================

/**
 * Classe per gestione accessibilità
 */
class Accessibility {
    constructor() {
        this.focusTrap = null;
        this.lastFocusedElement = null;
    }

    /**
     * Inizializza le funzionalità di accessibilità
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupReducedMotion();
        this.setupScreenReaderAnnouncements();
        this.addAriaLabels();
    }

    /**
     * Setup navigazione da tastiera
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC chiude modali
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show, .modal[style*="display: block"]');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }

            // Tab trap nei modali
            if (e.key === 'Tab' && this.focusTrap) {
                this.handleTabKey(e);
            }
        });

        // Gestione click su elementi con role="button"
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    /**
     * Setup gestione focus
     */
    setupFocusManagement() {
        // Mostra outline solo per navigazione da tastiera
        document.body.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });

        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
    }

    /**
     * Rispetta preferenze reduced motion
     */
    setupReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleReducedMotion = (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduced-motion');
            } else {
                document.documentElement.classList.remove('reduced-motion');
            }
        };

        handleReducedMotion(mediaQuery);
        mediaQuery.addEventListener('change', handleReducedMotion);
    }

    /**
     * Setup annunci per screen reader
     */
    setupScreenReaderAnnouncements() {
        // Crea elemento per annunci live
        if (!document.getElementById('sr-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
    }

    /**
     * Annuncia messaggio per screen reader
     * @param {string} message - Messaggio da annunciare
     * @param {string} priority - 'polite' o 'assertive'
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = '';
            // Piccolo delay per trigger dell'annuncio
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }

    /**
     * Aggiunge ARIA labels mancanti
     */
    addAriaLabels() {
        // Bottoni senza testo
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim() && !btn.querySelector('span, .btn-text')) {
                const icon = btn.querySelector('svg, i, .icon');
                if (icon) {
                    btn.setAttribute('aria-label', 'Azione');
                }
            }
        });

        // Link esterni
        document.querySelectorAll('a[target="_blank"]:not([aria-label])').forEach(link => {
            const currentLabel = link.getAttribute('aria-label') || link.textContent;
            link.setAttribute('aria-label', `${currentLabel} (apre in nuova finestra)`);
        });

        // Form inputs senza label
        document.querySelectorAll('input:not([aria-label]):not([id])').forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                input.setAttribute('aria-label', placeholder);
            }
        });

        // Navigazione
        const nav = document.querySelector('nav, .nav, .bottom-nav');
        if (nav && !nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Navigazione principale');
        }

        // Main content
        const main = document.querySelector('main, .main-container');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
    }

    /**
     * Apre un modal con focus management
     * @param {HTMLElement} modal - Elemento modal
     */
    openModal(modal) {
        this.lastFocusedElement = document.activeElement;
        this.focusTrap = modal;

        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        // Focus sul primo elemento focusabile
        const focusable = this.getFocusableElements(modal);
        if (focusable.length > 0) {
            focusable[0].focus();
        }

        this.announce('Finestra di dialogo aperta');
    }

    /**
     * Chiude un modal e ripristina focus
     * @param {HTMLElement} modal - Elemento modal
     */
    closeModal(modal) {
        this.focusTrap = null;

        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }

        this.announce('Finestra di dialogo chiusa');
    }

    /**
     * Gestisce Tab key per focus trap
     * @param {KeyboardEvent} e - Evento tastiera
     */
    handleTabKey(e) {
        const focusable = this.getFocusableElements(this.focusTrap);
        if (focusable.length === 0) return;

        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    /**
     * Ottiene elementi focusabili in un container
     * @param {HTMLElement} container - Container
     * @returns {HTMLElement[]} Elementi focusabili
     */
    getFocusableElements(container) {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        return Array.from(container.querySelectorAll(selector))
            .filter(el => el.offsetParent !== null);
    }

    /**
     * Skip link per saltare al contenuto principale
     */
    createSkipLink() {
        if (document.getElementById('skip-link')) return;

        const skipLink = document.createElement('a');
        skipLink.id = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Vai al contenuto principale';

        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const main = document.querySelector('#main-content, main, .main-container');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Verifica contrasto colori (semplificato)
     * @param {string} foreground - Colore testo (hex)
     * @param {string} background - Colore sfondo (hex)
     * @returns {object} { ratio, passes }
     */
    checkContrast(foreground, background) {
        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = ((rgb >> 16) & 0xff) / 255;
            const g = ((rgb >> 8) & 0xff) / 255;
            const b = (rgb & 0xff) / 255;

            const [R, G, B] = [r, g, b].map(c =>
                c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
            );

            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
        };

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
            ratio: ratio.toFixed(2),
            passesAA: ratio >= 4.5,
            passesAAA: ratio >= 7
        };
    }
}

// Istanza globale
const a11y = new Accessibility();

// Inizializza dopo il caricamento DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => a11y.init());
} else {
    a11y.init();
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.Accessibility = Accessibility;
    window.a11y = a11y;
}
