// LongCast Pro - Main Application
class LongCastApp {
    constructor() {
        this.casts = [];
        this.profile = null;
        this.chart = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.loadProfile();
        this.setDefaultDateTime();
    }

    // Data Management
    loadData() {
        const savedCasts = localStorage.getItem('longcast_casts');
        const savedProfile = localStorage.getItem('longcast_profile');

        if (savedCasts) {
            this.casts = JSON.parse(savedCasts);
        }

        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
        }
    }

    saveData() {
        localStorage.setItem('longcast_casts', JSON.stringify(this.casts));
        if (this.profile) {
            localStorage.setItem('longcast_profile', JSON.stringify(this.profile));
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigate(e.target.dataset.section));
        });

        // New Cast Form
        document.getElementById('newCastForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCast();
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
        document.getElementById('filter-tecnica').addEventListener('change', () => this.filterHistory());
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
        }
    }

    // Add New Cast
    addCast() {
        const formData = new FormData(document.getElementById('newCastForm'));

        const cast = {
            id: Date.now(),
            distanza: parseFloat(formData.get('distanza')),
            data: formData.get('data'),
            pesoPiombo: parseFloat(formData.get('peso-piombo')),
            tecnica: formData.get('tecnica'),
            cannaLunghezza: formData.get('canna-lunghezza') ? parseFloat(formData.get('canna-lunghezza')) : null,
            cannaGrammatura: formData.get('canna-grammatura'),
            mulinello: formData.get('mulinello'),
            filo: formData.get('filo'),
            vento: formData.get('vento'),
            direzioneVento: formData.get('direzione-vento'),
            temperatura: formData.get('temperatura') ? parseFloat(formData.get('temperatura')) : null,
            luogo: formData.get('luogo'),
            note: formData.get('note')
        };

        this.casts.push(cast);
        this.saveData();

        this.showToast('Lancio salvato con successo!', 'success');
        document.getElementById('newCastForm').reset();
        this.setDefaultDateTime();

        this.updateDashboard();
    }

    // Delete Cast
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
                const id = parseInt(btn.dataset.id);
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

        const tecnicaLabels = {
            'overhead': 'Overhead',
            'pendulum': 'Pendulum',
            'ground': 'Ground Cast',
            'off-ground': 'Off-Ground',
            'altro': 'Altro'
        };

        return `
            <div class="cast-item">
                <div class="cast-distance">${cast.distanza.toFixed(1)}m</div>
                <div class="cast-info">
                    <div class="cast-technique">${tecnicaLabels[cast.tecnica] || cast.tecnica}</div>
                    <div class="cast-details">
                        ${cast.pesoPiombo}g
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
                const id = parseInt(btn.dataset.id);
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
                localStorage.clear();

                this.updateDashboard();
                document.getElementById('profileForm').reset();

                this.showToast('Tutti i dati sono stati eliminati', 'warning');
            }
        }
    }

    // Utilities
    setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('data').value = now.toISOString().slice(0, 16);
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
