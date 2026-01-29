// ============================================
// REEL CALCULATOR - Calcolatore Distanza Mare
// ============================================

/**
 * Classe ReelCalculator per calcolo distanza basato su giri mulinello
 * con correzioni per elasticità filo e condizioni vento
 *
 * Formula calibrata su dati reali:
 * - 220 giri = 150m con piombo 125g e vento calmo
 * - Elasticità base nylon: 10% a 125g
 */
class ReelCalculator {
    constructor() {
        // Coefficienti elasticità per peso piombo (calibrati su nylon)
        // ε = elasticità percentuale, Kₑ = 1/(1+ε)
        this.elasticityCoefficients = {
            50: { epsilon: 0.07, Ke: 0.935 },
            75: { epsilon: 0.08, Ke: 0.926 },
            100: { epsilon: 0.09, Ke: 0.917 },
            125: { epsilon: 0.10, Ke: 0.909 },  // Riferimento
            150: { epsilon: 0.11, Ke: 0.901 },
            175: { epsilon: 0.12, Ke: 0.893 },
            200: { epsilon: 0.13, Ke: 0.885 }
        };

        // Coefficienti vento (pancia del filo)
        this.windCoefficients = {
            'calmo': 1.00,
            'leggero': 0.97,
            'moderato': 0.93,
            'forte': 0.88
        };

        // Mappatura stringhe vento a categorie
        this.windMapping = {
            // Calmo
            'calmo': 'calmo',
            'assente': 'calmo',
            'nessuno': 'calmo',
            '0': 'calmo',
            // Leggero
            'leggero': 'leggero',
            'brezza': 'leggero',
            'debole': 'leggero',
            'lieve': 'leggero',
            // Moderato
            'moderato': 'moderato',
            'medio': 'moderato',
            'sostenuto': 'moderato',
            // Forte
            'forte': 'forte',
            'molto forte': 'forte',
            'intenso': 'forte',
            'violento': 'forte'
        };
    }

    /**
     * Calcola la distanza effettiva dal numero di giri
     * @param {number} giri - Numero di giri del mulinello
     * @param {number} metriPerGiro - Metri per giro del mulinello
     * @param {number|string} pesoPiombo - Peso del piombo in grammi
     * @param {string} vento - Condizioni vento
     * @returns {Object} Risultato con distanza e dettagli calcolo
     */
    calculateDistance(giri, metriPerGiro, pesoPiombo, vento = 'calmo') {
        // Parse peso piombo (rimuovi 'g' se presente)
        const peso = this.parsePesoPiombo(pesoPiombo);

        // Ottieni coefficienti
        const Ke = this.getElasticityCoefficient(peso);
        const Kv = this.getWindCoefficient(vento);

        // Calcolo distanza semplice (senza correzioni)
        const distanzaSemplice = giri * metriPerGiro;

        // Calcolo distanza con correzioni
        const distanzaEffettiva = distanzaSemplice * Ke * Kv;

        return {
            distanzaEffettiva: Math.round(distanzaEffettiva * 10) / 10,
            distanzaSemplice: Math.round(distanzaSemplice * 10) / 10,
            giri: giri,
            metriPerGiro: metriPerGiro,
            pesoPiombo: peso,
            vento: vento,
            coefficienti: {
                Ke: Ke,
                Kv: Kv,
                totale: Math.round(Ke * Kv * 1000) / 1000
            },
            correzione: {
                metri: Math.round((distanzaSemplice - distanzaEffettiva) * 10) / 10,
                percentuale: Math.round((1 - Ke * Kv) * 100 * 10) / 10
            }
        };
    }

    /**
     * Calcola i giri necessari per una distanza target
     * @param {number} distanzaTarget - Distanza desiderata in metri
     * @param {number} metriPerGiro - Metri per giro del mulinello
     * @param {number|string} pesoPiombo - Peso del piombo in grammi
     * @param {string} vento - Condizioni vento
     * @returns {Object} Risultato con giri stimati
     */
    calculateTurns(distanzaTarget, metriPerGiro, pesoPiombo, vento = 'calmo') {
        const peso = this.parsePesoPiombo(pesoPiombo);
        const Ke = this.getElasticityCoefficient(peso);
        const Kv = this.getWindCoefficient(vento);

        // Giri = Distanza / (MetriPerGiro × Ke × Kv)
        const giriNecessari = distanzaTarget / (metriPerGiro * Ke * Kv);

        return {
            giriNecessari: Math.round(giriNecessari),
            distanzaTarget: distanzaTarget,
            metriPerGiro: metriPerGiro,
            pesoPiombo: peso,
            vento: vento
        };
    }

    /**
     * Parse peso piombo da stringa o numero
     */
    parsePesoPiombo(peso) {
        if (typeof peso === 'number') return peso;
        if (typeof peso === 'string') {
            // Estrai numero dalla stringa (es. "150g", "Ogiva 125g", "175")
            const match = peso.match(/(\d+)/);
            return match ? parseInt(match[1]) : 125; // Default 125g
        }
        return 125;
    }

