# 💸 Expense Tracker di Coppia – Progetto Finale Epicode

Un'applicazione React completa per tracciare spese e entrate all'interno di una coppia, con gestione utenti, autenticazione, ticket di assistenza e dashboard amministrativa.

---

## 📖 Descrizione del progetto

L'app nasce da un'esigenza reale: io e la mia fidanzata avevamo difficoltà a tenere traccia delle spese comuni. Da questo bisogno è nata l'idea di creare un'app per tenere tutto sotto controllo, e successivamente è stata sviluppata in modo più completo e professionale, rendendola deployabile su Netlify.

Il sistema prevede due ruoli:
- 👤 **Utente**: inserisce e gestisce le proprie spese/entrate
- 🛠 **Admin**: controlla lo stato generale dell'applicazione, visualizza movimenti aggregati, risponde ai ticket e gestisce gli utenti

---

## 🚀 Link all'app online

👉 [https://expensetrackerprogettoepicode.netlify.app](https://expensetrackerprogettoepicode.netlify.app) *(link provvisorio da confermare)*

---

## 👤 Funzionalità lato utente

- Registrazione e login con Firebase Authentication
- Inserimento della mail del partner per creazione coppia
- Inserimento spese e entrate con dettagli
- Visualizzazione della dashboard personale con grafici
- Filtraggio e visualizzazione lista movimenti
- Profilo utente con:
  - Nome, città, indirizzo, cap, provincia, immagine profilo
- Apertura ticket di assistenza
- Consenso esplicito per il trattamento dati

---

## 🛠 Funzionalità lato admin

- Visualizzazione lista utenti
- Visualizzazione lista coppie
- Accesso a tutti i movimenti (se consenso abilitato)
- Risposta e gestione dei ticket inviati dagli utenti

---

## 🧪 Tecnologie utilizzate

- **React** (con JSX)
- **React Router DOM** (routing pubblico/privato e dinamico)
- **Redux Toolkit** per stato globale
- **Redux Thunk** per azioni asincrone (es. caricamento spese)
- **Firebase**:
  - Firestore (Database NoSQL)
  - Authentication
- **Bootstrap** + React-Bootstrap
- **Chart.js** (grafici)
- **API esterna**: [API città italiane](https://comuni-ita-api.vercel.app) per l’autocomplete nei form

---

## 🧩 Funzionalità implementate

- ✔️ Routing protetto e dinamico
- ✔️ Dashboard con grafici riepilogativi
- ✔️ Sistema di ruoli (user/admin)
- ✔️ Autenticazione Firebase
- ✔️ Associazione tra partner
- ✔️ Form controllati con validazione:
  - Obbligatorietà campi
  - Formati corretti
  - Gestione errori
- ✔️ Ticket di assistenza
- ✔️ Chiamate asincrone con Redux Thunk
- ✔️ Consumo API esterna

---

## 🧪 Come usare l'app (senza installare nulla)

1. Vai su 👉 [https://expensetrackerprogettoepicode.netlify.app](https://expensetrackerprogettoepicode.netlify.app)
2. Registrati inserendo i tuoi dati e la mail del tuo partner
3. Il partner riceverà una mail per impostare la password
4. Accedi con le credenziali
5. Visualizza la dashboard e inizia a tracciare spese e entrate
6. Puoi inserire ticket, modificare il tuo profilo, consultare statistiche

---

## 🛠️ Come eseguire in locale

```bash
git clone https://github.com/TanaseSebastian/ProgettoFE_epicode.git
cd ProgettoFE_epicode
npm install
npm start
```

---

## 🔐 Avviso importante sulla sicurezza

Per motivi di tempo, le credenziali Firebase sono attualmente presenti in chiaro nel file `firebase.js`.

⚠️ **Nota**: Sono consapevole che in ambienti reali andrebbero inserite come variabili di ambiente (es. `.env.local`) per proteggere i dati sensibili. Questo sarà il primo miglioramento post-consegna.

---

## 📦 Struttura progetto

```
src/
├── components/        # Componenti riutilizzabili
├── pages/             # Pagine principali (Login, Register, Dashboard...)
├── tickets/           # Gestione ticket (form, lista, dettaglio)
├── store/             # Redux slices e store centrale
├── firebase.js          # Configurazione Firebase
├── App.jsx            # Root component
├── index.js           # Entry point
```

---

## 🏆 extra

- ✅ Uso di librerie grafiche (Bootstrap, Chart.js)
- ✅ UX curata con grafici dinamici e layout responsive
- ✅ Deploy effettuato su Netlify
- ✅ Chiamata API esterna per città italiane
- ✅ Routing avanzato con ruoli e protezioni

---

## 🙋‍♂️ Autore

Realizzato da **Sebastian Tanase** – studente di Epicode, appassionato di sviluppo web.

---
