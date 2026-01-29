// ============================================
// AI COACH - Coach Virtuale Intelligente
// ============================================

/**
 * Classe AICoach per analisi dati e suggerimenti personalizzati
 * Utilizza algoritmi di analisi statistica per fornire insights
 */
class AICoach {
    constructor() {
        this.analysisCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minuti
    }

    /**
     * Analizza tutte le sessioni dell'utente
     * @param {Array} sessions - Array di sessioni
     * @returns {Object} Analisi completa
     */
    analyzePerformance(sessions) {
        if (!sessions || sessions.length === 0) {
            return this.getEmptyAnalysis();
        }

        const cacheKey = `analysis_${sessions.length}_${sessions[0]?.id}`;
        const cached = this.analysisCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const allCasts = this.extractAllCasts(sessions);

        const analysis = {
            overview: this.calculateOverview(allCasts, sessions),
            patterns: this.detectPatterns(sessions),
            trends: this.analyzeTrends(allCasts),
            recommendations: [],
            predictions: this.generatePredictions(allCasts),
            weaknesses: this.identifyWeaknesses(sessions),
            strengths: this.identifyStrengths(sessions)
        };

        // Genera raccomandazioni basate sull'analisi
        analysis.recommendations = this.generateRecommendations(analysis);

        this.analysisCache.set(cacheKey, { data: analysis, timestamp: Date.now() });
        return analysis;
    }

    /**
     * Estrae tutti i lanci dalle sessioni
     */
    extractAllCasts(sessions) {
        const casts = [];
        sessions.forEach(session => {
            if (session.lanci && Array.isArray(session.lanci)) {
                session.lanci.forEach(lancio => {
                    casts.push({
                        ...lancio,
                        sessionId: session.id,
                        sessionDate: session.dataInizio,
                        tecnica: lancio.tecnica || session.tecnica,
                        pesoPiombo: lancio.pesoPiombo || session.pesoPiombo,
                        vento: session.vento,
                        direzioneVento: session.direzioneVento,
                        temperatura: session.temperatura
                    });
                });
            }
        });
        return casts.sort((a, b) => new Date(a.data || a.sessionDate) - new Date(b.data || b.sessionDate));
    }

    /**
     * Calcola panoramica generale
     */
    calculateOverview(casts, sessions) {
        if (casts.length === 0) return null;

        const distances = casts.map(c => c.distanza).filter(d => d > 0);
        const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
        const max = Math.max(...distances);
        const min = Math.min(...distances);
        const recent = distances.slice(-10);
        const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;

        // Calcola deviazione standard
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / distances.length;
        const stdDev = Math.sqrt(variance);

        // Consistenza (0-100, più alto = più consistente)
        const consistency = Math.max(0, 100 - (stdDev / avg * 100));

        return {
            totalCasts: casts.length,
            totalSessions: sessions.length,
            averageDistance: Math.round(avg * 10) / 10,
            maxDistance: max,
            minDistance: min,
            recentAverage: Math.round(recentAvg * 10) / 10,
            standardDeviation: Math.round(stdDev * 10) / 10,
            consistency: Math.round(consistency),
            improvementRate: this.calculateImprovementRate(distances)
        };
    }

    /**
     * Calcola il tasso di miglioramento
     */
    calculateImprovementRate(distances) {
        if (distances.length < 10) return 0;

        const firstHalf = distances.slice(0, Math.floor(distances.length / 2));
        const secondHalf = distances.slice(Math.floor(distances.length / 2));

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        return Math.round(((avgSecond - avgFirst) / avgFirst) * 100 * 10) / 10;
    }

