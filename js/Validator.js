// ============================================
// VALIDATOR - Validazione e Sicurezza Dati
// ============================================

/**
 * Schema di validazione per i dati dell'app
 */
const ValidationSchemas = {
    // Schema per una sessione di allenamento
    session: {
        required: ['id', 'dataInizio', 'lanci'],
        types: {
            id: 'number',
            dataInizio: 'string',
            dataFine: 'string',
            luogo: 'string',
            completata: 'boolean',
            lanci: 'array'
        },
        defaults: {
            completata: false,
            lanci: []
        }
    },

    // Schema per un singolo lancio
    cast: {
        required: ['distanza'],
        types: {
            distanza: 'number',
            data: 'string',
            tecnica: 'string',
            note: 'string',
            gpsData: 'object'
        },
        ranges: {
            distanza: { min: 0, max: 500 }
        }
    },

    // Schema per il profilo utente
    profile: {
        required: [],
        types: {
            nome: 'string',
            cognome: 'string',
            eta: 'number',
            sesso: 'string',
            altezza: 'number',
            peso: 'number',
            livelloEsperienza: 'string',
            obiettivo: 'number',
            campoAllenamento: 'string'
        },
        ranges: {
            eta: { min: 5, max: 120 },
            altezza: { min: 50, max: 300 },
            peso: { min: 20, max: 500 },
            obiettivo: { min: 0, max: 500 }
        }
    }
};

/**
 * Classe Validator per validazione e sicurezza dati
 */
