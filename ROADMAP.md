# 🗺️ Roadmap di miglioramento — Longcasting Pro

> Documento di pianificazione tecnica. Analisi effettuata il **2026-06-04** sulla
> base del codice presente (PWA vanilla JS, nessun backend, dati su `localStorage`).
> Le voci sono ordinate per priorità: **P0** (critico/sicurezza), **P1** (alto valore),
> **P2** (miglioramento), **P3** (nice‑to‑have).
> I riferimenti `file:riga` sono verificati sul codice attuale.

## Sintesi

Longcasting Pro è una PWA solida e già ricca (GPS, AI Coach, achievement, report,
mappa Leaflet, i18n, accessibilità, backup automatici). Le aree con il maggior
ritorno sono tre:

1. **Cybersicurezza** — alcune iniezioni HTML non sanificate e import dati non validato.
2. **Misurazioni GPS** — il vero punto distintivo dell'app: oggi la precisione è
   "amatoriale"; con poche tecniche si può portare a livello "competizione".
3. **Architettura/qualità** — `app.js` è un monolite da ~236 KB difficile da mantenere
   e la pipeline di build (Vite/ESLint) non è realmente collegata.

---

## ✅ Avanzamento

**Fase 1 — Sicurezza (2026-06-04)**

- ✅ **SEC‑2 / SEC‑3** — sink XSS `cast.note` e `${d.value}` ora escapizzati con `escapeHtml`.
- ✅ **SEC‑1** — import file validato con `DataManager.validateImport()`; i file non riconosciuti vengono rifiutati prima di toccare `localStorage`.
- ✅ **SEC‑4** — aggiunta Content‑Security‑Policy in `index.html`; i 7 `onclick` inline (4 in `app.js` + 3 in `index.html`) convertiti a event delegation `[data-action]`.
- ✅ **SEC‑5** — verificato: Leaflet ha **già** `integrity` (SRI) + `crossOrigin` → nessuna azione necessaria.

**Fase 2 — Misure GPS (2026-06-04)**

- ✅ **GPS‑4** — `getAveragePosition` ora pesa i punti per `1/accuracy²` (i fix più precisi contano di più).
- ✅ **GPS‑3** — incertezza della distanza propagata (`σ_d=√(σ_start²+σ_end²)`), mostrata nel modale di conferma (`212.4 m ± 6.8 m`) e nel popup mappa, e salvata in `cast.gps.incertezzaDistanza`.
- ✅ **GPS‑1** — punto perno **mediato nel tempo** (`acquireStablePosition`, 5–12 s, gate di qualità) con fallback automatico al flusso di retry.
- 🧪 Aggiunti unit test della matematica GPS (`tests/gpstracker.test.js`, eseguibili con `npm test`).