    /**
     * Rileva pattern nei dati
     */
    detectPatterns(sessions) {
        const patterns = {
            bestTechnique: null,
            bestWeight: null,
            bestWindCondition: null,
            bestWindDirection: null,
            bestTimeOfDay: null,
            bestTemperatureRange: null
        };

        const techniqueStats = {};
        const weightStats = {};
        const windStats = {};
        const windDirStats = {};
        const hourStats = {};
        const tempStats = {};

        sessions.forEach(session => {
            if (!session.lanci || session.lanci.length === 0) return;

            const avgDistance = session.lanci.reduce((sum, l) => sum + (l.distanza || 0), 0) / session.lanci.length;

            // Tecnica
            const tecnica = session.tecnica || 'unknown';
            if (!techniqueStats[tecnica]) techniqueStats[tecnica] = { total: 0, count: 0 };
            techniqueStats[tecnica].total += avgDistance;
            techniqueStats[tecnica].count++;

            // Peso piombo
            const peso = session.pesoPiombo;
            if (peso) {
                if (!weightStats[peso]) weightStats[peso] = { total: 0, count: 0 };
                weightStats[peso].total += avgDistance;
                weightStats[peso].count++;
            }

            // Vento
            const vento = session.vento;
            if (vento) {
                if (!windStats[vento]) windStats[vento] = { total: 0, count: 0 };
                windStats[vento].total += avgDistance;
                windStats[vento].count++;
            }

            // Direzione vento
            const windDir = session.direzioneVento;
            if (windDir) {
                if (!windDirStats[windDir]) windDirStats[windDir] = { total: 0, count: 0 };
                windDirStats[windDir].total += avgDistance;
                windDirStats[windDir].count++;
            }

            // Ora del giorno
            if (session.dataInizio) {
                const hour = new Date(session.dataInizio).getHours();
                const timeSlot = hour < 12 ? 'mattina' : hour < 18 ? 'pomeriggio' : 'sera';
                if (!hourStats[timeSlot]) hourStats[timeSlot] = { total: 0, count: 0 };
                hourStats[timeSlot].total += avgDistance;
                hourStats[timeSlot].count++;
            }

            // Temperatura
            if (session.temperatura) {
                const tempRange = session.temperatura < 15 ? 'freddo' :
                                 session.temperatura < 25 ? 'mite' : 'caldo';
                if (!tempStats[tempRange]) tempStats[tempRange] = { total: 0, count: 0 };
                tempStats[tempRange].total += avgDistance;
                tempStats[tempRange].count++;
            }
        });

        // Trova i migliori per ogni categoria
        patterns.bestTechnique = this.findBest(techniqueStats);
        patterns.bestWeight = this.findBest(weightStats);
        patterns.bestWindCondition = this.findBest(windStats);
        patterns.bestWindDirection = this.findBest(windDirStats);
        patterns.bestTimeOfDay = this.findBest(hourStats);
        patterns.bestTemperatureRange = this.findBest(tempStats);

        return patterns;
    }

    /**
     * Trova il migliore da un oggetto di statistiche
     */
    findBest(stats) {
        let best = null;
        let bestAvg = 0;

        for (const [key, value] of Object.entries(stats)) {
            if (value.count >= 2) { // Minimo 2 sessioni per essere significativo
                const avg = value.total / value.count;
                if (avg > bestAvg) {
                    bestAvg = avg;
                    best = {
                        value: key,
                        average: Math.round(avg * 10) / 10,
                        sessions: value.count
                    };
                }
            }
        }

        return best;
    }

    /**
     * Analizza trend temporali
     */
    analyzeTrends(casts) {
        if (casts.length < 5) return null;

        const weekly = this.groupByPeriod(casts, 'week');
        const monthly = this.groupByPeriod(casts, 'month');

        return {
            weekly: this.calculateTrendDirection(weekly),
            monthly: this.calculateTrendDirection(monthly),
            recentTrend: this.getRecentTrend(casts)
        };
    }