    /**
     * Ottieni coefficiente elasticità per peso piombo
     */
    getElasticityCoefficient(peso) {
        // Se peso esatto nel database
        if (this.elasticityCoefficients[peso]) {
            return this.elasticityCoefficients[peso].Ke;
        }

        // Interpolazione lineare per pesi intermedi
        const pesi = Object.keys(this.elasticityCoefficients).map(Number).sort((a, b) => a - b);

        // Sotto il minimo
        if (peso <= pesi[0]) {
            return this.elasticityCoefficients[pesi[0]].Ke;
        }

        // Sopra il massimo
        if (peso >= pesi[pesi.length - 1]) {
            return this.elasticityCoefficients[pesi[pesi.length - 1]].Ke;
        }

        // Trova intervallo per interpolazione
        for (let i = 0; i < pesi.length - 1; i++) {
            if (peso >= pesi[i] && peso <= pesi[i + 1]) {
                const p1 = pesi[i];
                const p2 = pesi[i + 1];
                const Ke1 = this.elasticityCoefficients[p1].Ke;
                const Ke2 = this.elasticityCoefficients[p2].Ke;

                // Interpolazione lineare
                const t = (peso - p1) / (p2 - p1);
                return Ke1 + t * (Ke2 - Ke1);
            }
        }

        return 0.909; // Default (125g)
    }

    /**
     * Ottieni coefficiente vento
     */
    getWindCoefficient(vento) {
        if (!vento) return 1.00;

        const ventoLower = vento.toLowerCase().trim();

        // Cerca corrispondenza esatta
        if (this.windCoefficients[ventoLower]) {
            return this.windCoefficients[ventoLower];
        }

        // Cerca nella mappatura
        for (const [key, category] of Object.entries(this.windMapping)) {
            if (ventoLower.includes(key)) {
                return this.windCoefficients[category];
            }
        }

        // Prova a estrarre velocità km/h
        const kmhMatch = vento.match(/(\d+)\s*km/i);
        if (kmhMatch) {
            const kmh = parseInt(kmhMatch[1]);
            if (kmh <= 5) return this.windCoefficients['calmo'];
            if (kmh <= 15) return this.windCoefficients['leggero'];
            if (kmh <= 30) return this.windCoefficients['moderato'];
            return this.windCoefficients['forte'];
        }

        return 1.00; // Default calmo
    }

    /**
     * Categorizza il vento per UI
     */
    categorizeWind(vento) {
        const Kv = this.getWindCoefficient(vento);

        if (Kv >= 1.00) return 'calmo';
        if (Kv >= 0.95) return 'leggero';
        if (Kv >= 0.90) return 'moderato';
        return 'forte';
    }

    /**
     * Genera tabella distanze per una configurazione
     * @param {number} metriPerGiro - Metri per giro mulinello
     * @param {Array} giriRange - Array di valori giri da calcolare
     * @param {Array} pesiRange - Array di pesi piombo
     * @param {Array} ventoRange - Array di condizioni vento
     */
    generateDistanceTable(metriPerGiro, giriRange, pesiRange, ventoRange) {
        const table = {};

        pesiRange.forEach(peso => {
            table[peso] = {};
            ventoRange.forEach(vento => {
                table[peso][vento] = {};
                giriRange.forEach(giri => {
                    const result = this.calculateDistance(giri, metriPerGiro, peso, vento);
                    table[peso][vento][giri] = result.distanzaEffettiva;
                });
            });
        });

        return table;
    }

    /**
     * Genera tabella HTML per visualizzazione
     */
    generateHTMLTable(metriPerGiro, peso, ventoOptions = ['calmo', 'leggero', 'moderato', 'forte']) {
        const giriRange = [100, 120, 140, 160, 180, 200, 220, 240];

        let html = `<table class="distance-table">
            <thead>
                <tr>
                    <th>Giri</th>
                    ${ventoOptions.map(v => `<th>${v.charAt(0).toUpperCase() + v.slice(1)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

        giriRange.forEach(giri => {
            html += `<tr><td><strong>${giri}</strong></td>`;
            ventoOptions.forEach(vento => {
                const result = this.calculateDistance(giri, metriPerGiro, peso, vento);
                html += `<td>${result.distanzaEffettiva} m</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    /**
     * Ottieni descrizione formula per UI
     */
    getFormulaDescription() {
        return {
            formula: 'D = Giri × MetriPerGiro × Kₑ × Kᵥ',
            parametri: {
                'Giri': 'Numero di giri del mulinello durante il recupero',
                'MetriPerGiro': 'Metri di filo recuperati per ogni giro (dipende dal mulinello)',
                'Kₑ': 'Coefficiente elasticità (dipende dal peso del piombo e tipo filo)',
                'Kᵥ': 'Coefficiente vento (pancia del filo causata dal vento)'
            },
            note: 'Formula calibrata su nylon con elasticità base 10% a 125g. Per trecciato i coefficienti sono diversi (elasticità ~3%).'
        };
    }

    /**
     * Ottieni tutti i coefficienti per debug/visualizzazione
     */
    getAllCoefficients() {
        return {
            elasticita: this.elasticityCoefficients,
            vento: this.windCoefficients
        };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ReelCalculator = ReelCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReelCalculator;
}
