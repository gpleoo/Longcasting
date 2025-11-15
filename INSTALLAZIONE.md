# 📱 Guida Installazione LongCast Pro su iPhone

## ⚠️ IMPORTANTE: Generare Prima le Icone

Prima di installare l'app, devi generare le icone:

### Passo 1: Generare le Icone

1. Apri il file `generate-icons.html` nel browser (Chrome, Firefox, o Safari)
2. Le icone verranno generate automaticamente
3. Clicca su ogni pulsante "Download" per scaricare:
   - `apple-touch-icon.png` (180x180)
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
4. Salva tutte e tre le icone nella stessa cartella di `index.html`

### Passo 2: Caricare i File su un Server

Per usare l'app su iPhone, i file devono essere su un server web. Opzioni:

**Opzione A - GitHub Pages (Gratuito e Facile)**
1. Crea un repository GitHub
2. Carica tutti i file del progetto
3. Vai su Settings > Pages
4. Abilita GitHub Pages
5. Copia l'URL generato (es: `https://tuonome.github.io/longcasting`)

**Opzione B - Netlify (Gratuito)**
1. Vai su [netlify.com](https://netlify.com)
2. Trascina la cartella del progetto
3. Ricevi un URL automatico

**Opzione C - Server Locale (Solo per Test)**
1. Installa Python
2. Nella cartella del progetto esegui:
   ```bash
   python -m http.server 8000
   ```
3. Sul tuo computer, vai a `http://localhost:8000`
4. Trova l'IP locale del tuo computer (es: 192.168.1.100)
5. Sul tuo iPhone (sulla stessa rete WiFi), apri Safari e vai a `http://192.168.1.100:8000`

## 📲 Installazione su iPhone

### Requisiti
- iPhone con iOS 11.3 o successivo
- Safari (l'app deve essere aperta in Safari, NON in Chrome)

### Procedura di Installazione

1. **Apri Safari su iPhone**
   - Vai all'URL dove hai caricato l'app
   - Esempio: `https://tuonome.github.io/longcasting`

2. **Tocca il pulsante Condividi**
   - È l'icona con la freccia verso l'alto
   - Si trova in basso al centro (iPhone) o in alto (iPad)

3. **Scorri e trova "Aggiungi a Home"**
   - Scorri le opzioni fino a trovare "Aggiungi a Home"
   - Tocca questa opzione

4. **Personalizza (opzionale)**
   - Puoi modificare il nome se vuoi
   - L'icona sarà già configurata

5. **Tocca "Aggiungi"**
   - In alto a destra
   - L'app apparirà sulla Home Screen!

## ✅ Verifica Installazione

L'app è installata correttamente se:
- ✅ C'è un'icona "LongCast Pro" sulla Home Screen
- ✅ Quando la apri, NON vedi la barra di Safari
- ✅ L'app occupa tutto lo schermo
- ✅ L'app appare nel multitasking come app separata

## 💾 Salvataggio Dati

**IMPORTANTE**: I dati vengono salvati in modo permanente SOLO se l'app è installata sulla Home Screen!

Se usi l'app da Safari senza installarla:
- ⚠️ Safari su iOS può cancellare i dati dopo 7 giorni di non utilizzo
- ⚠️ I dati possono essere persi se Safari libera memoria

**Soluzione**: Installa sempre l'app sulla Home Screen per garantire la persistenza dei dati!

## 🔍 Risoluzione Problemi

### Le icone non appaiono
- Verifica che i file PNG siano nella stessa cartella di `index.html`
- Verifica che i nomi dei file siano esatti (minuscolo/maiuscolo)
- Ricarica la pagina con forza (tieni premuto il pulsante refresh)

### L'app non si installa
- Verifica di usare Safari (non Chrome o altro browser)
- Verifica di avere iOS 11.3 o successivo
- Prova a riavviare Safari e riprovare

### I dati non si salvano
- Verifica che l'app sia installata sulla Home Screen
- Apri l'app dalla Home Screen, NON da Safari
- Controlla che Safari non sia in "Modalità Privata"
- Vai in Impostazioni > Safari > Avanzate > Dati dei siti web e verifica che longcast abbia dati salvati

### L'autocomplete non funziona
- L'autocomplete si popola solo DOPO aver inserito dati almeno una volta
- Inserisci un dato in un campo e salvalo
- La prossima volta che apri quel campo vedrai il suggerimento

## 📊 Console di Debug

Per vedere i log di debug:
1. Apri l'app su iPhone
2. Vai in Impostazioni > Safari > Avanzate > Web Inspector
3. Abilita Web Inspector
4. Collega iPhone al Mac
5. Apri Safari su Mac > Sviluppo > [Tuo iPhone] > [LongCast Pro]
6. Nella console vedrai i log:
   - ✅ Sessioni salvate: X sessioni
   - ✅ Suggerimenti salvati
   - ✅ Caricate X sessioni da localStorage

## 🎨 Personalizzare le Icone

Se vuoi creare icone personalizzate:
1. Crea immagini PNG con sfondo non trasparente:
   - 180x180 px per `apple-touch-icon.png`
   - 192x192 px per `icon-192.png`
   - 512x512 px per `icon-512.png`
2. Sostituisci i file generati con i tuoi
3. Ricarica l'app su iPhone

## 🆘 Supporto

Se hai problemi:
1. Controlla la console di debug (vedi sopra)
2. Verifica che localStorage sia abilitato
3. Prova a disinstallare e reinstallare l'app
4. Esporta i dati prima di qualsiasi operazione critica (Profilo > Esporta Dati)

## 📝 Note Tecniche

- L'app usa localStorage per salvare i dati
- Il salvataggio avviene automaticamente:
  - Ogni 30 secondi
  - Quando aggiungi un lancio
  - Quando termini una sessione
  - Quando l'app va in background
  - Quando chiudi l'app
- I suggerimenti autocomplete sono salvati separatamente
- L'app funziona anche offline dopo l'installazione