class Validator {
    /**
     * Valida un valore contro un tipo atteso
     * @param {*} value - Valore da validare
     * @param {string} expectedType - Tipo atteso
     * @returns {boolean}
     */
    static validateType(value, expectedType) {
        if (value === null || value === undefined) {
            return true; // I valori null/undefined sono gestiti da required
        }

        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && !Array.isArray(value);
            default:
                return true;
        }
    }

    /**
     * Valida un valore contro un range
     * @param {number} value - Valore da validare
     * @param {object} range - Oggetto { min, max }
     * @returns {boolean}
     */
    static validateRange(value, range) {
        if (typeof value !== 'number') return true;
        if (range.min !== undefined && value < range.min) return false;
        if (range.max !== undefined && value > range.max) return false;
        return true;
    }

    /**
     * Valida un oggetto contro uno schema
     * @param {object} data - Dati da validare
     * @param {string} schemaName - Nome dello schema (session, cast, profile)
     * @returns {object} { valid: boolean, errors: string[], warnings: string[] }
     */
    static validate(data, schemaName) {
        const schema = ValidationSchemas[schemaName];
        if (!schema) {
            return { valid: false, errors: [`Schema '${schemaName}' non trovato`], warnings: [] };
        }

        const errors = [];
        const warnings = [];

        // Verifica che sia un oggetto
        if (!data || typeof data !== 'object') {
            return { valid: false, errors: ['I dati devono essere un oggetto'], warnings: [] };
        }

        // Verifica campi required
        if (schema.required) {
            schema.required.forEach(field => {
                if (data[field] === undefined || data[field] === null) {
                    errors.push(`Campo obbligatorio mancante: ${field}`);
                }
            });
        }

        // Verifica tipi
        if (schema.types) {
            Object.entries(schema.types).forEach(([field, expectedType]) => {
                if (data[field] !== undefined && !Validator.validateType(data[field], expectedType)) {
                    errors.push(`Campo '${field}': tipo non valido (atteso ${expectedType})`);
                }
            });
        }

        // Verifica range
        if (schema.ranges) {
            Object.entries(schema.ranges).forEach(([field, range]) => {
                if (data[field] !== undefined && !Validator.validateRange(data[field], range)) {
                    warnings.push(`Campo '${field}': valore fuori range (${range.min}-${range.max})`);
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
     * Valida una sessione completa inclusi i lanci
     * @param {object} session - Sessione da validare
     * @returns {object} Risultato validazione
     */
    static validateSession(session) {
        const result = Validator.validate(session, 'session');

        // Valida anche ogni lancio
        if (session.lanci && Array.isArray(session.lanci)) {
            session.lanci.forEach((lancio, index) => {
                const castResult = Validator.validate(lancio, 'cast');
                if (!castResult.valid) {
                    result.errors.push(`Lancio ${index + 1}: ${castResult.errors.join(', ')}`);
                }
                result.warnings.push(...castResult.warnings.map(w => `Lancio ${index + 1}: ${w}`));
            });
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * Valida dati di import completi
     * @param {object} importData - Dati importati
     * @returns {object} Risultato validazione con statistiche
     */
    static validateImport(importData) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            stats: {
                sessions: 0,
                casts: 0,
                validSessions: 0,
                invalidSessions: 0
            }
        };

        // Verifica struttura base
        if (!importData || typeof importData !== 'object') {
            result.valid = false;
            result.errors.push('Formato dati non valido');
            return result;
        }

        // Verifica versione
        if (importData.version) {
            const supportedVersions = ['1.0', '2.0'];
            if (!supportedVersions.includes(importData.version)) {
                result.warnings.push(`Versione dati non riconosciuta: ${importData.version}`);
            }
        }

        // Valida sessioni
        if (importData.sessions && Array.isArray(importData.sessions)) {
            result.stats.sessions = importData.sessions.length;

            importData.sessions.forEach((session, index) => {
                const sessionResult = Validator.validateSession(session);

                if (session.lanci) {
                    result.stats.casts += session.lanci.length;
                }

                if (sessionResult.valid) {
                    result.stats.validSessions++;
                } else {
                    result.stats.invalidSessions++;
                    result.warnings.push(`Sessione ${index + 1}: ${sessionResult.errors.join(', ')}`);
                }
            });
        } else if (importData.casts && Array.isArray(importData.casts)) {
            // Formato vecchio (solo lanci)
            result.warnings.push('Formato dati vecchio (v1.0), verrà convertito');
            result.stats.casts = importData.casts.length;
        } else {
            result.errors.push('Nessuna sessione o lancio trovato nei dati');
            result.valid = false;
        }

        // Valida profilo se presente
        if (importData.profile) {
            const profileResult = Validator.validate(importData.profile, 'profile');
            if (!profileResult.valid) {
                result.warnings.push(`Profilo: ${profileResult.errors.join(', ')}`);
            }
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * Sanitizza una stringa per prevenire XSS
     * @param {string} str - Stringa da sanitizzare
     * @returns {string} Stringa sanitizzata
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return str;

        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Sanitizza un oggetto ricorsivamente
     * @param {object} obj - Oggetto da sanitizzare
     * @returns {object} Oggetto sanitizzato
     */
    static sanitizeObject(obj) {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'string') return Validator.sanitizeString(obj);
        if (typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => Validator.sanitizeObject(item));
        }

        const sanitized = {};
        for (const key of Object.keys(obj)) {
            sanitized[key] = Validator.sanitizeObject(obj[key]);
        }
        return sanitized;
    }

    /**
     * Valida un numero e lo converte se necessario
     * @param {*} value - Valore da validare
     * @param {number} defaultValue - Valore di default
     * @param {number} min - Valore minimo
     * @param {number} max - Valore massimo
     * @returns {number}
     */
    static parseNumber(value, defaultValue = 0, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);
        if (isNaN(num)) return defaultValue;
        return Math.max(min, Math.min(max, num));
    }
}

/**
 * Classe BackupManager per gestione backup automatici
 */
class BackupManager {
    static BACKUP_KEY = 'longcast_auto_backup';
    static MAX_BACKUPS = 3;

    /**
     * Crea un backup automatico dei dati
     * @param {object} data - Dati da backuppare
     * @param {string} reason - Motivo del backup
     * @returns {boolean} Successo
     */
    static createBackup(data, reason = 'auto') {
        try {
            const backups = BackupManager.getBackups();

            const newBackup = {
                id: Date.now(),
                date: new Date().toISOString(),
                reason: reason,
                data: JSON.parse(JSON.stringify(data))
            };

            backups.unshift(newBackup);

            // Mantieni solo gli ultimi N backup
            while (backups.length > BackupManager.MAX_BACKUPS) {
                backups.pop();
            }

            localStorage.setItem(BackupManager.BACKUP_KEY, JSON.stringify(backups));
            console.log(`✅ Backup creato: ${reason}`);
            return true;
        } catch (error) {
            console.error('❌ Errore creazione backup:', error);
            return false;
        }
    }

    /**
     * Ottiene la lista dei backup disponibili
     * @returns {array} Lista dei backup
     */
    static getBackups() {
        try {
            const stored = localStorage.getItem(BackupManager.BACKUP_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Errore lettura backup:', error);
            return [];
        }
    }

    /**
     * Ripristina un backup specifico
     * @param {number} backupId - ID del backup da ripristinare
     * @returns {object|null} Dati del backup o null
     */
    static restoreBackup(backupId) {
        const backups = BackupManager.getBackups();
        const backup = backups.find(b => b.id === backupId);
        return backup ? backup.data : null;
    }

    /**
     * Ottiene l'ultimo backup disponibile
     * @returns {object|null} Ultimo backup o null
     */
    static getLastBackup() {
        const backups = BackupManager.getBackups();
        return backups.length > 0 ? backups[0] : null;
    }

    /**
     * Elimina tutti i backup
     */
    static clearBackups() {
        localStorage.removeItem(BackupManager.BACKUP_KEY);
    }

    /**
     * Calcola la dimensione dei backup in bytes
     * @returns {number} Dimensione in bytes
     */
    static getBackupSize() {
        const stored = localStorage.getItem(BackupManager.BACKUP_KEY);
        return stored ? stored.length * 2 : 0; // UTF-16
    }
}

/**
 * Classe ErrorHandler per gestione errori centralizzata
 */
class ErrorHandler {
    static errors = [];
    static MAX_ERRORS = 50;

    /**
     * Registra un errore
     * @param {Error|string} error - Errore da registrare
     * @param {string} context - Contesto dell'errore
     * @param {string} severity - Severità: 'error', 'warning', 'info'
     */
    static log(error, context = 'unknown', severity = 'error') {
        const errorEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            context: context,
            severity: severity
        };

        ErrorHandler.errors.unshift(errorEntry);

        // Mantieni solo gli ultimi N errori
        while (ErrorHandler.errors.length > ErrorHandler.MAX_ERRORS) {
            ErrorHandler.errors.pop();
        }

        // Log in console con colori appropriati
        const logMethod = severity === 'error' ? 'error' :
                         severity === 'warning' ? 'warn' : 'log';
        console[logMethod](`[${context}]`, error);

        return errorEntry;
    }

    /**
     * Ottiene tutti gli errori registrati
     * @returns {array} Lista errori
     */
    static getErrors() {
        return [...ErrorHandler.errors];
    }

    /**
     * Pulisce la lista errori
     */
    static clear() {
        ErrorHandler.errors = [];
    }

    /**
     * Wrapper per try-catch con logging automatico
     * @param {Function} fn - Funzione da eseguire
     * @param {string} context - Contesto
     * @param {*} fallback - Valore di fallback in caso di errore
     * @returns {*} Risultato della funzione o fallback
     */
    static tryCatch(fn, context = 'unknown', fallback = null) {
        try {
            return fn();
        } catch (error) {
            ErrorHandler.log(error, context);
            return fallback;
        }
    }

    /**
     * Wrapper async per try-catch con logging automatico
     * @param {Function} fn - Funzione async da eseguire
     * @param {string} context - Contesto
     * @param {*} fallback - Valore di fallback in caso di errore
     * @returns {Promise<*>} Risultato della funzione o fallback
     */
    static async tryCatchAsync(fn, context = 'unknown', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            ErrorHandler.log(error, context);
            return fallback;
        }
    }
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.Validator = Validator;
    window.ValidationSchemas = ValidationSchemas;
    window.BackupManager = BackupManager;
    window.ErrorHandler = ErrorHandler;
}