> ⚠️ Le modifiche GPS sono verificate con unit test sulla **matematica**, ma il comportamento **live** va collaudato su telefono reale.
> Prossimi: **GPS‑2** (UI misura statica dell'arrivo — la primitiva `acquireStablePosition` è già pronta), **GPS‑6** (warm‑up/soglie adattive), **GPS‑7** (cerchi di accuratezza in mappa).

---

## 1) 🔐 Cybersicurezza

Contesto: l'app **non ha backend né autenticazione** (è single‑user, locale). Quindi
non ci sono rischi server‑side, ma i dati (inclusa la **cronologia di posizioni GPS
precise**) vivono in chiaro sul dispositivo e l'app espone **import/export di file**,
che è il principale vettore d'attacco realistico.

| ID | Pri | Problema | Dove | Azione |
|----|-----|----------|------|--------|
| SEC‑1 | ✅ **FATTO** | **XSS via import**: `importData()` assegnava `data.sessions/profile/suggestions` senza validare. | `app.js:4331` | Import ora validato con `DataManager.validateImport()`; file non riconosciuti rifiutati. Scelta: **escape coerente in output** (SEC‑2/3) anziché `sanitizeObject` a riposo, per non corrompere/raddoppiare l'encoding dei testi. |
| SEC‑2 | ✅ **FATTO** | **XSS nel DOM**: `cast.note` iniettato grezzo in `innerHTML` (nei popup mappa era già escapizzato → incoerenza). | `app.js:3031` | Ora `this.escapeHtml(cast.note)`. |
| SEC‑3 | ✅ **FATTO** | **XSS nel DOM**: dettagli sessione `${d.value}` senza escape (vento, direzione vento sono testo libero). | `app.js:2873‑2880` | Ora `this.escapeHtml(String(d.value))`. |
| SEC‑4 | ✅ **FATTO** | **Nessuna Content‑Security‑Policy** (difesa di profondità contro XSS residuo). | `index.html` (`<head>`) | Aggiunta CSP `default-src 'self'` + `unpkg.com`/`*.tile.openstreetmap.org`; rimossi i 7 `onclick` inline (→ event delegation) per usare `script-src` senza `'unsafe-inline'`. |
| SEC‑5 | ✅ **GIÀ OK** | **Leaflet da CDN**: verificato che SRI (`integrity`) + `crossOrigin` sono **già impostati**. | `app.js:1550‑1551, 1557‑1558` | Nessuna azione. Opzionale: auto‑ospitare Leaflet per eliminare del tutto la dipendenza da CDN. |
| SEC‑6 | **P1** | **Dati a riposo in chiaro** su `localStorage` (posizioni GPS = dato personale sensibile). | `js/DataManager.js` | Cifratura opzionale lato client (Web Crypto API + passphrase/PIN) almeno per i campi GPS; vedi anche PRIV‑1. |
| SEC‑7 | **P2** | **Audit completo dei sink `innerHTML`** (34 assegnazioni in `app.js`): garantire che ogni campo utente/importato passi da `escapeHtml`. | `app.js` (vari) | Introdurre un helper unico `safeHtml`/template tag e vietare `innerHTML` grezzo via regola ESLint. |
| SEC‑8 | **P2** | **Service worker** mette in `RUNTIME_CACHE` qualunque risposta `ok`, senza limiti di origine/size. | `sw.js:104‑108` | Limitare la cache di runtime alle origini note e impostare un budget/eviction. |
| SEC‑9 | **P2** | **`document.write(html)`** nella stampa report: se include note/luogo utente non sanificati → XSS nella finestra di stampa. | `js/Reports.js:792` | Sanificare l'HTML del report o costruirlo con nodi DOM/`textContent`. |
| SEC‑10 | **P3** | `share_target` dichiarato nel manifest ma i parametri non sono gestiti (feature morta). | `manifest.json:116‑124` | Implementarlo con parsing sicuro oppure rimuoverlo. |
| SEC‑11 | **P3** | Mismatch path icone push (`/icon-192.png`) vs manifest (`assets/icons/...`). | `sw.js:217‑219` | Allineare i percorsi. |

**Stato Fase 1**: ✅ SEC‑1/2/3/4 completati, SEC‑5 già a posto. Restano **SEC‑6→11** (cifratura dati a riposo, audit completo `innerHTML`, cache SW, stampa report, ecc.).

---

## 2) 📍 Misurazioni GPS (priorità del progetto)

**Come misura oggi**: a campo si fissa un *punto perno* (una singola lettura
`getCurrentPosition` a inizio sessione), poi per ogni lancio si cammina fino al
piombo e la posizione finale è la media degli ultimi N punti; la distanza è la
Haversine perno→arrivo. A mare la distanza deriva dai giri di mulinello
(`ReelCalculator`). Filtri attuali: scarta accuracy > 50 m e velocità > 15 m/s,
media dei primi/ultimi ≤10 punti, finestra di smoothing 3
(`js/GPSTracker.js:25‑33, 233‑336`).

**Problema di fondo**: il GPS di uno smartphone ha errore tipico **3–10 m** (spesso
peggio). Su un lancio di ~200 m, l'errore combinato di due punti (perno + arrivo) si
somma in quadratura → **±7–14 m**, cioè **3–7%**: troppo per il long casting dove i
record si giocano sul metro. Ecco come passare da "amatoriale" a "ottimo":

| ID | Pri | Miglioramento | Perché | Riferimento |
|----|-----|---------------|--------|-------------|
| GPS‑1 | ✅ **FATTO** | **Punto perno mediato**: prima singola lettura → ora mediato nel tempo con `acquireStablePosition` (gate di qualità, 5–12 s, fallback). | Massimo effetto leva: l'errore del perno è comune a tutti i lanci. | `app.js` acquireGPSWithRetry; `js/GPSTracker.js` |
| GPS‑2 | **P0** — primitiva pronta | **Modalità "misura punto d'arrivo" statica** con barra di convergenza live. Manca solo la **UI**: la primitiva `acquireStablePosition` è già disponibile e testata. | Punti in movimento = rumore; la media statica abbatte l'errore. | `js/GPSTracker.js` acquireStablePosition |
| GPS‑3 | ✅ **FATTO** | **Incertezza sulla DISTANZA**: `m ± Δ` propagando `σ_d=√(σ_start²+σ_end²)`; mostrata nel modale di conferma e nel popup mappa, salvata in `cast.gps.incertezzaDistanza`. | L'utente vede l'incertezza reale del risultato, non solo l'accuracy del tracciato. | `js/GPSTracker.js` calculateFinalStats; `app.js` showGPSConfirmModal |
| GPS‑4 | ✅ **FATTO** | **Media pesata per accuratezza** (peso `1/accuracy²`) in `getAveragePosition`. | I punti più precisi devono contare di più: stima migliore senza nuovo hardware. | `js/GPSTracker.js` getAveragePosition |
| GPS‑5 | **P1** | **Calibrazione su baseline nota**: misurare una distanza nota a campo (es. fettuccia da 50/100 m) e calcolare correzione di scala/bias per sessione + un "indice di qualità GPS del giorno". | Misura differenziale: l'errore assoluto è in gran parte comune e si annulla sulla distanza relativa. | nuovo modulo |
| GPS‑6 | **P1** | **Warm‑up e soglie adattive**: scartare i primi secondi (i primi fix sono i peggiori); `minAccuracy: 50 m` è troppo permissivo per misure al metro → renderlo adattivo e avvisare se non si raggiunge < 10 m. | Migliora la qualità del dato in ingresso a costo zero. | `js/GPSTracker.js:25‑33, 143‑147` |
| GPS‑7 | **P1** | **Cerchi di accuratezza in mappa**: disegnare un `L.circle` con raggio = accuracy su perno e arrivo, così l'incertezza è visibile. | Rende l'errore intuitivo e onesto. | `app.js:~4958` (marker mappa) |
| GPS‑8 | **P2** | **Filtro più robusto** (Kalman/median sui residui) e revisione di `getSmoothedDistance` (lo scaling `*ratio` è discutibile). | Riduce outlier e jitter del display realtime. | `js/GPSTracker.js:261‑283` |
| GPS‑9 | **P2** | **Fusione sensori per il bearing**: derivare l'angolo del lancio anche dalla bussola (`DeviceOrientation`) invece che da due soli punti rumorosi. | Bearing più stabile, utile per il cono di campo ±15°. | bearing: `js/GPSTracker.js:216‑231`; cono: `app.js:~5052` |
| GPS‑10 | **P2** | **Esporta tracce in GPX/GeoJSON**: per verifica esterna e analisi (utile in gara/club). | Trasparenza e interoperabilità. | export: `app.js:~4320` |
| GPS‑11 | **P3** | **Rilevamento GNSS dual‑frequency (L1/L5)** e suggerimenti d'uso (telefono in alto, cielo libero, fermo N secondi). | I telefoni dual‑band sono molto più precisi: guidare l'utente al meglio possibile. | guida in‑app |
| GPS‑12 | **P3** | **Supporto ricevitore esterno Bluetooth GNSS/RTK** (Web Bluetooth) per uso club/competizione sub‑metrico. | Tier "ottimo" reale: precisione cm/dm. | nuovo modulo |
| GPS‑13 | **P3** | **Test di ripetibilità in‑app**: misurare due volte un punto noto e riportare l'errore reale del dispositivo "oggi". | Dà fiducia e confronto tra telefoni. | nuovo modulo |

> **Nota tecnica**: il numero di satelliti / HDOP **non** è esposto dall'API Geolocation
> standard del browser; per quel dettaglio serve un ricevitore esterno (GPS‑12). Questo
> va comunicato nella UI per non promettere ciò che il browser non può dare.

**Percorso consigliato per "misure ottime"**: GPS‑1 + GPS‑2 + GPS‑3 (perno e arrivo
mediati staticamente + incertezza onesta) danno il salto di qualità maggiore; GPS‑4/5/6
consolidano; GPS‑12 (RTK) è il livello competizione.

---

## 3) 🏗️ Architettura e qualità del codice

| ID | Pri | Problema | Azione |
|----|-----|----------|--------|
| ARC‑1 | **P1** | `app.js` è un monolite (~236 KB, ~6000 righe, classe "god object"). | Spezzare per dominio (Sessioni, Mappa, Report, GPS‑UI…) in moduli ES reali. |
| ARC‑2 | **P1** | `package.json` dichiara `type: module` + Vite/PWA, ma `index.html` carica `<script src>` con globali `window.*`: la build non è davvero usata. | Adottare import/export ES e il bundling Vite (tree‑shaking, hashing, `vite-plugin-pwa` per il SW). |
| ARC‑3 | **P1** | Test minimi (solo `utils`/`validator`) eseguiti via pagina HTML, **nessuna CI**. | Migrare a **Vitest** + **GitHub Actions** (lint, format, test su ogni PR). C'è già una skill `session-start-hook` per predisporlo. |
| ARC‑4 | **P2** | Nessun controllo di tipo su una codebase ampia. | Introdurre **JSDoc + `checkJs`** o migrazione graduale a **TypeScript**. |
| ARC‑5 | **P2** | Logica e UI fortemente accoppiate (manipolazione DOM ovunque). | Estrarre la logica pura (calcoli GPS/statistiche) da rendere testabile a parte. |

---

## 4) 🛡️ Dati e privacy (GDPR)

| ID | Pri | Tema | Azione |
|----|-----|------|--------|
| PRIV‑1 | **P1** | Posizioni GPS = dato personale; oggi in chiaro e senza informativa. | Aggiungere **privacy policy** in‑app, consenso esplicito all'uso GPS, e cifratura opzionale (vedi SEC‑6). |
| PRIV‑2 | **P1** | `localStorage` ha ~5 MB: le tracce con `allPoints` crescono in fretta (rischio perdita dati). | Migrare a **IndexedDB**; `DataManager.getStorageInfo()` mostra già la % usata. |
| PRIV‑3 | **P2** | Dati solo sul dispositivo: smarrire il telefono = perdere tutto (lo stub `syncSessions` non fa nulla). | Backup/sync cloud **cifrato end‑to‑end** opzionale; oppure export automatico schedulato. |
| PRIV‑4 | **P2** | Diritto alla cancellazione/portabilità. | "Esporta tutti i dati" (già presente) + "Cancella tutto" esplicito e documentato. |

---

## 5) 🎨 UX / PWA

| ID | Pri | Tema | Azione |
|----|-----|------|--------|
| UX‑1 | **P2** | Feedback di qualità GPS poco evidente durante la misura. | Indicatore live di convergenza/qualità + suggerimenti contestuali (collega GPS‑2/6). |
| UX‑2 | **P2** | `offline.html` è escluso dal precache ma referenziato come fallback. | Verificare/correggere la strategia offline del SW (`sw.js:44`, `116`). |
| UX‑3 | **P3** | Onboarding/tutorial al primo avvio. | Mini guida ai metodi di misura (campo vs mare, perno, calibrazione). |
| UX‑4 | **P3** | Attribuzione OpenStreetMap. | Assicurare l'attribuzione OSM in mappa (requisito di licenza). |

---

## 📅 Piano a fasi

**Fase 1 — Sicurezza & quick win (1 settimana)**
`SEC‑1`, `SEC‑2`, `SEC‑3`, `SEC‑4`, `SEC‑5` → chiude il rischio XSS reale e aggiunge CSP/SRI.

**Fase 2 — Misure GPS di livello (2–4 settimane)**
`GPS‑1`, `GPS‑2`, `GPS‑3`, poi `GPS‑4`, `GPS‑6`, `GPS‑7` → salto netto di precisione e onestà del dato.

**Fase 3 — Fondamenta tecniche (parallela/continua)**
`ARC‑2`, `ARC‑3` (build reale + CI/test), `PRIV‑2` (IndexedDB).

**Fase 4 — Privacy & robustezza (2–3 settimane)**
`SEC‑6`/`PRIV‑1` (cifratura + consenso), `PRIV‑3` (sync cifrato), `SEC‑7`/`SEC‑9` (audit XSS, stampa).

**Fase 5 — Eccellenza "competizione" (backlog)**
`GPS‑5` (calibrazione baseline), `GPS‑10` (GPX/GeoJSON), `GPS‑12` (RTK Bluetooth), `GPS‑13` (test ripetibilità), `ARC‑4` (TypeScript).

---

*Roadmap generata analizzando il codice del branch `claude/gallant-ptolemy-zNOjQ`. Aggiornare le voci man mano che vengono completate.*
