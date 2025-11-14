// LongCast Pro - Main Application
class LongCastApp {
    constructor() {
        this.casts = [];
        this.profile = null;
        this.chart = null;
        this.currentSession = null; // Active training session
        this.suggestions = {
            tecniche: [],
            pesoPiombo: [],
            vento: [],
            direzioneVento: [],
            cannaModello: []
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
        const savedCasts = localStorage.getItem('longcast_casts');
        const savedProfile = localStorage.getItem('longcast_profile');
        const savedSession = sessionStorage.getItem('longcast_active_session');

        if (savedCasts) {
            this.casts = JSON.parse(savedCasts);
        }

        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
        }

        if (savedSession) {
            this.currentSession = JSON.parse(savedSession);
        }
    }

    saveData() {
        localStorage.setItem('longcast_casts', JSON.stringify(this.casts));
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
        document.getElementById('filter-tecnica').addEventListener('input', () => this.filterHistory());
        document.getElementById('filter-periodo').addEventListener('change', () => this.filterHistory());
        document.getElementById('sort-by').addEventListener('change', () => this.filterHistory());

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

        this.currentSession = {
            id: Date.now(),
            dataInizio: formData.get('session-data'),
            luogo: formData.get('session-luogo'),
            pesoPiombo: pesoPiombo,
            tecnica: tecnica,
            cannaModello: cannaModello,
            cannaLunghezza: formData.get('session-canna-lunghezza') ? parseFloat(formData.get('session-canna-lunghezza')) : null,
            cannaGrammatura: formData.get('session-canna-grammatura'),
            mulinello: formData.get('session-mulinello'),
            filo: formData.get('session-filo'),
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
            `Tutti i lanci verranno salvati nello storico.`
        );

        if (!confirmation) return;

        // Save all casts from session to main casts array
        this.currentSession.lanci.forEach(lancio => {
            const cast = {
                id: Date.now() + Math.random(), // Unique ID
                distanza: lancio.distanza,
                data: lancio.orario,
                pesoPiombo: this.currentSession.pesoPiombo,
                tecnica: this.currentSession.tecnica,
                cannaModello: this.currentSession.cannaModello,
                cannaLunghezza: this.currentSession.cannaLunghezza,
                cannaGrammatura: this.currentSession.cannaGrammatura,
                mulinello: this.currentSession.mulinello,
                filo: this.currentSession.filo,
                vento: this.currentSession.vento,
                direzioneVento: this.currentSession.direzioneVento,
                temperatura: this.currentSession.temperatura,
                umidita: this.currentSession.umidita,
                luogo: this.currentSession.luogo,
                note: lancio.note || '',
                sessionId: this.currentSession.id
            };

            this.casts.push(cast);
        });

        this.saveData();

        // Clear session
        this.currentSession = null;
        this.saveSession();

        this.showToast('Sessione di allenamento terminata! Tutti i lanci sono stati salvati.', 'success');

        // Update UI
        this.showSessionNotStarted();
        this.updateDashboard();

        // Reset form
        this.setDefaultDateTime();
    }

    // Delete Cast (from history)
    deleteCast(id) {
        if (confirm('Sei sicuro di voler eliminare questo lancio?')) {
            this.casts = this.casts.filter(c => c.id !== id);
            this.saveData();
            this.showToast('Lancio eliminato', 'success');
            this.updateDashboard();
            this.filterHistory();
        }
    }

    // Update Dashboard
    updateDashboard() {
        if (this.casts.length === 0) {
            this.showEmptyDashboard();
            return;
        }

        this.updateStats();
        this.updateChart();
        this.updateRecentCasts();
    }

    showEmptyDashboard() {
        document.getElementById('stat-media').textContent = '-- m';
        document.getElementById('stat-record').textContent = '-- m';
        document.getElementById('stat-totale').textContent = '0';
        document.getElementById('stat-miglioramento').textContent = '-- %';

        document.getElementById('chartCanvas').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';

        document.getElementById('recentCastsList').innerHTML = '<p class="no-data-text">Nessun lancio registrato</p>';
    }

    updateStats() {
        const distanze = this.casts.map(c => c.distanza);

        // Media
        const media = distanze.reduce((a, b) => a + b, 0) / distanze.length;
        document.getElementById('stat-media').textContent = media.toFixed(1) + ' m';

        // Record
        const record = Math.max(...distanze);
        document.getElementById('stat-record').textContent = record.toFixed(1) + ' m';

        // Totale
        document.getElementById('stat-totale').textContent = this.casts.length;

        // Miglioramento 30 giorni
        const improvement = this.calculateImprovement(30);
        const improvementText = improvement !== null ?
            (improvement > 0 ? '+' : '') + improvement.toFixed(1) + '%' :
            '-- %';
        document.getElementById('stat-miglioramento').textContent = improvementText;
    }