    /**
     * Raggruppa lanci per periodo
     */
    groupByPeriod(casts, period) {
        const groups = {};

        casts.forEach(cast => {
            const date = new Date(cast.data || cast.sessionDate);
            let key;

            if (period === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(cast.distanza);
        });

        return Object.entries(groups).map(([key, distances]) => ({
            period: key,
            average: distances.reduce((a, b) => a + b, 0) / distances.length,
            max: Math.max(...distances),
            count: distances.length
        })).sort((a, b) => a.period.localeCompare(b.period));
    }

    /**
     * Calcola direzione del trend
     */
    calculateTrendDirection(periodData) {
        if (periodData.length < 2) return 'stable';

        const recent = periodData.slice(-3);
        const older = periodData.slice(-6, -3);

        if (recent.length === 0 || older.length === 0) return 'stable';

        const recentAvg = recent.reduce((sum, p) => sum + p.average, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.average, 0) / older.length;

        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (change > 5) return 'improving';
        if (change < -5) return 'declining';
        return 'stable';
    }

    /**
     * Ottieni trend recente dettagliato
     */
    getRecentTrend(casts) {
        const last30 = casts.slice(-30);
        const prev30 = casts.slice(-60, -30);

        if (last30.length < 5 || prev30.length < 5) {
            return { direction: 'insufficient_data', change: 0 };
        }

        const lastAvg = last30.reduce((sum, c) => sum + c.distanza, 0) / last30.length;
        const prevAvg = prev30.reduce((sum, c) => sum + c.distanza, 0) / prev30.length;
        const change = ((lastAvg - prevAvg) / prevAvg) * 100;

        return {
            direction: change > 3 ? 'up' : change < -3 ? 'down' : 'stable',
            change: Math.round(change * 10) / 10,
            lastAverage: Math.round(lastAvg * 10) / 10,
            previousAverage: Math.round(prevAvg * 10) / 10
        };
    }

    /**
     * Genera predizioni
     */
    generatePredictions(casts) {
        if (casts.length < 20) {
            return {
                canPredict: false,
                reason: 'Servono almeno 20 lanci per generare predizioni accurate'
            };
        }

        const distances = casts.map(c => c.distanza);
        const recentMax = Math.max(...distances.slice(-20));
        const overallMax = Math.max(...distances);
        const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
        const recentAvg = distances.slice(-20).reduce((a, b) => a + b, 0) / 20;

        // Calcola trend di miglioramento
        const improvementRate = this.calculateImprovementRate(distances);

        // Predizione prossimo record
        const predictedRecord = Math.round(recentMax * (1 + (improvementRate / 100) * 0.5));

        // Stima tempo per raggiungere obiettivo (se impostato)
        const targetEstimate = this.estimateTimeToTarget(distances, improvementRate);

        return {
            canPredict: true,
            predictedNextRecord: predictedRecord,
            confidenceLevel: this.calculateConfidence(distances),
            estimatedProgress: {
                oneMonth: Math.round(recentAvg * (1 + improvementRate / 100 / 12)),
                threeMonths: Math.round(recentAvg * (1 + improvementRate / 100 / 4)),
                sixMonths: Math.round(recentAvg * (1 + improvementRate / 100 / 2))
            },
            targetEstimate
        };
    }

    /**
     * Calcola livello di confidenza nelle predizioni
     */
    calculateConfidence(distances) {
        const variance = this.calculateVariance(distances);
        const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
        const cv = (Math.sqrt(variance) / avg) * 100; // Coefficiente di variazione

        if (cv < 10) return 'alta';
        if (cv < 20) return 'media';
        return 'bassa';
    }

    /**
     * Calcola varianza
     */
    calculateVariance(arr) {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    }

    /**
     * Stima tempo per raggiungere un obiettivo
     */
    estimateTimeToTarget(distances, improvementRate) {
        // Placeholder - può essere personalizzato con obiettivo utente
        const currentAvg = distances.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, distances.length);
        const target = Math.ceil(currentAvg / 10) * 10 + 10; // Prossimo traguardo decina

        if (improvementRate <= 0) {
            return { target, months: null, achievable: false };
        }

        const monthsNeeded = Math.ceil(((target - currentAvg) / currentAvg) / (improvementRate / 100) * 12);

        return {
            target,
            months: monthsNeeded,
            achievable: monthsNeeded < 24
        };
    }

