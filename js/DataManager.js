// ============================================
// DATA MANAGER - Storage e Validazione
// ============================================

/**
 * Costanti per le chiavi di localStorage/sessionStorage
 */
const STORAGE_KEYS = {
    SESSIONS: 'longcast_sessions',
    PROFILE: 'longcast_profile',
    SETTINGS: 'longcast_settings',
    SUGGESTIONS: 'longcast_suggestions',
    ACTIVE_SESSION: 'longcast_active_session'
};

/**
 * Versione corrente del formato dati
 */
const DATA_VERSION = '2.0';

/**
 * Schema di validazione per una sessione
 */
const SESSION_SCHEMA = {
    required: ['id', 'dataInizio', 'lanci'],
    optional: ['dataFine', 'luogo', 'completata', 'tecnica', 'pesoPiombo',
               'cannaModello', 'cannaLunghezza', 'cannaGrammatura',
               'mulinello', 'filo', 'vento', 'direzioneVento',
               'temperatura', 'umidita', 'note']
};

/**
 * Schema di validazione per un lancio
 */
const CAST_SCHEMA = {
    required: ['distanza'],
    optional: ['data', 'tecnica', 'note', 'gpsData', 'qualitaGPS']
};

/**
 * Classe per la gestione centralizzata dei dati
 */
class DataManager {
    /**
     * Verifica se localStorage è disponibile
     * @returns {boolean}
     */
    static isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Carica dati da localStorage
     * @param {string} key - Chiave storage
     * @returns {*} Dati parsati o null
     */
    static load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Errore caricamento ${key}:`, error);
            return null;
        }
    }

    /**
     * Salva dati in localStorage
     * @param {string} key - Chiave storage
     * @param {*} data - Dati da salvare
     * @returns {boolean} Successo
     */
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Errore salvataggio ${key}:`, error);
            return false;
        }
    }

    /**
     * Rimuove dati da localStorage
     * @param {string} key - Chiave storage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Errore rimozione ${key}:`, error);
        }
    }

    /**
     * Valida una sessione
     * @param {object} session - Sessione da validare
     * @returns {object} { valid: boolean, errors: string[] }
     */
    static validateSession(session) {
        const errors = [];

        if (!session || typeof session !== 'object') {
            return { valid: false, errors: ['Sessione non valida'] };
        }

        // Verifica campi required
        SESSION_SCHEMA.required.forEach(field => {
            if (session[field] === undefined || session[field] === null) {
                errors.push(`Campo obbligatorio mancante: ${field}`);
            }
        });

        // Verifica che lanci sia un array
        if (session.lanci && !Array.isArray(session.lanci)) {
            errors.push('Il campo lanci deve essere un array');
        }

        // Verifica distanze nei lanci
        if (session.lanci && Array.isArray(session.lanci)) {
            session.lanci.forEach((lancio, index) => {
                if (typeof lancio.distanza !== 'number' || lancio.distanza < 0) {
                    errors.push(`Lancio ${index + 1}: distanza non valida`);
                }
            });
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Valida un file di import
     * @param {object} data - Dati importati
     * @returns {object} { valid: boolean, errors: string[], warnings: string[] }
     */
    static validateImport(data) {
        const errors = [];
        const warnings = [];

        if (!data || typeof data !== 'object') {
            return { valid: false, errors: ['Dati non validi'], warnings: [] };
        }

        // Verifica presenza sessioni o casts (formato vecchio)
        if (!data.sessions && !data.casts) {
            errors.push('Nessuna sessione trovata nel file');
        }

        // Verifica versione
        if (data.version && data.version !== DATA_VERSION) {
            warnings.push(`Versione dati: ${data.version} (attuale: ${DATA_VERSION})`);
        }

        // Valida ogni sessione
        if (data.sessions && Array.isArray(data.sessions)) {
            data.sessions.forEach((session, index) => {
                const result = DataManager.validateSession(session);
                if (!result.valid) {
                    warnings.push(`Sessione ${index + 1}: ${result.errors.join(', ')}`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Crea un backup dei dati attuali
     * @returns {object} Backup completo
     */
    static createBackup() {
        return {
            sessions: DataManager.load(STORAGE_KEYS.SESSIONS) || [],
            profile: DataManager.load(STORAGE_KEYS.PROFILE),
            suggestions: DataManager.load(STORAGE_KEYS.SUGGESTIONS),
            settings: DataManager.load(STORAGE_KEYS.SETTINGS),
            backupDate: new Date().toISOString(),
            version: DATA_VERSION
        };
    }

    /**
     * Calcola la dimensione usata in localStorage
     * @returns {object} { used: number, available: number, percentage: number }
     */
    static getStorageInfo() {
        let used = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
            }
        }

        // localStorage ha un limite tipico di 5MB
        const limit = 5 * 1024 * 1024;

        return {
            used: used,
            usedMB: (used / (1024 * 1024)).toFixed(2),
            limit: limit,
            limitMB: (limit / (1024 * 1024)).toFixed(0),
            percentage: ((used / limit) * 100).toFixed(1)
        };
    }
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.DATA_VERSION = DATA_VERSION;
}
