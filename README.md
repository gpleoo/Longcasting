# Longcasting Pro

**App per il tracciamento e l'analisi del Long Casting**

Longcasting Pro è un'applicazione web per gli appassionati di Long Casting (lancio da pesca a lunga distanza). Permette di registrare le sessioni di allenamento, misurare le distanze tramite GPS, analizzare i progressi nel tempo e gestire tutti i dati del tuo allenamento direttamente dal telefono.

---

## Indice

1. [Come aprire l'app](#come-aprire-lapp)
2. [Navigazione](#navigazione)
3. [Dashboard](#dashboard)
4. [Sessione di allenamento](#sessione-di-allenamento)
   - [Avviare una sessione](#avviare-una-sessione)
   - [Misurare la distanza con GPS](#misurare-la-distanza-con-gps)
   - [Inserimento manuale della distanza](#inserimento-manuale-della-distanza)
   - [Orientamento del campo su mappa](#orientamento-del-campo-su-mappa)
   - [Terminare la sessione](#terminare-la-sessione)
5. [Sessione in mare (giri mulinello)](#sessione-in-mare-giri-mulinello)
6. [Storico sessioni](#storico-sessioni)
7. [Coach AI](#coach-ai)
8. [Achievement](#achievement)
9. [Report](#report)
10. [Partner](#partner)
11. [Profilo atleta](#profilo-atleta)
12. [Impostazioni e backup](#impostazioni-e-backup)
13. [Installazione come app sul telefono](#installazione-come-app-sul-telefono)
14. [Risoluzione problemi](#risoluzione-problemi)

---

## Come aprire l'app

L'app funziona direttamente nel browser, senza installazione obbligatoria.

- Avvia con `npm run dev` oppure apri il file `index.html` nel browser
- Funziona offline dopo la prima visita (tecnologia PWA)
- Puoi installarla sulla schermata home del telefono per un'esperienza da app nativa (vedi [Installazione come app sul telefono](#installazione-come-app-sul-telefono))

---

## Navigazione

In alto trovi il menu principale con queste sezioni:

| Voce | Funzione |
|---|---|
| **Dashboard** | Panoramica delle statistiche e dei progressi |
| **Sessione** | Avvia e gestisci una sessione di allenamento |
| **Storico** | Consulta tutte le sessioni passate |
| **Coach AI** | Analisi personalizzata e consigli di allenamento |
| **Achievement** | Badge, livelli e progressi |
| **Report** | Statistiche avanzate ed esportazione dati |
| **Partner** | Partner e sponsor ufficiali |
| **Impostazioni** | Configurazione, lingua e backup |
| **Profilo** | I tuoi dati personali e fisici |

---

## Dashboard

La Dashboard è la schermata principale, aperta all'avvio dell'app. Mostra un riepilogo immediato delle tue performance.

### Filtro per tipo di sessione

In alto puoi filtrare tra:
- **Campo** — sessioni con misure in metri
- **Mare** — sessioni con misure in giri di mulinello

### Riquadri statistici

Quattro valori sempre visibili:

- **Distanza Media** — media di tutti i tuoi lanci registrati
- **Record Personale** — la distanza massima che hai raggiunto
- **Totale Lanci** — quanti lanci hai registrato in totale
- **Miglioramento 30 giorni** — la variazione percentuale della tua distanza media negli ultimi 30 giorni

### Grafico di andamento

Sotto le statistiche trovi un grafico che mostra l'evoluzione delle tue distanze nel tempo. Più sessioni registri, più il grafico sarà utile per capire il tuo percorso.

### Ultimi lanci

In fondo alla Dashboard vengono mostrati i 10 lanci più recenti con distanza e data.

---

## Sessione di allenamento

Dalla voce **Sessione** del menu puoi avviare una nuova sessione di allenamento.

### Avviare una sessione

Compila i campi del form iniziale prima di cominciare a lanciare.

**Campi obbligatori:**

- **Data e ora** — viene precompilata con la data/ora attuale, modificabile
- **Tipo di sessione** — scegli tra:
  - 📍 **Campo** (distanze misurate in metri)
  - 🌊 **Mare** (distanze misurate in giri di mulinello)
- **Luogo** — il nome del campo o della spiaggia dove ti alleni (con suggerimenti automatici basati sulle sessioni precedenti)
- **Peso piombo** — es. "Ogiva 150g", "Guardiano 175g"
- **Tecnica di lancio** — es. "Overhead", "Pendulum", "Ground Cast"

**Sezione attrezzatura (opzionale ma consigliata):**

- Modello/Marca canna
- Lunghezza canna (in metri, es. 4.2)
- Grammatura canna (es. 100-200 gr)
- Mulinello
- Filo/Shock leader (es. "0.28mm + SL 0.60mm")

**Condizioni meteo (opzionale):**

- Intensità vento (es. "Calmo", "Brezza 10 km/h")
- Direzione vento (es. "A favore", "Contrario", "Laterale DX")
- Temperatura (°C)
- Umidità (%)

Clicca **Avvia Sessione** per iniziare.

---

### Misurare la distanza con GPS

Una volta avviata la sessione, nella sezione **Misurazione GPS Distanza** trovi i pulsanti per usare il GPS del telefono.

**Come funziona passo per passo:**

1. Posizionati nel punto da cui vuoi lanciare (il punto perno)
2. Clicca **START Misurazione GPS** — l'app acquisisce la tua posizione di partenza
3. Attendi che la qualità GPS raggiunga almeno **Buona** (vedi l'indicatore sotto)
4. Esegui il lancio
5. Cammina fino al punto dove è caduto il piombo
6. Clicca **STOP e Salva Lancio** — la distanza viene calcolata automaticamente

**Indicatori GPS durante la misurazione:**

| Indicatore | Cosa significa |
|---|---|
| 📡 Satelliti | Numero di satelliti agganciati |
| 🎯 Precisione | Margine di errore in metri |
| 📊 Qualità | Scarsa / Bassa / Media / Buona / Ottima |
| ⏱️ Punti GPS | Quanti campionamenti ha fatto il telefono |

> **Consiglio:** Aspetta che la qualità GPS sia almeno **Buona** prima di lanciare per ottenere misure accurate. In caso di qualità scarsa, usa la misurazione manuale.

---

### Inserimento manuale della distanza

Se non vuoi usare il GPS (o vuoi correggere una misura), puoi inserire la distanza a mano nel campo **Distanza (metri)** del form manuale.

Dopo aver inserito la distanza puoi aggiungere una nota libera sul lancio (sensazioni, punti da migliorare, ecc.) e cliccare **Aggiungi Lancio**.

---

### Orientamento del campo su mappa

Questa funzione ti permette di impostare sulla mappa la direzione in cui stai lanciando, in modo da avere un riferimento visivo preciso del campo di gara o di allenamento.

**Come attivare la mappa:**

1. Avvia una sessione
2. Acquisita la posizione GPS (punto perno), apparirà il pulsante **🗺️ Imposta Direzione Campo sulla Mappa**
3. Clicca il pulsante — si apre la mappa interattiva

**Cosa vedi sulla mappa:**

| Elemento | Colore | Descrizione |
|---|---|---|
| Punto perno | Verde | Il punto da cui stai lanciando (rilevato dal GPS) |
| Traiettoria ideale | Rosso | La linea di 250 metri nella direzione impostata |
| Cono di dispersione | Magenta | Area di ±15° rispetto alla traiettoria ideale |
| Archi di distanza | Nero | Curve a 150, 175, 200, 225 e 250 metri |

**Come impostare la direzione:**

Usa lo **slider orizzontale** (da 0° a 359°) per ruotare il campo sulla mappa:

- Il campo si aggiorna **in tempo reale** mentre muovi lo slider
- Il numero in gradi e la direzione cardinale (Nord, Est, Sud-Est, ecc.) vengono mostrati sopra lo slider
- Riferimento orientamenti: 0° = Nord · 90° = Est · 180° = Sud · 270° = Ovest

**Esempio pratico:**

Sei su una spiaggia e lanci verso il mare che si trova a Est rispetto a te. Muovi lo slider fino a **90° (Est)** — la linea rossa punterà verso Est, il cono magenta mostrerà la zona da 75° a 105°, e gli archi neri indicheranno dove dovrebbe cadere il piombo a diverse distanze.

**Confermare la direzione:**

Clicca **Conferma Direzione Campo** per salvare l'impostazione. L'angolo viene memorizzato nella sessione e verrà mostrato anche nello storico quando consulterai quella sessione in seguito.

> **Nota:** La direzione del campo è un dato di supporto visivo. Non è obbligatoria per salvare i lanci, ma è molto utile per analizzare la sessione a posteriori.

---

### Lista lanci della sessione

Nella parte bassa della schermata sessione trovi tutti i lanci aggiunti, con:

- Numero progressivo
- Distanza
- Eventuali note
- Ora del lancio
- Pulsante per eliminare il lancio se necessario

---

### Terminare la sessione

Quando hai finito di allenarti, clicca il pulsante rosso **Termina Sessione di Allenamento**. La sessione viene salvata con tutti i lanci e puoi consultarla in qualsiasi momento dallo **Storico**.

---

## Sessione in mare (giri mulinello)

Quando scegli il tipo **Mare**, l'app ti chiede anche i **cm per giro** del tuo mulinello (es. 75, 82, 91 cm). Questo dato è necessario per convertire i giri mulinello in una distanza stimata.

Il calcolo tiene conto di:
- Il numero di giri inserito
- I centimetri per giro del tuo mulinello
- Un coefficiente di elasticità del filo (varia in base al peso del piombo)
- Un coefficiente di vento (compensa la pancia del filo)

Il risultato è una **distanza stimata in metri** più precisa rispetto a un calcolo semplice.

---

## Storico sessioni

Dalla voce **Storico** puoi consultare tutte le sessioni passate.

### Filtri disponibili

- **Campo / Mare** — tab per separare i due tipi di sessione
- **Luogo** — filtra per campo o spiaggia specifica
- **Periodo** — Tutti / Ultimi 7 giorni / Ultimi 30 giorni / Ultimi 3 mesi / Ultimo anno
- **Ordinamento** — per data (più recente o più vecchio)

### Scheda sessione

Ogni sessione mostra:
- Data e ora
- Luogo
- Numero di lanci
- Distanza media
- Record della sessione

Clicca su una sessione per vedere il dettaglio completo, inclusa la **mappa interattiva** con le traiettorie GPS di tutti i lanci (se disponibili).

### Paginazione

Le sessioni sono divise in pagine da 5. Usa i pulsanti **Precedente** e **Successiva** per navigare.

---

## Coach AI

Il **Coach Virtuale AI** analizza i tuoi dati e ti fornisce indicazioni personalizzate.

Funziona al meglio quando hai almeno 10 lanci registrati. Analizza:

- **Tecnica migliore** — quale tecnica ti dà mediamente le distanze maggiori
- **Peso ideale** — quale piombo produce i risultati migliori
- **Momento migliore** — a che ora del giorno rendi di più
- **Condizione vento ideale** — che vento favorisce le tue performance
- **Predizione record** — stima il tuo prossimo record in base al trend attuale
- **Raccomandazioni** — consigli su frequenza di allenamento, tecnica e altro

Trovi anche un **Consiglio del Giorno** sempre aggiornato.

---

## Achievement

La sezione **Achievement** gamifica il tuo percorso di allenamento.

### Livelli

Man mano che accumuli esperienza sali di livello:

🌱 Principiante → 🌿 Apprendista → 📈 Amatore → ⚡ Esperto → 🏆 Campione

La barra XP mostra quanto manca al prossimo livello.

### Streak

Il contatore 🔥 mostra quanti giorni consecutivi ti stai allenando. Mantieni la serie per sbloccare badge speciali.

### Badge

Oltre 30 badge da sbloccare in diverse categorie:

- **Distanza** — raggiungi 100m, 150m, 200m, 250m
- **Mare** — badge specifici per le sessioni in mare
- **Consistenza** — mantieni regolarità nei risultati
- **Sessioni** — raggiungi un numero di sessioni
- **Volume** — accumula lanci totali
- **Streak** — 5, 10, 30 giorni consecutivi
- **Miglioramento** — migliora la tua media
- **Location** — allenarti in più luoghi diversi
- **Attrezzatura** — usa combinazioni specifiche di canna e mulinello
- **Distanza cumulativa** — accumula chilometri totali

---

## Report

La sezione **Report** fornisce statistiche avanzate sulla tua attività.

### Statistiche disponibili

- Sessioni totali e lanci totali
- Distanza media e mediana
- Record personale
- Distribuzione percentili (P10, P25, P50, P75, P90)
- Trend (se stai migliorando, la consistenza dei tuoi risultati, deviazione standard)
- Prestazioni per tecnica di lancio (media distanza per ogni tecnica usata)

### Esportazione dati

Puoi esportare i tuoi dati in tre formati:

- **PDF** — report stampabile
- **CSV** — apri in Excel o Google Sheets per analisi personali
- **JSON** — backup completo per reimportare nell'app

---

## Partner

La sezione **Partner** mostra i partner ufficiali dell'app, organizzati per categoria:

- 🎣 Negozi di pesca
- 🏢 Associazioni
- 👨‍🏫 Maestri di lancio

Per ogni partner trovi nome, descrizione e contatti (sito web, telefono, email).

---

## Profilo atleta

Vai su **Profilo** per inserire i tuoi dati personali.

**Dati personali:**
- Nome e cognome
- Età e sesso

**Dati fisici:**
- Altezza e peso (il BMI viene calcolato automaticamente)

**Esperienza:**
- Livello: Principiante / Intermedio / Avanzato / Professionista

**Obiettivi:**
- Distanza target che vuoi raggiungere
- Campo di allenamento preferito

Salva il profilo per personalizzare l'esperienza nel Coach AI e negli Achievement.

---

## Impostazioni e backup

Dalla voce **Impostazioni** puoi:

- **Cambiare la lingua** — Italiano, English, Español, Français
- **Esportare i dati** — scarica un file JSON con tutte le sessioni (utile come backup)
- **Importare i dati** — ripristina un backup precedente
- **Eliminare tutti i dati** — cancella tutto lo storico (attenzione: irreversibile)

### Salvataggio automatico

L'app salva automaticamente i tuoi dati:
- Ogni 30 secondi durante una sessione attiva
- Quando aggiungi un lancio
- Quando termini una sessione
- Quando l'app va in background o viene chiusa

Tutti i dati vengono salvati **esclusivamente sul tuo dispositivo**. Nessun dato viene inviato a server esterni.

### Backup automatici

L'app mantiene fino a 3 versioni di backup automatico. In caso di problemi puoi ripristinare una versione precedente dalle Impostazioni.

---

## Installazione come app sul telefono

Puoi usare Longcasting Pro come se fosse un'app nativa, senza passare dal browser ogni volta.

### Android (Chrome)

1. Apri l'app in Chrome
2. Tocca il menu (tre puntini in alto a destra)
3. Seleziona **Aggiungi a schermata Home**
4. Conferma — l'icona apparirà sulla tua Home

### iPhone (Safari)

1. Apri l'app in Safari (deve essere Safari, non Chrome)
2. Tocca il pulsante **Condividi** (icona con freccia verso l'alto)
3. Scorri le opzioni e seleziona **Aggiungi a Home**
4. Tocca **Aggiungi** in alto a destra

> **Importante su iPhone:** I dati vengono salvati in modo permanente **solo se l'app è installata sulla schermata Home**. Se la usi da Safari senza installarla, iOS potrebbe cancellare i dati dopo 7 giorni di inattività. Installa sempre l'app per non perdere i tuoi progressi.

### Browser supportati

- Chrome / Edge (consigliati)
- Firefox
- Safari
- Browser mobile iOS e Android

---

## Risoluzione problemi

### Il GPS non si aggancia

- Assicurati di aver dato il permesso di geolocalizzazione all'app
- Esci all'aperto, lontano da edifici
- Attendi qualche secondo in più — in ambienti coperti il GPS impiega più tempo
- Se la qualità rimane "Scarsa", usa l'inserimento manuale della distanza

### I dati non si salvano (iPhone)

- Verifica che l'app sia installata sulla schermata Home
- Aprila dalla Home, non da Safari
- Controlla che Safari non sia in Modalità Privata
- Vai in Impostazioni > Safari > Avanzate > Dati dei siti web e verifica che longcast abbia dati salvati

### La mappa non si carica

- Verifica la connessione internet (la mappa richiede connessione per caricare le tiles)
- Prova a ricaricare la pagina
- Se sei offline, la mappa potrebbe non essere disponibile a meno che le tiles non siano già in cache

### I badge non si sbloccano

- Alcuni badge richiedono un numero minimo di lanci o sessioni — controlla i requisiti nella sezione Achievement
- Chiudi e riapri l'app per aggiornare il conteggio

### L'autocomplete non suggerisce nulla

- I suggerimenti si popolano automaticamente dopo aver salvato almeno una sessione
- Inserisci e salva una sessione completa — dalla successiva i campi suggeriscono i valori già usati

---

## Struttura tecnica del progetto

```
Longcasting/
├── index.html              # Struttura principale dell'app
├── app.js                  # Logica principale
├── styles.css              # Stili principali
├── sw.js                   # Service Worker (offline/caching)
├── manifest.json           # Configurazione PWA
├── offline.html            # Pagina di fallback offline
│
├── js/
│   ├── utils.js            # Funzioni di utilità
│   ├── DataManager.js      # Gestione salvataggio dati
│   ├── GPSTracker.js       # Tracking GPS e calcolo distanze
│   ├── ReelCalculator.js   # Calcolo distanze in giri mulinello
│   ├── AICoach.js          # Coach virtuale AI
│   ├── Achievements.js     # Sistema badge e livelli
│   ├── Reports.js          # Statistiche e report avanzati
│   ├── i18n.js             # Traduzione multilingua
│   ├── Validator.js        # Validazione e backup dati
│   ├── Performance.js      # Ottimizzazioni performance
│   └── Accessibility.js    # Accessibilità (WCAG)
│
├── css/
│   ├── mobile.css          # Ottimizzazioni iOS/Android
│   └── accessibility.css   # Stili accessibilità
│
└── tests/                  # Suite di test
```

---

## Licenza e proprietà

Questo software è di **esclusiva proprietà di Giampietro Leonoro**. Tutti i diritti sono riservati.

È vietato copiare, modificare, distribuire o utilizzare il software senza esplicita autorizzazione scritta del proprietario. Per informazioni su licenze o collaborazioni, contatta direttamente Giampietro Leonoro.

Consulta il file `LICENSE` per i dettagli completi.