    /**
     * Identifica punti deboli
     */
    identifyWeaknesses(sessions) {
        const weaknesses = [];

        // Analizza consistenza
        const allDistances = [];
        sessions.forEach(s => {
            if (s.lanci) s.lanci.forEach(l => allDistances.push(l.distanza));
        });

        if (allDistances.length > 10) {
            const variance = this.calculateVariance(allDistances);
            const avg = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
            const cv = (Math.sqrt(variance) / avg) * 100;

            if (cv > 25) {
                weaknesses.push({
                    type: 'consistency',
                    severity: 'high',
                    message: 'Alta variabilità nei lanci. Lavora sulla consistenza tecnica.',
                    tip: 'Concentrati sulla ripetibilità del gesto prima di cercare la distanza massima.'
                });
            } else if (cv > 15) {
                weaknesses.push({
                    type: 'consistency',
                    severity: 'medium',
                    message: 'Variabilità moderata nei lanci.',
                    tip: 'Prova a standardizzare la tua routine pre-lancio.'
                });
            }
        }

        // Analizza condizioni sfavorevoli
        const patterns = this.detectPatterns(sessions);

        if (patterns.bestWindDirection && patterns.bestWindDirection.value === 'favore') {
            weaknesses.push({
                type: 'wind_dependency',
                severity: 'medium',
                message: 'Performance migliori solo con vento a favore.',
                tip: 'Allena i lanci controvento per migliorare in tutte le condizioni.'
            });
        }

        // Frequenza allenamento
        if (sessions.length >= 2) {
            const dates = sessions.map(s => new Date(s.dataInizio)).sort((a, b) => a - b);
            const gaps = [];
            for (let i = 1; i < dates.length; i++) {
                gaps.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
            }
            const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

            if (avgGap > 14) {
                weaknesses.push({
                    type: 'frequency',
                    severity: 'medium',
                    message: `Media di ${Math.round(avgGap)} giorni tra le sessioni.`,
                    tip: 'Allenamenti più frequenti (2-3 volte a settimana) accelerano i progressi.'
                });
            }
        }

        return weaknesses;
    }

    /**
     * Identifica punti di forza
     */
    identifyStrengths(sessions) {
        const strengths = [];
        const patterns = this.detectPatterns(sessions);

        if (patterns.bestTechnique && patterns.bestTechnique.sessions >= 3) {
            strengths.push({
                type: 'technique',
                message: `Eccelli nella tecnica ${patterns.bestTechnique.value}`,
                detail: `Media di ${patterns.bestTechnique.average}m in ${patterns.bestTechnique.sessions} sessioni`
            });
        }

        if (patterns.bestWeight && patterns.bestWeight.sessions >= 3) {
            strengths.push({
                type: 'weight',
                message: `Ottimi risultati con piombo da ${patterns.bestWeight.value}g`,
                detail: `Media di ${patterns.bestWeight.average}m`
            });
        }

        // Consistenza
        const allDistances = [];
        sessions.forEach(s => {
            if (s.lanci) s.lanci.forEach(l => allDistances.push(l.distanza));
        });

        if (allDistances.length > 10) {
            const variance = this.calculateVariance(allDistances);
            const avg = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
            const cv = (Math.sqrt(variance) / avg) * 100;

            if (cv < 10) {
                strengths.push({
                    type: 'consistency',
                    message: 'Eccellente consistenza nei lanci!',
                    detail: `Variazione sotto il 10% - tecnica molto solida`
                });
            }
        }

        return strengths;
    }

