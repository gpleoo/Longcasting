# Longcasting Pro 🎣

**App PWA moderna per il tracciamento e l'analisi del Long Casting**

Longcasting Pro è un'applicazione web progressiva (PWA) completa per gli appassionati di Long Casting (lancio da pesca a lunga distanza). Permette di tracciare le distanze di lancio tramite GPS, monitorare i miglioramenti nel tempo e gestire i propri dati fisici e preferenze.

## 🆕 Versione 1.6.0

- **PWA Completa**: installabile su dispositivi mobili con supporto offline
- **Multilingua**: supporto per Italiano, English, Español, Français
- **Accessibilità**: conforme WCAG con supporto screen reader
- **GPS Tracking**: tracciamento distanze con geolocalizzazione
- **Performance ottimizzate**: lazy loading, caching intelligente
- **Build System**: Vite per build ottimizzate

## ✨ Caratteristiche Principali

### 📊 Dashboard Interattiva
- **Statistiche in tempo reale**: distanza media, record personale, totale lanci
- **Grafici di progressione**: visualizzazione dell'andamento delle distanze nel tempo
- **Miglioramento percentuale**: calcolo automatico del progresso negli ultimi 30 giorni
- **Ultimi lanci**: riepilogo rapido delle ultime sessioni

### 🎯 Registrazione Lanci Dettagliata
- **Dati del lancio**: distanza, data/ora, peso piombo, tecnica utilizzata
- **Attrezzatura**: lunghezza canna, grammatura, mulinello, filo/shock leader
- **Condizioni meteo**: vento (intensità e direzione), temperatura
- **Note personalizzate**: annotazioni libere su sensazioni e punti da migliorare

### 📈 Storico e Analisi
- **Filtri avanzati**: per tecnica di lancio e periodo temporale
- **Ordinamento flessibile**: per data o distanza (crescente/decrescente)
- **Visualizzazione completa**: tutti i dettagli di ogni lancio

### 👤 Profilo Atleta
- **Dati personali**: nome, cognome, età, sesso
- **Dati fisici**: altezza, peso con calcolo automatico del BMI
- **Esperienza**: livello (principiante, intermedio, avanzato, professionista)
- **Obiettivi**: distanza target e campo di allenamento preferito

### 💾 Gestione Dati
- **Salvataggio automatico**: tutti i dati vengono salvati localmente nel browser
- **Esportazione**: backup completo in formato JSON
- **Importazione**: ripristino dati da backup precedenti
- **Privacy**: tutti i dati rimangono sul tuo dispositivo

## 🎨 Design e UX

- **Interfaccia moderna**: design ispirato a FishAI con gradienti e animazioni fluide
- **Dark Mode nativo**: interfaccia scura ottimizzata per ridurre l'affaticamento visivo
- **Completamente responsive**: funziona perfettamente su desktop, tablet e smartphone
- **Grafici personalizzati**: visualizzazioni create con Canvas HTML5

## 🛠️ Installazione e Sviluppo

### Requisiti
- Node.js 18+ (per sviluppo)
- Browser moderno con supporto ES6+

### Installazione Dipendenze
```bash
npm install
```

### Comandi Disponibili
```bash
npm run dev      # Avvia server di sviluppo (porta 3000)
npm run build    # Crea build ottimizzata in /dist
npm run preview  # Preview della build
npm run lint     # Esegue ESLint
npm run format   # Formatta codice con Prettier
npm run test     # Apre test runner nel browser
```

### Uso Senza Build
L'app funziona anche senza build system, aprendo direttamente `index.html`.

## 🧪 Test

Apri `tests/run-tests.html` nel browser per eseguire i test unitari.

```bash
npm run test
# oppure apri tests/run-tests.html direttamente
```

## 🚀 Come Utilizzare

### Apertura dell'App
1. Avvia con `npm run dev` oppure apri `index.html` nel browser
2. L'app funziona offline dopo la prima visita (PWA)

### Primo Utilizzo
1. Vai su **Profilo** e inserisci i tuoi dati personali
2. Salva il profilo

### Registrare un Lancio
1. Clicca su **Nuovo Lancio**
2. Compila i campi obbligatori (distanza, data, peso piombo, tecnica)
3. Aggiungi dettagli opzionali su attrezzatura e condizioni
4. Clicca su **Salva Lancio**

### Monitorare i Progressi
1. Torna alla **Dashboard** per vedere le statistiche aggiornate
2. Il grafico mostra l'andamento nel tempo
3. Controlla il miglioramento percentuale degli ultimi 30 giorni

### Consultare lo Storico
1. Vai su **Storico**
2. Usa i filtri per trovare lanci specifici
3. Ordina per data o distanza secondo le tue preferenze

