// LongCast Pro - Main Application
class LongCastApp {
    constructor() {
        this.sessions = []; // Array of completed training sessions
        this.profile = null;
        this.chart = null;
        this.currentSession = null; // Active training session
        this.suggestions = {
            tecniche: [],
            pesoPiombo: [],
            vento: [],
            direzioneVento: [],
            cannaModello: [],
            luoghi: [],
            grammatura: [],
            mulinello: [],
            filo: []
        };
        this.init();
    }

    init() {
        this.loadData();
        this.loadSuggestions();
        this.updateDatalistSuggestions();
        this.setupEventListeners();
        this.updateDashboard();
        this.loadProfile();
        this.setDefaultDateTime();
        this.checkActiveSession();
    }

    // Data Management
    loadData() {
        const savedSessions = localStorage.getItem('longcast_sessions');
        const savedProfile = localStorage.getItem('longcast_profile');
        const savedActiveSession = sessionStorage.getItem('longcast_active_session');

        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions);
        }

        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
        }

        if (savedActiveSession) {
            this.currentSession = JSON.parse(savedActiveSession);
        }
    }

    saveData() {
        localStorage.setItem('longcast_sessions', JSON.stringify(this.sessions));
        if (this.profile) {
            localStorage.setItem('longcast_profile', JSON.stringify(this.profile));
        }
    }

    saveSession() {
        if (this.currentSession) {
            sessionStorage.setItem('longcast_active_session', JSON.stringify(this.currentSession));
        } else {
            sessionStorage.removeItem('longcast_active_session');
        }
    }

    // Suggestions Management
    loadSuggestions() {
        const saved = localStorage.getItem('longcast_suggestions');
        if (saved) {
            this.suggestions = JSON.parse(saved);
        }
    }

    saveSuggestions() {
        localStorage.setItem('longcast_suggestions', JSON.stringify(this.suggestions));
    }

    addSuggestion(type, value) {
        if (!value || value.trim() === '') return;

        const trimmedValue = value.trim();
        if (!this.suggestions[type].includes(trimmedValue)) {
            this.suggestions[type].push(trimmedValue);
            this.saveSuggestions();
            this.updateDatalistSuggestions();
        }
    }

    updateDatalistSuggestions() {
        // Tecnica
        const tecnicaList = document.getElementById('tecnica-list');
        if (tecnicaList) {
            tecnicaList.innerHTML = this.suggestions.tecniche.map(t =>
                `<option value="${this.escapeHtml(t)}">`
            ).join('');
        }

        // Peso Piombo
        const pesoPiomboList = document.getElementById('peso-piombo-list');
        if (pesoPiomboList) {
            pesoPiomboList.innerHTML = this.suggestions.pesoPiombo.map(p =>
                `<option value="${this.escapeHtml(p)}">`
            ).join('');
        }

        // Vento
        const ventoList = document.getElementById('vento-list');
        if (ventoList) {
            ventoList.innerHTML = this.suggestions.vento.map(v =>
                `<option value="${this.escapeHtml(v)}">`
            ).join('');
        }

        // Direzione Vento
        const direzioneList = document.getElementById('direzione-vento-list');
        if (direzioneList) {
            direzioneList.innerHTML = this.suggestions.direzioneVento.map(d =>
                `<option value="${this.escapeHtml(d)}">`
            ).join('');
        }

        // Canna Modello
        const cannaModelloList = document.getElementById('canna-modello-list');
        if (cannaModelloList) {
            cannaModelloList.innerHTML = this.suggestions.cannaModello.map(c =>
                `<option value="${this.escapeHtml(c)}">`
            ).join('');
        }

        // Luoghi
        const luogoList = document.getElementById('luogo-list');
        if (luogoList) {
            luogoList.innerHTML = this.suggestions.luoghi.map(l =>
                `<option value="${this.escapeHtml(l)}">`
            ).join('');
        }

        // Grammatura
        const grammaturaList = document.getElementById('grammatura-list');
        if (grammaturaList) {
            grammaturaList.innerHTML = this.suggestions.grammatura.map(g =>
                `<option value="${this.escapeHtml(g)}">`
            ).join('');
        }

        // Mulinello
        const mulinelloList = document.getElementById('mulinello-list');
        if (mulinelloList) {
            mulinelloList.innerHTML = this.suggestions.mulinello.map(m =>
                `<option value="${this.escapeHtml(m)}">`
            ).join('');
        }

        // Filo
        const filoList = document.getElementById('filo-list');
        if (filoList) {
            filoList.innerHTML = this.suggestions.filo.map(f =>
                `<option value="${this.escapeHtml(f)}">`
            ).join('');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigate(e.target.dataset.section));
        });

        // Session Forms
        document.getElementById('startSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startSession();
        });

        document.getElementById('addCastForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCastToSession();
        });

        document.getElementById('endSessionBtn').addEventListener('click', () => {
            this.endSession();
        });

        // Profile Form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // BMI Calculation
        document.getElementById('peso').addEventListener('input', () => this.calculateBMI());
        document.getElementById('altezza').addEventListener('input', () => this.calculateBMI());

        // Filters
        document.getElementById('filter-luogo').addEventListener('input', () => this.filterHistory());
        document.getElementById('filter-periodo').addEventListener('change', () => this.filterHistory());
        document.getElementById('sort-by').addEventListener('change', () => this.filterHistory());

        // Session Detail
        document.getElementById('backToSessions').addEventListener('click', () => this.showSessionsList());

        // Data Management
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
    }

    // Navigation
    navigate(section) {
        // Update sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Refresh data based on section
        if (section === 'dashboard') {
            this.updateDashboard();
        } else if (section === 'storico') {
            this.filterHistory();
        } else if (section === 'profilo') {
            this.loadProfile();
        } else if (section === 'nuovo-lancio') {
            this.checkActiveSession();
        }
    }

    // Session Management
    checkActiveSession() {
        if (this.currentSession) {
            this.showSessionActive();
        } else {
            this.showSessionNotStarted();
        }
    }

    showSessionNotStarted() {
        document.getElementById('sessionNotStarted').style.display = 'block';
        document.getElementById('sessionActive').style.display = 'none';
    }

    showSessionActive() {
        document.getElementById('sessionNotStarted').style.display = 'none';
        document.getElementById('sessionActive').style.display = 'block';
        this.updateSessionUI();
    }

    startSession() {
        const formData = new FormData(document.getElementById('startSessionForm'));

        const pesoPiombo = formData.get('session-peso-piombo');
        const tecnica = formData.get('session-tecnica');
        const cannaModello = formData.get('session-canna-modello');
        const vento = formData.get('session-vento');
        const direzioneVento = formData.get('session-direzione-vento');
        const luogo = formData.get('session-luogo');
        const cannaGrammatura = formData.get('session-canna-grammatura');
        const mulinello = formData.get('session-mulinello');
        const filo = formData.get('session-filo');

        this.currentSession = {
            id: Date.now(),
            dataInizio: formData.get('session-data'),
            luogo: luogo,
            pesoPiombo: pesoPiombo,
            tecnica: tecnica,
            cannaModello: cannaModello,
            cannaLunghezza: formData.get('session-canna-lunghezza') ? parseFloat(formData.get('session-canna-lunghezza')) : null,
            cannaGrammatura: cannaGrammatura,
            mulinello: mulinello,
            filo: filo,
            vento: vento,
            direzioneVento: direzioneVento,
            temperatura: formData.get('session-temperatura') ? parseFloat(formData.get('session-temperatura')) : null,
            umidita: formData.get('session-umidita') ? parseInt(formData.get('session-umidita')) : null,
            note: formData.get('session-note'),
            lanci: []
        };

        // Save suggestions
        this.addSuggestion('pesoPiombo', pesoPiombo);
        this.addSuggestion('tecniche', tecnica);
        this.addSuggestion('cannaModello', cannaModello);
        this.addSuggestion('vento', vento);
        this.addSuggestion('direzioneVento', direzioneVento);
        this.addSuggestion('luoghi', luogo);
        this.addSuggestion('grammatura', cannaGrammatura);
        this.addSuggestion('mulinello', mulinello);
        this.addSuggestion('filo', filo);

        this.saveSession();
        this.showSessionActive();
        this.showToast('Sessione di allenamento iniziata!', 'success');

        // Reset form
        document.getElementById('startSessionForm').reset();
        this.setDefaultDateTime();
    }

    updateSessionUI() {
        if (!this.currentSession) return;

        // Update session info
        const startDate = new Date(this.currentSession.dataInizio);
        document.getElementById('sessionStartTime').textContent = startDate.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('sessionCastCount').textContent = this.currentSession.lanci.length;
        document.getElementById('sessionLocation').textContent = this.currentSession.luogo;

        // Update session details
        const details = [];

        details.push({ label: 'Tecnica', value: this.currentSession.tecnica });
        details.push({ label: 'Peso Piombo', value: this.currentSession.pesoPiombo });

        if (this.currentSession.cannaModello) {
            details.push({ label: 'Modello Canna', value: this.currentSession.cannaModello });
        }

        if (this.currentSession.cannaLunghezza) {
            details.push({ label: 'Lunghezza', value: this.currentSession.cannaLunghezza + 'm' });
        }

        if (this.currentSession.cannaGrammatura) {
            details.push({ label: 'Grammatura', value: this.currentSession.cannaGrammatura + 'g' });
        }

        if (this.currentSession.mulinello) {
            details.push({ label: 'Mulinello', value: this.currentSession.mulinello });
        }

        if (this.currentSession.filo) {
            details.push({ label: 'Filo', value: this.currentSession.filo });
        }

        if (this.currentSession.vento) {
            details.push({ label: 'Vento', value: this.currentSession.vento });
        }

        if (this.currentSession.direzioneVento) {
            details.push({ label: 'Dir. Vento', value: this.currentSession.direzioneVento });
        }

        if (this.currentSession.temperatura) {
            details.push({ label: 'Temperatura', value: this.currentSession.temperatura + '°C' });
        }

        if (this.currentSession.umidita) {
            details.push({ label: 'Umidità', value: this.currentSession.umidita + '%' });
        }

        const detailsHTML = details.map(d => `
            <div class="session-detail-item">
                <span class="session-detail-label">${d.label}</span>
                <span class="session-detail-value">${d.value}</span>
            </div>
        `).join('');

        document.getElementById('sessionDetails').innerHTML = detailsHTML;

        // Pre-fill weather fields with current session data
        document.getElementById('cast-vento').value = this.currentSession.vento || '';
        document.getElementById('cast-direzione-vento').value = this.currentSession.direzioneVento || '';
        document.getElementById('cast-temperatura').value = this.currentSession.temperatura || '';
        document.getElementById('cast-umidita').value = this.currentSession.umidita || '';

        // Update session casts list
        this.updateSessionCastsList();
    }

    addCastToSession() {
        if (!this.currentSession) return;

        const distanza = parseFloat(document.getElementById('cast-distanza').value);
        const note = document.getElementById('cast-note').value;

        // Get weather data (might have been updated)
        const vento = document.getElementById('cast-vento').value;
        const direzioneVento = document.getElementById('cast-direzione-vento').value;
        const temperatura = document.getElementById('cast-temperatura').value ? parseFloat(document.getElementById('cast-temperatura').value) : null;
        const umidita = document.getElementById('cast-umidita').value ? parseInt(document.getElementById('cast-umidita').value) : null;

        // Update session weather if changed
        this.currentSession.vento = vento;
        this.currentSession.direzioneVento = direzioneVento;
        this.currentSession.temperatura = temperatura;
        this.currentSession.umidita = umidita;

        // Save weather suggestions
        this.addSuggestion('vento', vento);
        this.addSuggestion('direzioneVento', direzioneVento);

        // Create cast object
        const cast = {
            distanza: distanza,
            orario: new Date().toISOString(),
            note: note
        };

        this.currentSession.lanci.push(cast);
        this.saveSession();

        // Update UI
        this.updateSessionUI();

        // Clear form
        document.getElementById('cast-distanza').value = '';
        document.getElementById('cast-note').value = '';

        // Focus back to distance
        document.getElementById('cast-distanza').focus();

        this.showToast(`Lancio registrato: ${distanza.toFixed(1)}m`, 'success');
    }

    updateSessionCastsList() {
        if (!this.currentSession || this.currentSession.lanci.length === 0) {
            document.getElementById('sessionCastsList').innerHTML = '<p class="no-data-text">Nessun lancio ancora registrato in questa sessione</p>';
            return;
        }

        const castsHTML = this.currentSession.lanci.map((cast, index) => {
            const orario = new Date(cast.orario);
            const orarioFormatted = orario.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            return `
                <div class="cast-item">
                    <div class="cast-distance">${cast.distanza.toFixed(1)}m</div>
                    <div class="cast-info">
                        <div class="cast-technique">Lancio #${index + 1}</div>
                        <div class="cast-details">
                            ${cast.note ? cast.note : 'Nessuna nota'}
                        </div>
                    </div>
                    <div>
                        <div class="cast-date">${orarioFormatted}</div>
                        <div class="cast-actions">
                            <button class="delete" data-index="${index}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('sessionCastsList').innerHTML = castsHTML;

        // Add delete listeners
        document.querySelectorAll('#sessionCastsList .delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.deleteSessionCast(index);
            });
        });
    }

    deleteSessionCast(index) {
        if (!this.currentSession) return;

        if (confirm('Eliminare questo lancio dalla sessione?')) {
            this.currentSession.lanci.splice(index, 1);
            this.saveSession();
            this.updateSessionUI();
            this.showToast('Lancio eliminato', 'success');
        }
    }

    endSession() {
        if (!this.currentSession) return;

        if (this.currentSession.lanci.length === 0) {
            if (!confirm('La sessione non contiene lanci. Terminarla comunque?')) {
                return;
            }
        }

        const confirmation = confirm(
            `Terminare la sessione di allenamento?\n\n` +
            `Lanci registrati: ${this.currentSession.lanci.length}\n` +
            `La sessione verrà salvata nello storico.`
        );

        if (!confirmation) return;

        // Mark session as completed with end time
        this.currentSession.dataFine = new Date().toISOString();
        this.currentSession.completata = true;

        // Calculate session stats
        if (this.currentSession.lanci.length > 0) {
            const distanze = this.currentSession.lanci.map(l => l.distanza);
            this.currentSession.distanzaMedia = distanze.reduce((a, b) => a + b, 0) / distanze.length;
            this.currentSession.distanzaMassima = Math.max(...distanze);
            this.currentSession.distanzaMinima = Math.min(...distanze);
        }

        // Save completed session to sessions array
        this.sessions.push({...this.currentSession});
        this.saveData();

        // Clear active session
        this.currentSession = null;
        this.saveSession();

        this.showToast('Sessione di allenamento terminata e salvata!', 'success');

        // Update UI
        this.showSessionNotStarted();
        this.updateDashboard();

        // Reset form
        this.setDefaultDateTime();
    }

    // Delete Session (from history)
    deleteSession(sessionId) {
        if (confirm('Sei sicuro di voler eliminare questa sessione? Verranno eliminati tutti i lanci associati.')) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.saveData();
            this.showToast('Sessione eliminata', 'success');
            this.updateDashboard();
            this.filterHistory();
        }
    }

    // Update Dashboard
    updateDashboard() {
        if (this.sessions.length === 0) {
            this.showEmptyDashboard();
            return;
        }

        this.updateStats();
        this.updateChart();
        this.updateRecentSessions();
    }

    showEmptyDashboard() {
        document.getElementById('stat-media').textContent = '-- m';
        document.getElementById('stat-record').textContent = '-- m';
        document.getElementById('stat-totale').textContent = '0';
        document.getElementById('stat-miglioramento').textContent = '-- %';

        document.getElementById('chartCanvas').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';

        document.getElementById('recentCastsList').innerHTML = '<p class="no-data-text">Nessuna sessione registrata</p>';
    }

    updateStats() {
        // Collect all casts from all sessions
        const allCasts = this.sessions.flatMap(s => s.lanci || []);

        if (allCasts.length === 0) {
            this.showEmptyDashboard();
            return;
        }

        const distanze = allCasts.map(c => c.distanza);

        // Media totale
        const media = distanze.reduce((a, b) => a + b, 0) / distanze.length;
        document.getElementById('stat-media').textContent = media.toFixed(1) + ' m';

        // Record assoluto
        const record = Math.max(...distanze);
        document.getElementById('stat-record').textContent = record.toFixed(1) + ' m';

        // Totale lanci
        document.getElementById('stat-totale').textContent = allCasts.length;

        // Miglioramento tra sessioni
        const improvement = this.calculateSessionImprovement();
        const improvementText = improvement !== null ?
            (improvement > 0 ? '+' : '') + improvement.toFixed(1) + '%' :
            '-- %';
        document.getElementById('stat-miglioramento').textContent = improvementText;
    }

    calculateSessionImprovement() {
        if (this.sessions.length < 2) {
            return null;
        }

        // Sort sessions by date
        const sortedSessions = [...this.sessions].sort((a, b) =>
            new Date(a.dataInizio) - new Date(b.dataInizio)
        );

        // Get last 2 sessions that have casts
        const sessionsWithCasts = sortedSessions.filter(s => s.lanci && s.lanci.length > 0);

        if (sessionsWithCasts.length < 2) {
            return null;
        }

        // Compare last session with previous one
        const lastSession = sessionsWithCasts[sessionsWithCasts.length - 1];
        const previousSession = sessionsWithCasts[sessionsWithCasts.length - 2];

        const lastAvg = lastSession.distanzaMedia ||
            lastSession.lanci.reduce((sum, l) => sum + l.distanza, 0) / lastSession.lanci.length;
        const prevAvg = previousSession.distanzaMedia ||
            previousSession.lanci.reduce((sum, l) => sum + l.distanza, 0) / previousSession.lanci.length;

        return ((lastAvg - prevAvg) / prevAvg) * 100;
    }

    updateChart() {
        const canvas = document.getElementById('chartCanvas');
        const ctx = canvas.getContext('2d');

        // Sort sessions by date
        const sortedSessions = [...this.sessions].sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));

        if (sortedSessions.length === 0) {
            canvas.style.display = 'none';
            document.getElementById('noDataMessage').style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        document.getElementById('noDataMessage').style.display = 'none';

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;

        const padding = 60;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Get session averages
        const sessionAverages = sortedSessions.map(s => {
            if (s.lanci && s.lanci.length > 0) {
                return s.distanzaMedia || s.lanci.reduce((sum, l) => sum + l.distanza, 0) / s.lanci.length;
            }
            return 0;
        });

        const maxDistance = Math.max(...sessionAverages);
        const minDistance = Math.min(...sessionAverages);
        const range = maxDistance - minDistance || 1;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxDistance - (range / 5) * i;
            ctx.fillStyle = '#a0aec0';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1) + 'm', padding - 10, y + 4);
        }

        // Draw line
        ctx.strokeStyle = '#00D9FF';
        ctx.lineWidth = 3;
        ctx.beginPath();

        sortedSessions.forEach((session, i) => {
            const avg = sessionAverages[i];
            const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((avg - minDistance) / range) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        sortedSessions.forEach((session, i) => {
            const avg = sessionAverages[i];
            const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((avg - minDistance) / range) * chartHeight;

            // Outer circle
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#00D9FF';
            ctx.fill();

            // Inner circle
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#0A0E27';
            ctx.fill();
        });

        // X-axis labels (show max 10 labels)
        const labelInterval = Math.ceil(sortedSessions.length / 10);
        ctx.fillStyle = '#a0aec0';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        sortedSessions.forEach((session, i) => {
            if (i % labelInterval === 0 || i === sortedSessions.length - 1) {
                const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
                const date = new Date(session.dataInizio);
                const label = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                ctx.fillText(label, x, canvas.height - padding + 20);
            }
        });
    }

    updateRecentSessions() {
        const recentSessions = [...this.sessions]
            .sort((a, b) => new Date(b.dataInizio) - new Date(a.dataInizio))
            .slice(0, 3);

        const container = document.getElementById('recentCastsList');

        if (recentSessions.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessuna sessione registrata</p>';
            return;
        }

        container.innerHTML = recentSessions.map(session => this.createSessionCardHTML(session, true)).join('');
    }

    createSessionCardHTML(session, compact = false) {
        const date = new Date(session.dataInizio);
        const formattedDate = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const numLanci = session.lanci ? session.lanci.length : 0;
        const mediaDistanza = session.distanzaMedia ? session.distanzaMedia.toFixed(1) : '--';
        const maxDistanza = session.distanzaMassima ? session.distanzaMassima.toFixed(1) : '--';

        return `
            <div class="session-card" onclick="app.showSessionDetail(${session.id})">
                <div class="session-card-header">
                    <div>
                        <div class="session-card-title">${this.escapeHtml(session.luogo || 'Sessione')}</div>
                        <div class="session-card-date">${formattedDate} • ${formattedTime}</div>
                    </div>
                </div>
                <div class="session-card-stats">
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Lanci</span>
                        <span class="session-card-stat-value">${numLanci}</span>
                    </div>
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Media</span>
                        <span class="session-card-stat-value">${mediaDistanza}m</span>
                    </div>
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Massima</span>
                        <span class="session-card-stat-value">${maxDistanza}m</span>
                    </div>
                </div>
                <div class="session-card-info">
                    ${session.tecnica ? `<span>${this.escapeHtml(session.tecnica)}</span>` : ''}
                    ${session.pesoPiombo ? `<span>${this.escapeHtml(session.pesoPiombo)}</span>` : ''}
                    ${session.vento ? `<span>${this.escapeHtml(session.vento)}</span>` : ''}
                </div>
            </div>
        `;
    }

    createCastHTML(cast) {
        const date = new Date(cast.data);
        const formattedDate = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="cast-item">
                <div class="cast-distance">${cast.distanza.toFixed(1)}m</div>
                <div class="cast-info">
                    <div class="cast-technique">${cast.tecnica || 'N/A'}</div>
                    <div class="cast-details">
                        ${cast.pesoPiombo || 'N/A'}
                        ${cast.vento ? ' • ' + cast.vento : ''}
                        ${cast.luogo ? ' • ' + cast.luogo : ''}
                    </div>
                </div>
                <div>
                    <div class="cast-date">${formattedDate}</div>
                    <div class="cast-actions">
                        <button class="delete" data-id="${cast.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Filter History
    filterHistory() {
        const luogoFilter = document.getElementById('filter-luogo').value;
        const periodoFilter = parseInt(document.getElementById('filter-periodo').value);
        const sortBy = document.getElementById('sort-by').value;

        let filtered = [...this.sessions];

        // Filter by location
        if (luogoFilter && luogoFilter.trim()) {
            filtered = filtered.filter(s =>
                s.luogo && s.luogo.toLowerCase().includes(luogoFilter.toLowerCase())
            );
        }

        // Filter by period
        if (periodoFilter && periodoFilter !== 'tutti') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - periodoFilter);
            filtered = filtered.filter(s => new Date(s.dataInizio) >= cutoff);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'data-desc':
                    return new Date(b.dataInizio) - new Date(a.dataInizio);
                case 'data-asc':
                    return new Date(a.dataInizio) - new Date(b.dataInizio);
                default:
                    return 0;
            }
        });

        this.displaySessionHistory(filtered);
    }

    displaySessionHistory(sessions) {
        const container = document.getElementById('historySessionsList');

        if (sessions.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessuna sessione trovata</p>';
            return;
        }

        container.innerHTML = sessions.map(session => this.createSessionCardHTML(session)).join('');
    }

    showSessionDetail(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            this.showToast('Sessione non trovata', 'error');
            return;
        }

        // Hide sessions list, show detail view
        document.getElementById('sessionsList').style.display = 'none';
        document.getElementById('sessionDetail').style.display = 'block';

        // Update title
        document.getElementById('sessionDetailTitle').textContent = `Sessione del ${new Date(session.dataInizio).toLocaleDateString('it-IT')}`;

        // Populate session info
        const infoContainer = document.getElementById('sessionDetailInfo');
        infoContainer.innerHTML = this.createSessionInfoHTML(session);

        // Populate casts list
        const castsContainer = document.getElementById('sessionDetailCastsList');
        if (session.lanci && session.lanci.length > 0) {
            castsContainer.innerHTML = session.lanci.map((lancio, index) =>
                this.createCastDetailHTML(lancio, index + 1)
            ).join('');
        } else {
            castsContainer.innerHTML = '<p class="no-data-text">Nessun lancio in questa sessione</p>';
        }
    }

    showSessionsList() {
        document.getElementById('sessionsList').style.display = 'block';
        document.getElementById('sessionDetail').style.display = 'none';
        this.filterHistory(); // Refresh list
    }

    createSessionInfoHTML(session) {
        const dataInizio = new Date(session.dataInizio);
        const dataFine = session.dataFine ? new Date(session.dataFine) : null;

        const durata = dataFine ?
            Math.round((dataFine - dataInizio) / (1000 * 60)) :
            'In corso';

        const numLanci = session.lanci ? session.lanci.length : 0;
        let mediaDistanza = 0;
        let maxDistanza = 0;
        let minDistanza = 0;

        if (session.lanci && session.lanci.length > 0) {
            const distanze = session.lanci.map(l => l.distanza);
            mediaDistanza = session.distanzaMedia || (distanze.reduce((a, b) => a + b, 0) / distanze.length);
            maxDistanza = session.distanzaMassima || Math.max(...distanze);
            minDistanza = session.distanzaMinima || Math.min(...distanze);
        }

        return `
            <div class="session-header">
                <h3>📍 ${this.escapeHtml(session.luogo || 'N/A')}</h3>
                <div class="session-stats">
                    <span class="session-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        Durata: <strong>${typeof durata === 'number' ? durata + ' min' : durata}</strong>
                    </span>
                    <span class="session-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        Lanci: <strong>${numLanci}</strong>
                    </span>
                </div>
            </div>

            <div class="session-details">
                <div class="detail-section">
                    <h4>📊 Statistiche</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Media</span>
                            <span class="detail-value">${mediaDistanza.toFixed(1)}m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Massima</span>
                            <span class="detail-value">${maxDistanza.toFixed(1)}m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Minima</span>
                            <span class="detail-value">${minDistanza.toFixed(1)}m</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>🎣 Attrezzatura</h4>
                    <div class="detail-grid">
                        ${session.cannaModello ? `<div class="detail-item"><span class="detail-label">Canna</span><span class="detail-value">${this.escapeHtml(session.cannaModello)}</span></div>` : ''}
                        ${session.cannaLunghezza ? `<div class="detail-item"><span class="detail-label">Lunghezza</span><span class="detail-value">${session.cannaLunghezza}m</span></div>` : ''}
                        ${session.cannaGrammatura ? `<div class="detail-item"><span class="detail-label">Grammatura</span><span class="detail-value">${this.escapeHtml(session.cannaGrammatura)}</span></div>` : ''}
                        ${session.mulinello ? `<div class="detail-item"><span class="detail-label">Mulinello</span><span class="detail-value">${this.escapeHtml(session.mulinello)}</span></div>` : ''}
                        ${session.filo ? `<div class="detail-item"><span class="detail-label">Filo</span><span class="detail-value">${this.escapeHtml(session.filo)}</span></div>` : ''}
                        ${session.tecnica ? `<div class="detail-item"><span class="detail-label">Tecnica</span><span class="detail-value">${this.escapeHtml(session.tecnica)}</span></div>` : ''}
                        ${session.pesoPiombo ? `<div class="detail-item"><span class="detail-label">Piombo</span><span class="detail-value">${this.escapeHtml(session.pesoPiombo)}</span></div>` : ''}
                    </div>
                </div>

                ${session.vento || session.direzioneVento || session.temperatura || session.umidita ? `
                <div class="detail-section">
                    <h4>🌤️ Condizioni Iniziali</h4>
                    <div class="detail-grid">
                        ${session.vento ? `<div class="detail-item"><span class="detail-label">Vento</span><span class="detail-value">${this.escapeHtml(session.vento)}</span></div>` : ''}
                        ${session.direzioneVento ? `<div class="detail-item"><span class="detail-label">Direzione</span><span class="detail-value">${this.escapeHtml(session.direzioneVento)}</span></div>` : ''}
                        ${session.temperatura ? `<div class="detail-item"><span class="detail-label">Temperatura</span><span class="detail-value">${session.temperatura}°C</span></div>` : ''}
                        ${session.umidita ? `<div class="detail-item"><span class="detail-label">Umidità</span><span class="detail-value">${session.umidita}%</span></div>` : ''}
                    </div>
                </div>
                ` : ''}

                ${session.note ? `
                <div class="detail-section">
                    <h4>📝 Note Sessione</h4>
                    <p class="session-notes">${this.escapeHtml(session.note)}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    createCastDetailHTML(lancio, numero) {
        const data = new Date(lancio.data);
        const formattedTime = data.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="cast-detail-item">
                <div class="cast-detail-header">
                    <span class="cast-number">#${numero}</span>
                    <span class="cast-distance-large">${lancio.distanza.toFixed(1)}m</span>
                    <span class="cast-time">${formattedTime}</span>
                </div>
                ${lancio.vento || lancio.direzioneVento || lancio.temperatura || lancio.umidita || lancio.note ? `
                <div class="cast-detail-info">
                    ${lancio.vento ? `<span class="cast-info-badge">🌬️ ${this.escapeHtml(lancio.vento)}</span>` : ''}
                    ${lancio.direzioneVento ? `<span class="cast-info-badge">➜ ${this.escapeHtml(lancio.direzioneVento)}</span>` : ''}
                    ${lancio.temperatura ? `<span class="cast-info-badge">🌡️ ${lancio.temperatura}°C</span>` : ''}
                    ${lancio.umidita ? `<span class="cast-info-badge">💧 ${lancio.umidita}%</span>` : ''}
                    ${lancio.note ? `<div class="cast-note">${this.escapeHtml(lancio.note)}</div>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Profile Management
    saveProfile() {
        const formData = new FormData(document.getElementById('profileForm'));

        this.profile = {
            nome: formData.get('nome'),
            cognome: formData.get('cognome'),
            eta: parseInt(formData.get('eta')),
            sesso: formData.get('sesso'),
            altezza: parseInt(formData.get('altezza')),
            peso: parseFloat(formData.get('peso')),
            livello: formData.get('livello'),
            obiettivo: formData.get('obiettivo') ? parseFloat(formData.get('obiettivo')) : null,
            campoAllenamento: formData.get('campo-allenamento')
        };

        this.saveData();
        this.showToast('Profilo salvato con successo!', 'success');
    }

    loadProfile() {
        if (!this.profile) return;

        document.getElementById('nome').value = this.profile.nome || '';
        document.getElementById('cognome').value = this.profile.cognome || '';
        document.getElementById('eta').value = this.profile.eta || '';
        document.getElementById('sesso').value = this.profile.sesso || '';
        document.getElementById('altezza').value = this.profile.altezza || '';
        document.getElementById('peso').value = this.profile.peso || '';
        document.getElementById('livello').value = this.profile.livello || '';
        document.getElementById('obiettivo').value = this.profile.obiettivo || '';
        document.getElementById('campo-allenamento').value = this.profile.campoAllenamento || '';

        this.calculateBMI();
    }

    calculateBMI() {
        const peso = parseFloat(document.getElementById('peso').value);
        const altezza = parseFloat(document.getElementById('altezza').value);

        if (peso && altezza) {
            const bmi = peso / Math.pow(altezza / 100, 2);
            let category = '';

            if (bmi < 18.5) category = 'Sottopeso';
            else if (bmi < 25) category = 'Normale';
            else if (bmi < 30) category = 'Sovrappeso';
            else category = 'Obesità';

            document.getElementById('bmi').value = `${bmi.toFixed(1)} (${category})`;
        } else {
            document.getElementById('bmi').value = '';
        }
    }

    // Data Import/Export
    exportData() {
        const data = {
            sessions: this.sessions,
            profile: this.profile,
            suggestions: this.suggestions,
            exportDate: new Date().toISOString(),
            version: '2.0' // Session-based version
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `longcast-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Dati esportati con successo!', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (confirm('Importare i dati? Questo sovrascriverà i dati attuali.')) {
                    // Support both old (casts) and new (sessions) format
                    if (data.sessions) {
                        this.sessions = data.sessions;
                    } else if (data.casts) {
                        // Convert old format to new format
                        this.sessions = this.convertCastsToSessions(data.casts);
                    }

                    if (data.profile) this.profile = data.profile;

                    if (data.suggestions) {
                        this.suggestions = data.suggestions;
                    }

                    this.saveData();
                    this.saveSuggestions();
                    this.updateDashboard();
                    this.updateDatalistSuggestions();
                    this.loadProfile();

                    this.showToast('Dati importati con successo!', 'success');
                }
            } catch (error) {
                this.showToast('Errore durante l\'importazione dei dati', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    }

    convertCastsToSessions(casts) {
        // Group casts by date (same day = same session)
        const sessionMap = new Map();

        casts.forEach(cast => {
            const date = new Date(cast.data);
            const dateKey = date.toISOString().split('T')[0];

            if (!sessionMap.has(dateKey)) {
                sessionMap.set(dateKey, {
                    id: Date.now() + Math.random(),
                    dataInizio: cast.data,
                    dataFine: cast.data,
                    luogo: cast.luogo || 'Importato',
                    completata: true,
                    lanci: []
                });
            }

            const session = sessionMap.get(dateKey);
            session.lanci.push(cast);

            // Update session metadata from first cast
            if (session.lanci.length === 1) {
                session.tecnica = cast.tecnica;
                session.pesoPiombo = cast.pesoPiombo;
                session.cannaLunghezza = cast.cannaLunghezza;
                session.cannaGrammatura = cast.cannaGrammatura;
                session.mulinello = cast.mulinello;
                session.filo = cast.filo;
                session.vento = cast.vento;
                session.direzioneVento = cast.direzioneVento;
                session.temperatura = cast.temperatura;
                session.umidita = cast.umidita;
            }
        });

        // Calculate stats for each session
        const sessions = Array.from(sessionMap.values());
        sessions.forEach(session => {
            if (session.lanci.length > 0) {
                const distanze = session.lanci.map(l => l.distanza);
                session.distanzaMedia = distanze.reduce((a, b) => a + b, 0) / distanze.length;
                session.distanzaMassima = Math.max(...distanze);
                session.distanzaMinima = Math.min(...distanze);
            }
        });

        return sessions;
    }

    clearAllData() {
        if (confirm('Sei sicuro di voler eliminare TUTTI i dati? Questa azione è irreversibile!')) {
            if (confirm('Conferma ancora: eliminare tutti i dati?')) {
                this.sessions = [];
                this.profile = null;
                this.currentSession = null;
                this.suggestions = {
                    tecniche: [],
                    pesoPiombo: [],
                    vento: [],
                    direzioneVento: [],
                    cannaModello: [],
                    luoghi: [],
                    grammatura: [],
                    mulinello: [],
                    filo: []
                };
                localStorage.clear();
                sessionStorage.clear();

                this.updateDashboard();
                this.showSessionNotStarted();
                this.updateDatalistSuggestions();
                document.getElementById('profileForm').reset();

                this.showToast('Tutti i dati sono stati eliminati', 'warning');
            }
        }
    }

    // Utilities
    setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const datetime = now.toISOString().slice(0, 16);

        const sessionDataInput = document.getElementById('session-data');
        if (sessionDataInput) {
            sessionDataInput.value = datetime;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LongCastApp();
});