    calculateImprovement(days) {
        const now = new Date();
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const recentCasts = this.casts.filter(c => new Date(c.data) >= cutoff);
        const olderCasts = this.casts.filter(c => new Date(c.data) < cutoff);

        if (recentCasts.length === 0 || olderCasts.length === 0) {
            return null;
        }

        const recentAvg = recentCasts.reduce((sum, c) => sum + c.distanza, 0) / recentCasts.length;
        const olderAvg = olderCasts.reduce((sum, c) => sum + c.distanza, 0) / olderCasts.length;

        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    updateChart() {
        const canvas = document.getElementById('chartCanvas');
        const ctx = canvas.getContext('2d');

        // Sort casts by date
        const sortedCasts = [...this.casts].sort((a, b) => new Date(a.data) - new Date(b.data));

        if (sortedCasts.length === 0) {
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

        // Get data
        const distances = sortedCasts.map(c => c.distanza);
        const maxDistance = Math.max(...distances);
        const minDistance = Math.min(...distances);
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

        sortedCasts.forEach((cast, i) => {
            const x = padding + (chartWidth / (sortedCasts.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((cast.distanza - minDistance) / range) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        sortedCasts.forEach((cast, i) => {
            const x = padding + (chartWidth / (sortedCasts.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((cast.distanza - minDistance) / range) * chartHeight;

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
        const labelInterval = Math.ceil(sortedCasts.length / 10);
        ctx.fillStyle = '#a0aec0';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        sortedCasts.forEach((cast, i) => {
            if (i % labelInterval === 0 || i === sortedCasts.length - 1) {
                const x = padding + (chartWidth / (sortedCasts.length - 1 || 1)) * i;
                const date = new Date(cast.data);
                const label = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                ctx.fillText(label, x, canvas.height - padding + 20);
            }
        });
    }

    updateRecentCasts() {
        const recentCasts = [...this.casts]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        const container = document.getElementById('recentCastsList');

        if (recentCasts.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessun lancio registrato</p>';
            return;
        }

        container.innerHTML = recentCasts.map(cast => this.createCastHTML(cast)).join('');

        // Add delete listeners
        container.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.dataset.id);
                this.deleteCast(id);
            });
        });
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
        const tecnicaFilter = document.getElementById('filter-tecnica').value;
        const periodoFilter = parseInt(document.getElementById('filter-periodo').value);
        const sortBy = document.getElementById('sort-by').value;

        let filtered = [...this.casts];

        // Filter by technique
        if (tecnicaFilter) {
            filtered = filtered.filter(c => c.tecnica === tecnicaFilter);
        }

        // Filter by period
        if (periodoFilter && periodoFilter !== 'tutti') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - periodoFilter);
            filtered = filtered.filter(c => new Date(c.data) >= cutoff);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'data-desc':
                    return new Date(b.data) - new Date(a.data);
                case 'data-asc':
                    return new Date(a.data) - new Date(b.data);
                case 'distanza-desc':
                    return b.distanza - a.distanza;
                case 'distanza-asc':
                    return a.distanza - b.distanza;
                default:
                    return 0;
            }
        });

        this.displayHistory(filtered);
    }

    displayHistory(casts) {
        const container = document.getElementById('historyCastsList');

        if (casts.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessun lancio trovato</p>';
            return;
        }

        container.innerHTML = casts.map(cast => this.createCastHTML(cast)).join('');

        // Add delete listeners
        container.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.dataset.id);
                this.deleteCast(id);
            });
        });
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
            casts: this.casts,
            profile: this.profile,
            exportDate: new Date().toISOString()
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
                    if (data.casts) this.casts = data.casts;
                    if (data.profile) this.profile = data.profile;

                    this.saveData();
                    this.updateDashboard();
                    this.loadProfile();

                    this.showToast('Dati importati con successo!', 'success');
                }
            } catch (error) {
                this.showToast('Errore durante l\'importazione dei dati', 'error');
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    }

    clearAllData() {
        if (confirm('Sei sicuro di voler eliminare TUTTI i dati? Questa azione è irreversibile!')) {
            if (confirm('Conferma ancora: eliminare tutti i dati?')) {
                this.casts = [];
                this.profile = null;
                this.currentSession = null;
                this.suggestions = {
                    tecniche: [],
                    pesoPiombo: [],
                    vento: [],
                    direzioneVento: [],
                    cannaModello: []
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
document.addEventListener('DOMContentLoaded', () => {
    new LongCastApp();
});
