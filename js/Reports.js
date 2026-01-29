// ============================================
// REPORTS - Report Avanzati e PDF
// ============================================

/**
 * Classe ReportGenerator per generazione report avanzati
 */
class ReportGenerator {
    constructor() {
        this.charts = [];
    }

    /**
     * Genera report completo
     * @param {Array} sessions - Sessioni
     * @param {Object} profile - Profilo utente
     * @param {Object} achievements - Dati achievement
     * @returns {Object} Report strutturato
     */
    generateFullReport(sessions, profile, achievements) {
        const report = {
            generatedAt: new Date().toISOString(),
            period: this.determinePeriod(sessions),
            profile: this.formatProfile(profile),
            summary: this.generateSummary(sessions),
            statistics: this.generateStatistics(sessions),
            trends: this.generateTrends(sessions),
            comparisons: this.generateComparisons(sessions),
            achievements: this.formatAchievements(achievements),
            recommendations: this.generateReportRecommendations(sessions)
        };

        return report;
    }

    /**
     * Determina periodo del report
     */
    determinePeriod(sessions) {
        if (!sessions || sessions.length === 0) {
            return { start: null, end: null, days: 0 };
        }

        const dates = sessions.map(s => new Date(s.dataInizio)).sort((a, b) => a - b);
        const start = dates[0];
        const end = dates[dates.length - 1];
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            days,
            formatted: `${start.toLocaleDateString('it-IT')} - ${end.toLocaleDateString('it-IT')}`
        };
    }

    /**
     * Formatta profilo per report
     */
    formatProfile(profile) {
        if (!profile) return null;

        return {
            nome: profile.nome || 'N/D',
            cognome: profile.cognome || '',
            livello: profile.livelloEsperienza || 'N/D',
            obiettivo: profile.obiettivo ? `${profile.obiettivo}m` : 'Non impostato',
            bmi: profile.altezza && profile.peso
                ? (profile.peso / Math.pow(profile.altezza / 100, 2)).toFixed(1)
                : null
        };
    }

    /**
     * Genera riepilogo
     */
    generateSummary(sessions) {
        const allCasts = [];
        sessions.forEach(s => {
            if (s.lanci) {
                s.lanci.forEach(l => allCasts.push({
                    ...l,
                    sessionDate: s.dataInizio,
                    tecnica: l.tecnica || s.tecnica
                }));
            }
        });

        if (allCasts.length === 0) {
            return {
                totalSessions: 0,
                totalCasts: 0,
                averageDistance: 0,
                maxDistance: 0,
                minDistance: 0,
                totalTime: 0
            };
        }

        const distances = allCasts.map(c => c.distanza);

        return {
            totalSessions: sessions.length,
            totalCasts: allCasts.length,
            averageDistance: Math.round(distances.reduce((a, b) => a + b, 0) / distances.length * 10) / 10,
            maxDistance: Math.max(...distances),
            minDistance: Math.min(...distances),
            medianDistance: this.calculateMedian(distances),
            castsPerSession: Math.round(allCasts.length / sessions.length * 10) / 10,
            sessionsPerWeek: this.calculateSessionsPerWeek(sessions)
        };
    }

    /**
     * Calcola mediana
     */
    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10;
    }

    /**
     * Calcola sessioni per settimana
     */
    calculateSessionsPerWeek(sessions) {
        if (sessions.length < 2) return sessions.length;

        const dates = sessions.map(s => new Date(s.dataInizio)).sort((a, b) => a - b);
        const weeks = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24 * 7);

        return weeks > 0 ? Math.round(sessions.length / weeks * 10) / 10 : sessions.length;
    }

    /**
     * Genera statistiche dettagliate
     */
    generateStatistics(sessions) {
        const allCasts = [];
        sessions.forEach(s => {
            if (s.lanci) {
                s.lanci.forEach(l => allCasts.push({
                    ...l,
                    sessionDate: s.dataInizio,
                    tecnica: l.tecnica || s.tecnica,
                    pesoPiombo: l.pesoPiombo || s.pesoPiombo,
                    vento: s.vento,
                    direzioneVento: s.direzioneVento,
                    temperatura: s.temperatura
                }));
            }
        });

        return {
            byTechnique: this.groupByField(allCasts, 'tecnica'),
            byWeight: this.groupByField(allCasts, 'pesoPiombo'),
            byWind: this.groupByField(allCasts, 'vento'),
            byWindDirection: this.groupByField(allCasts, 'direzioneVento'),
            byTimeOfDay: this.groupByTimeOfDay(allCasts),
            byMonth: this.groupByMonth(allCasts),
            byDayOfWeek: this.groupByDayOfWeek(sessions),
            distribution: this.calculateDistribution(allCasts),
            percentiles: this.calculatePercentiles(allCasts.map(c => c.distanza))
        };
    }

    /**
     * Raggruppa per campo
     */
    groupByField(casts, field) {
        const groups = {};

        casts.forEach(cast => {
            const key = cast[field] || 'Non specificato';
            if (!groups[key]) {
                groups[key] = { count: 0, total: 0, max: 0, distances: [] };
            }
            groups[key].count++;
            groups[key].total += cast.distanza;
            groups[key].max = Math.max(groups[key].max, cast.distanza);
            groups[key].distances.push(cast.distanza);
        });

        // Calcola statistiche finali
        Object.keys(groups).forEach(key => {
            const g = groups[key];
            g.average = Math.round(g.total / g.count * 10) / 10;
            g.median = this.calculateMedian(g.distances);
            g.percentage = Math.round((g.count / casts.length) * 100);
            delete g.distances;
            delete g.total;
        });

        return groups;
    }

    /**
     * Raggruppa per ora del giorno
     */
    groupByTimeOfDay(casts) {
        const slots = {
            'Mattina presto (5-8)': { count: 0, total: 0, max: 0 },
            'Mattina (8-12)': { count: 0, total: 0, max: 0 },
            'Pomeriggio (12-17)': { count: 0, total: 0, max: 0 },
            'Sera (17-21)': { count: 0, total: 0, max: 0 },
            'Notte (21-5)': { count: 0, total: 0, max: 0 }
        };

        casts.forEach(cast => {
            const hour = new Date(cast.data || cast.sessionDate).getHours();
            let slot;

            if (hour >= 5 && hour < 8) slot = 'Mattina presto (5-8)';
            else if (hour >= 8 && hour < 12) slot = 'Mattina (8-12)';
            else if (hour >= 12 && hour < 17) slot = 'Pomeriggio (12-17)';
            else if (hour >= 17 && hour < 21) slot = 'Sera (17-21)';
            else slot = 'Notte (21-5)';

            slots[slot].count++;
            slots[slot].total += cast.distanza;
            slots[slot].max = Math.max(slots[slot].max, cast.distanza);
        });

        Object.keys(slots).forEach(key => {
            if (slots[key].count > 0) {
                slots[key].average = Math.round(slots[key].total / slots[key].count * 10) / 10;
            }
            delete slots[key].total;
        });

        return slots;
    }

    /**
     * Raggruppa per mese
     */
    groupByMonth(casts) {
        const months = {};

        casts.forEach(cast => {
            const date = new Date(cast.data || cast.sessionDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!months[key]) {
                months[key] = { count: 0, total: 0, max: 0 };
            }
            months[key].count++;
            months[key].total += cast.distanza;
            months[key].max = Math.max(months[key].max, cast.distanza);
        });

        Object.keys(months).forEach(key => {
            months[key].average = Math.round(months[key].total / months[key].count * 10) / 10;
            delete months[key].total;
        });

        return months;
    }

    /**
     * Raggruppa sessioni per giorno della settimana
     */
    groupByDayOfWeek(sessions) {
        const days = {
            0: { name: 'Domenica', sessions: 0 },
            1: { name: 'Lunedì', sessions: 0 },
            2: { name: 'Martedì', sessions: 0 },
            3: { name: 'Mercoledì', sessions: 0 },
            4: { name: 'Giovedì', sessions: 0 },
            5: { name: 'Venerdì', sessions: 0 },
            6: { name: 'Sabato', sessions: 0 }
        };

        sessions.forEach(s => {
            const day = new Date(s.dataInizio).getDay();
            days[day].sessions++;
        });

        return days;
    }

    /**
     * Calcola distribuzione distanze
     */
    calculateDistribution(casts) {
        const ranges = [
            { label: '< 80m', min: 0, max: 80, count: 0 },
            { label: '80-100m', min: 80, max: 100, count: 0 },
            { label: '100-120m', min: 100, max: 120, count: 0 },
            { label: '120-140m', min: 120, max: 140, count: 0 },
            { label: '140-160m', min: 140, max: 160, count: 0 },
            { label: '160-180m', min: 160, max: 180, count: 0 },
            { label: '> 180m', min: 180, max: Infinity, count: 0 }
        ];

        casts.forEach(cast => {
            for (const range of ranges) {
                if (cast.distanza >= range.min && cast.distanza < range.max) {
                    range.count++;
                    break;
                }
            }
        });

        const total = casts.length;
        ranges.forEach(r => {
            r.percentage = total > 0 ? Math.round((r.count / total) * 100) : 0;
        });

        return ranges;
    }

    /**
     * Calcola percentili
     */
    calculatePercentiles(distances) {
        if (distances.length === 0) return {};

        const sorted = [...distances].sort((a, b) => a - b);

        const getPercentile = (p) => {
            const index = Math.ceil((p / 100) * sorted.length) - 1;
            return sorted[Math.max(0, index)];
        };

        return {
            p10: getPercentile(10),
            p25: getPercentile(25),
            p50: getPercentile(50),
            p75: getPercentile(75),
            p90: getPercentile(90),
            p95: getPercentile(95)
        };
    }

    /**
     * Genera trend
     */
    generateTrends(sessions) {
        const allCasts = [];
        sessions.forEach(s => {
            if (s.lanci) {
                s.lanci.forEach(l => allCasts.push({
                    distanza: l.distanza,
                    date: new Date(l.data || s.dataInizio)
                }));
            }
        });

        if (allCasts.length < 10) {
            return { hasEnoughData: false };
        }

        // Ordina per data
        allCasts.sort((a, b) => a.date - b.date);

        // Calcola medie mobili
        const windowSize = Math.min(10, Math.floor(allCasts.length / 3));
        const movingAverages = [];

        for (let i = windowSize - 1; i < allCasts.length; i++) {
            const window = allCasts.slice(i - windowSize + 1, i + 1);
            const avg = window.reduce((sum, c) => sum + c.distanza, 0) / windowSize;
            movingAverages.push({
                date: allCasts[i].date,
                average: Math.round(avg * 10) / 10
            });
        }

        // Calcola trend lineare (regressione semplice)
        const n = allCasts.length;
        const sumX = allCasts.reduce((sum, _, i) => sum + i, 0);
        const sumY = allCasts.reduce((sum, c) => sum + c.distanza, 0);
        const sumXY = allCasts.reduce((sum, c, i) => sum + i * c.distanza, 0);
        const sumX2 = allCasts.reduce((sum, _, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calcola R-squared
        const yMean = sumY / n;
        const ssTotal = allCasts.reduce((sum, c) => sum + Math.pow(c.distanza - yMean, 2), 0);
        const ssResidual = allCasts.reduce((sum, c, i) => {
            const predicted = intercept + slope * i;
            return sum + Math.pow(c.distanza - predicted, 2);
        }, 0);
        const rSquared = 1 - (ssResidual / ssTotal);

        return {
            hasEnoughData: true,
            movingAverages,
            linearTrend: {
                slope: Math.round(slope * 1000) / 1000,
                direction: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
                rSquared: Math.round(rSquared * 100) / 100,
                projectedImprovement: Math.round(slope * 30 * 10) / 10 // per 30 lanci
            },
            volatility: this.calculateVolatility(allCasts.map(c => c.distanza))
        };
    }

    /**
     * Calcola volatilità
     */
    calculateVolatility(distances) {
        const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / distances.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / avg) * 100;

        return {
            standardDeviation: Math.round(stdDev * 10) / 10,
            coefficientOfVariation: Math.round(cv * 10) / 10,
            rating: cv < 10 ? 'Eccellente' : cv < 15 ? 'Buona' : cv < 20 ? 'Media' : 'Da migliorare'
        };
    }

    /**
     * Genera confronti
     */
    generateComparisons(sessions) {
        if (sessions.length < 2) {
            return { hasEnoughData: false };
        }

        // Dividi in prima e seconda metà
        const sortedSessions = [...sessions].sort((a, b) =>
            new Date(a.dataInizio) - new Date(b.dataInizio)
        );

        const mid = Math.floor(sortedSessions.length / 2);
        const firstHalf = sortedSessions.slice(0, mid);
        const secondHalf = sortedSessions.slice(mid);

        const firstStats = this.generateSummary(firstHalf);
        const secondStats = this.generateSummary(secondHalf);

        // Ultimi 30 giorni vs precedenti
        const now = new Date();
        const last30Days = sessions.filter(s =>
            (now - new Date(s.dataInizio)) / (1000 * 60 * 60 * 24) <= 30
        );
        const previous30Days = sessions.filter(s => {
            const diff = (now - new Date(s.dataInizio)) / (1000 * 60 * 60 * 24);
            return diff > 30 && diff <= 60;
        });

        return {
            hasEnoughData: true,
            halfComparison: {
                first: {
                    period: `Prime ${mid} sessioni`,
                    ...firstStats
                },
                second: {
                    period: `Ultime ${sortedSessions.length - mid} sessioni`,
                    ...secondStats
                },
                improvement: {
                    averageDistance: secondStats.averageDistance - firstStats.averageDistance,
                    percentageChange: firstStats.averageDistance > 0
                        ? Math.round(((secondStats.averageDistance - firstStats.averageDistance) / firstStats.averageDistance) * 100 * 10) / 10
                        : 0
                }
            },
            monthly: {
                last30: this.generateSummary(last30Days),
                previous30: this.generateSummary(previous30Days)
            }
        };
    }

    /**
     * Formatta achievement per report
     */
    formatAchievements(achievements) {
        if (!achievements) return null;

        return {
            level: achievements.getCurrentLevel(),
            badgeStats: achievements.getBadgeStats(),
            recentBadges: Object.values(achievements.unlockedBadges)
                .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                .slice(0, 5)
                .map(b => b.badge),
            streakInfo: {
                current: achievements.stats.currentStreak,
                best: achievements.stats.bestStreak
            }
        };
    }

    /**
     * Genera raccomandazioni per report
     */
    generateReportRecommendations(sessions) {
        const recommendations = [];
        const summary = this.generateSummary(sessions);
        const stats = this.generateStatistics(sessions);
        const trends = this.generateTrends(sessions);

        // Analizza frequenza
        if (summary.sessionsPerWeek < 2) {
            recommendations.push({
                area: 'Frequenza',
                observation: `Media di ${summary.sessionsPerWeek} sessioni/settimana`,
                suggestion: 'Aumenta la frequenza a 2-3 sessioni settimanali per progressi più rapidi.'
            });
        }

        // Analizza consistenza
        if (trends.hasEnoughData && trends.volatility.coefficientOfVariation > 15) {
            recommendations.push({
                area: 'Consistenza',
                observation: `Variabilità: ${trends.volatility.coefficientOfVariation}%`,
                suggestion: 'Lavora sulla ripetibilità del gesto. Focalizzati sulla tecnica prima della potenza.'
            });
        }

        // Analizza trend
        if (trends.hasEnoughData && trends.linearTrend.direction === 'declining') {
            recommendations.push({
                area: 'Performance',
                observation: 'Trend in calo rilevato',
                suggestion: 'Considera un periodo di recupero o rivedi la tecnica base.'
            });
        }

        // Analizza condizioni
        if (stats.byWind && Object.keys(stats.byWind).length > 1) {
            const windStats = Object.entries(stats.byWind);
            const bestWind = windStats.reduce((best, [key, val]) =>
                val.average > (best[1]?.average || 0) ? [key, val] : best, ['', null]
            );

            if (bestWind[0] === 'calmo' || bestWind[0] === 'leggero') {
                recommendations.push({
                    area: 'Condizioni',
                    observation: `Performance migliori con vento ${bestWind[0]}`,
                    suggestion: 'Allena i lanci in condizioni di vento più impegnative.'
                });
            }
        }

        return recommendations;
    }

    /**
     * Genera HTML per stampa/PDF
     */
    generatePrintableHTML(report, profile) {
        const formatNumber = (n) => typeof n === 'number' ? n.toFixed(1) : 'N/D';

        return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Report Longcasting Pro - ${report.period.formatted || 'Report'}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header .period { color: #00D9FF; font-size: 14px; }
        .section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section h2 {
            color: #1a1a2e;
            border-bottom: 2px solid #00D9FF;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #00D9FF;
        }
        .stat-card .label {
            font-size: 12px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th { background: #1a1a2e; color: white; }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }
        .badge-common { background: #e0e0e0; }
        .badge-uncommon { background: #81c784; color: white; }
        .badge-rare { background: #64b5f6; color: white; }
        .badge-epic { background: #ba68c8; color: white; }
        .badge-legendary { background: #ffd54f; }
        .recommendation {
            background: white;
            padding: 15px;
            border-left: 4px solid #00D9FF;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { padding: 0; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎣 Longcasting Pro</h1>
        <div class="period">Report ${report.period.formatted || ''}</div>
        ${profile?.nome ? `<div style="margin-top:10px">${profile.nome} ${profile.cognome || ''}</div>` : ''}
    </div>

    <div class="section">
        <h2>📊 Riepilogo</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="value">${report.summary.totalSessions}</div>
                <div class="label">Sessioni</div>
            </div>
            <div class="stat-card">
                <div class="value">${report.summary.totalCasts}</div>
                <div class="label">Lanci Totali</div>
            </div>
            <div class="stat-card">
                <div class="value">${formatNumber(report.summary.averageDistance)}m</div>
                <div class="label">Media</div>
            </div>
            <div class="stat-card">
                <div class="value">${report.summary.maxDistance}m</div>
                <div class="label">Record</div>
            </div>
            <div class="stat-card">
                <div class="value">${formatNumber(report.summary.medianDistance)}m</div>
                <div class="label">Mediana</div>
            </div>
            <div class="stat-card">
                <div class="value">${formatNumber(report.summary.castsPerSession)}</div>
                <div class="label">Lanci/Sessione</div>
            </div>
        </div>
    </div>

    ${report.trends.hasEnoughData ? `
    <div class="section">
        <h2>📈 Trend e Progressi</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="value">${report.trends.linearTrend.direction === 'improving' ? '↗️' : report.trends.linearTrend.direction === 'declining' ? '↘️' : '→'}</div>
                <div class="label">Direzione</div>
            </div>
            <div class="stat-card">
                <div class="value">${report.trends.volatility.rating}</div>
                <div class="label">Consistenza</div>
            </div>
            <div class="stat-card">
                <div class="value">${report.trends.volatility.standardDeviation}m</div>
                <div class="label">Deviazione Std</div>
            </div>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>🎯 Statistiche per Tecnica</h2>
        <table>
            <tr>
                <th>Tecnica</th>
                <th>Lanci</th>
                <th>Media</th>
                <th>Max</th>
            </tr>
            ${Object.entries(report.statistics.byTechnique).map(([tech, stats]) => `
            <tr>
                <td>${tech}</td>
                <td>${stats.count}</td>
                <td>${formatNumber(stats.average)}m</td>
                <td>${stats.max}m</td>
            </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>📍 Distribuzione Distanze</h2>
        <table>
            <tr>
                <th>Range</th>
                <th>Lanci</th>
                <th>%</th>
            </tr>
            ${report.statistics.distribution.filter(r => r.count > 0).map(range => `
            <tr>
                <td>${range.label}</td>
                <td>${range.count}</td>
                <td>${range.percentage}%</td>
            </tr>
            `).join('')}
        </table>
    </div>

    ${report.achievements ? `
    <div class="section">
        <h2>🏆 Achievement</h2>
        <p>Livello: <strong>${report.achievements.level.icon} ${report.achievements.level.name}</strong> (${report.achievements.level.currentXP} XP)</p>
        <p>Badge sbloccati: ${report.achievements.badgeStats.unlocked}/${report.achievements.badgeStats.total} (${report.achievements.badgeStats.percentage}%)</p>
        ${report.achievements.recentBadges.length > 0 ? `
        <p style="margin-top:10px">Ultimi badge:
            ${report.achievements.recentBadges.map(b => `<span class="badge badge-${b.rarity}">${b.icon} ${b.name}</span>`).join(' ')}
        </p>
        ` : ''}
    </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h2>💡 Raccomandazioni</h2>
        ${report.recommendations.map(rec => `
        <div class="recommendation">
            <strong>${rec.area}</strong>: ${rec.observation}<br>
            <em>${rec.suggestion}</em>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <p>Report generato da Longcasting Pro il ${new Date().toLocaleDateString('it-IT')}</p>
        <p>© ${new Date().getFullYear()} Longcasting Pro - Tutti i diritti riservati</p>
    </div>
</body>
</html>`;
    }

    /**
     * Esporta report come PDF (apre finestra di stampa)
     */
    exportToPDF(report, profile) {
        const html = this.generatePrintableHTML(report, profile);
        const printWindow = window.open('', '_blank');

        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();

            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            // Fallback: download come HTML
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-longcasting-${new Date().toISOString().split('T')[0]}.html`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Esporta dati come JSON
     */
    exportToJSON(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-longcasting-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Esporta dati come CSV
     */
    exportToCSV(sessions) {
        const rows = [['Data', 'Sessione', 'Distanza', 'Tecnica', 'Peso Piombo', 'Vento', 'Note']];

        sessions.forEach(session => {
            if (session.lanci) {
                session.lanci.forEach(lancio => {
                    rows.push([
                        lancio.data || session.dataInizio,
                        session.id,
                        lancio.distanza,
                        lancio.tecnica || session.tecnica || '',
                        lancio.pesoPiombo || session.pesoPiombo || '',
                        session.vento || '',
                        (lancio.note || '').replace(/,/g, ';')
                    ]);
                });
            }
        });

        const csv = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dati-longcasting-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ReportGenerator = ReportGenerator;
}