    /**
     * Genera raccomandazioni personalizzate
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Raccomandazioni basate sui pattern
        if (analysis.patterns.bestTechnique) {
            recommendations.push({
                priority: 'high',
                category: 'technique',
                title: 'Tecnica Ottimale',
                message: `Continua a utilizzare la tecnica ${analysis.patterns.bestTechnique.value} che ti dà i migliori risultati.`,
                icon: '🎯'
            });
        }

        if (analysis.patterns.bestWeight) {
            recommendations.push({
                priority: 'medium',
                category: 'equipment',
                title: 'Peso Ideale',
                message: `Il piombo da ${analysis.patterns.bestWeight.value}g sembra essere il tuo peso ideale.`,
                icon: '⚖️'
            });
        }

        if (analysis.patterns.bestTimeOfDay) {
            recommendations.push({
                priority: 'low',
                category: 'timing',
                title: 'Momento Migliore',
                message: `Le tue performance sono migliori di ${analysis.patterns.bestTimeOfDay.value}. Pianifica gli allenamenti in questo orario.`,
                icon: '⏰'
            });
        }

        // Raccomandazioni basate su debolezze
        analysis.weaknesses.forEach(weakness => {
            recommendations.push({
                priority: weakness.severity,
                category: weakness.type,
                title: 'Area di Miglioramento',
                message: weakness.message,
                tip: weakness.tip,
                icon: '📈'
            });
        });

        // Raccomandazioni basate su trend
        if (analysis.trends && analysis.trends.recentTrend) {
            const trend = analysis.trends.recentTrend;
            if (trend.direction === 'down') {
                recommendations.push({
                    priority: 'high',
                    category: 'performance',
                    title: 'Trend in Calo',
                    message: `Le tue performance sono calate del ${Math.abs(trend.change)}% recentemente.`,
                    tip: 'Considera un periodo di recupero o rivedi la tecnica.',
                    icon: '⚠️'
                });
            } else if (trend.direction === 'up') {
                recommendations.push({
                    priority: 'low',
                    category: 'performance',
                    title: 'Ottimi Progressi!',
                    message: `Stai migliorando del ${trend.change}%. Continua così!`,
                    icon: '🚀'
                });
            }
        }

        // Ordina per priorità
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    /**
     * Ottieni suggerimento giornaliero
     */
    getDailyTip(sessions) {
        const tips = [
            { category: 'warmup', tip: 'Ricorda sempre 10-15 minuti di riscaldamento prima dei lanci.' },
            { category: 'technique', tip: 'Concentrati sul timing: il rilascio deve avvenire quando la canna è a 45°.' },
            { category: 'equipment', tip: 'Controlla regolarmente lo stato del filo e dello shock leader.' },
            { category: 'mental', tip: 'Visualizza il lancio perfetto prima di eseguirlo.' },
            { category: 'recovery', tip: 'Il riposo è parte dell\'allenamento. Non trascurare il recupero.' },
            { category: 'consistency', tip: 'Meglio 10 lanci consistenti che 20 lanci casuali.' },
            { category: 'wind', tip: 'Con vento contrario, abbassa la traiettoria del lancio.' },
            { category: 'progress', tip: 'Registra ogni sessione per tracciare i tuoi progressi.' }
        ];

        // Seleziona tip basato sul giorno (pseudo-random ma consistente)
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const tipIndex = dayOfYear % tips.length;

        return tips[tipIndex];
    }

    /**
     * Analisi vuota per utenti senza dati
     */
    getEmptyAnalysis() {
        return {
            overview: null,
            patterns: {},
            trends: null,
            recommendations: [{
                priority: 'high',
                category: 'getting_started',
                title: 'Inizia a Registrare',
                message: 'Registra le tue sessioni per sbloccare analisi personalizzate e suggerimenti AI.',
                icon: '📝'
            }],
            predictions: { canPredict: false, reason: 'Nessun dato disponibile' },
            weaknesses: [],
            strengths: []
        };
    }

    /**
     * Genera messaggio motivazionale
     */
    getMotivationalMessage(analysis) {
        if (!analysis.overview) {
            return "Ogni campione ha iniziato con il primo lancio. Inizia oggi! 💪";
        }

        const messages = {
            improving: [
                `Fantastico! Stai migliorando. Il tuo prossimo obiettivo è a portata di mano! 🚀`,
                `I tuoi progressi sono evidenti. Continua con questa determinazione! 💪`,
                `Sei sulla strada giusta. Ogni lancio ti avvicina al record! 🎯`
            ],
            stable: [
                `La consistenza è la chiave del successo. Mantieni il focus! 🎯`,
                `Stai costruendo una base solida. I miglioramenti arriveranno! 💪`,
                `La pazienza premia. Continua ad allenarti con costanza! 🏆`
            ],
            declining: [
                `Ogni atleta ha momenti difficili. La perseveranza fa la differenza! 💪`,
                `È il momento di tornare alle basi. Rivedi la tecnica e riparti! 🎯`,
                `I campioni si riconoscono da come affrontano le difficoltà. Non mollare! 🔥`
            ]
        };

        const trend = analysis.trends?.recentTrend?.direction || 'stable';
        const category = trend === 'up' ? 'improving' : trend === 'down' ? 'declining' : 'stable';
        const categoryMessages = messages[category];

        return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    }
}

// Export
if (typeof window !== 'undefined') {
    window.AICoach = AICoach;
}