## 📱 Compatibilità e Installazione PWA

### Browser Supportati
- ✅ Chrome/Edge (versioni recenti)
- ✅ Firefox (versioni recenti)
- ✅ Safari (versioni recenti)
- ✅ Browser mobile (iOS/Android)

### Installazione come App
**Android (Chrome):**
1. Apri l'app nel browser
2. Tocca il menu (tre puntini)
3. Seleziona "Aggiungi a schermata Home"

**iOS (Safari):**
1. Apri l'app in Safari
2. Tocca il pulsante Condividi
3. Seleziona "Aggiungi a schermata Home"

## ♿ Accessibilità

L'app è progettata per essere accessibile:
- Navigazione completa da tastiera
- Supporto screen reader (ARIA labels)
- Rispetto delle preferenze `prefers-reduced-motion`
- Contrasto colori conforme WCAG
- Skip link per contenuto principale
- Focus trap nei modali

## 🌍 Lingue Supportate

- 🇮🇹 Italiano (default)
- 🇬🇧 English
- 🇪🇸 Español
- 🇫🇷 Français

Cambia lingua dalle impostazioni o automaticamente in base al browser.

## 🔧 Tecnologie Utilizzate

- **HTML5**: struttura semantica, canvas per grafici, API Geolocation
- **CSS3**: design moderno con variabili CSS, gradients, animazioni, safe-area support
- **JavaScript ES6+**: architettura modulare senza dipendenze esterne
- **Service Worker**: caching offline e sincronizzazione background
- **LocalStorage/IndexedDB**: persistenza dati nel browser
- **Vite**: build system per ottimizzazione e bundling

## 📦 Struttura Progetto

```
Longcasting/
├── index.html          # Struttura principale dell'app
├── app.js              # Logica principale dell'applicazione
├── styles.css          # Stili principali
├── sw.js               # Service Worker per offline/caching
├── manifest.json       # PWA manifest
├── offline.html        # Pagina offline fallback
│
├── js/                 # Moduli JavaScript
│   ├── utils.js        # Utility functions (debounce, throttle, etc.)
│   ├── DataManager.js  # Gestione storage e dati
│   ├── GPSTracker.js   # Tracciamento GPS con Haversine
│   ├── i18n.js         # Internazionalizzazione (IT, EN, ES, FR)
│   ├── Validator.js    # Validazione dati e backup
│   ├── Performance.js  # Ottimizzazioni performance
│   └── Accessibility.js # Accessibilità (a11y)
│
├── css/                # Stili modulari
│   ├── mobile.css      # Ottimizzazioni iOS/Android
│   └── accessibility.css # Stili accessibilità
│
├── tests/              # Test suite
│   ├── utils.test.js   # Test utility functions
│   ├── validator.test.js # Test validazione
│   └── run-tests.html  # Test runner browser
│
├── assets/             # Risorse statiche
│   └── icons/          # Icone PWA
│
├── vite.config.js      # Configurazione Vite
├── package.json        # Dependencies e scripts
├── .eslintrc.json      # Configurazione ESLint
├── .prettierrc         # Configurazione Prettier
└── README.md           # Documentazione
```

## 🎯 Campi Supportati

### Tecniche di Lancio
- Overhead
- Pendulum
- Ground Cast
- Off-Ground
- Altro

### Condizioni Vento
- Calmo
- Leggero (1-10 km/h)
- Moderato (10-20 km/h)
- Forte (20+ km/h)

### Direzione Vento
- A favore
- Contrario
- Laterale

## 💡 Suggerimenti

1. **Registra ogni lancio**: più dati hai, più accurate saranno le statistiche
2. **Annota le condizioni**: ti aiuterà a capire come influenzano le tue prestazioni
3. **Esporta regolarmente**: crea backup dei tuoi dati per sicurezza
4. **Monitora il BMI**: può influire sulle prestazioni nel long casting
5. **Imposta un obiettivo**: avere un target di distanza ti motiva a migliorare

## 🔒 Privacy e Sicurezza

Tutti i dati vengono salvati **esclusivamente sul tuo dispositivo** tramite LocalStorage. Nessun dato viene inviato a server esterni. Sei tu il proprietario assoluto delle tue informazioni.

## 📄 Licenza

Questo progetto è open source e disponibile per uso personale e educativo.

## 📝 Changelog

### v1.6.0
- Architettura modulare JavaScript
- PWA con supporto offline completo
- Internazionalizzazione (4 lingue)
- Sistema di validazione dati
- Ottimizzazioni mobile iOS/Android
- Accessibilità WCAG
- Sistema di build con Vite
- Test suite

### v1.0.0
- Release iniziale

---

**Sviluppato con ❤️ per la comunità del Long Casting**