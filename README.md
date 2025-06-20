# 💸 Expense Tracker di Coppia – Progetto Finale Epicode

Un’applicazione React progettata per aiutare una coppia a monitorare in modo semplice ed efficace le proprie spese ed entrate, con gestione utenti, autenticazione, ticket di assistenza e dashboard amministrativa.

---

## 📖 Descrizione del progetto

Il progetto è nato da un'esigenza concreta e personale: trovare un modo chiaro per tenere sotto controllo le finanze condivise all’interno di una coppia. Sulla base di questa necessità è stato sviluppato un sistema completo che consente a due persone collegate tra loro di gestire e visualizzare in modo strutturato le proprie entrate e uscite.

L'app è stata successivamente organizzata e ottimizzata per essere deployabile online e per soddisfare tutti i requisiti previsti per il progetto finale del corso di **Frontend Development**.

---

## 🚀 Link all'app online

👉 [https://expensetrackerprogettoepicode.netlify.app](https://expensetrackerprogettoepicode.netlify.app)

---

## 👤 Funzionalità lato utente

- Registrazione e login con Firebase Authentication
- Inserimento della mail del partner per creazione automatica della coppia
- Inserimento spese e entrate con descrizione, categoria, importo e data
- Dashboard personale con grafici riepilogativi (mensili, per categoria, annuali)
- Lista movimenti filtrabile e ordinabile
- Profilo personale modificabile (nome, indirizzo, città, provincia, CAP, telefono, data di nascita, immagine profilo)
- Autocomplete per CAP e indirizzi tramite API esterne
- Invio di ticket di assistenza
- Accettazione esplicita del consenso al trattamento dei dati

---

## 🛠 Funzionalità lato admin

- Visualizzazione lista utenti e coppie registrate
- Accesso ai movimenti (se l’utente ha fornito consenso)
- Gestione e risposta ai ticket di assistenza

🔑 **Credenziali admin di test:**

```
Email: admin@gmail.com  
Password: Admin123
```

---

## 🧪 Tecnologie utilizzate

- **React** (JSX)
- **React Router DOM** per la gestione delle rotte
- **Redux Toolkit** per la gestione dello stato globale
- **Redux Thunk** per azioni asincrone (es. caricamento spese)
- **Firebase** (Authentication + Firestore)
- **Bootstrap** + React-Bootstrap per la UI responsive
- **Chart.js** per i grafici
- **API esterne**:
  - [Zippopotam.us](https://api.zippopotam.us) → per recuperare città e provincia da CAP
  - [Nominatim (OpenStreetMap)](https://nominatim.org/release-docs/latest/api/Search/) → per suggerimenti automatici sugli indirizzi

---

## 🧩 Funzionalità implementate

- ✔️ Routing protetto (public/private)
- ✔️ Dashboard con grafici dinamici
- ✔️ Ruoli utente (admin/user)
- ✔️ Autenticazione tramite Firebase
- ✔️ Interazione tra partner
- ✔️ Form controllati con validazione
- ✔️ Ticketing system
- ✔️ API esterne per migliorare la UX
- ✔️ Stato gestito con Redux + Thunk

---

## 🧪 Come usare l'app (senza installare nulla)

1. Accedi a 👉 [https://expensetrackerprogettoepicode.netlify.app](https://expensetrackerprogettoepicode.netlify.app)
2. Registrati con i tuoi dati e inserisci l'email del tuo partner
3. Il partner riceverà un’email per impostare la password
4. Dopo l’accesso, verrà mostrata la dashboard
5. Aggiungi spese o entrate, consulta grafici e statistiche, modifica il tuo profilo, invia ticket se necessario

---

## 🛠️ Come eseguire in locale

```bash
git clone https://github.com/TanaseSebastian/ProgettoFE_epicode.git
cd ProgettoFE_epicode
npm install
npm start
```

> ⚠️ Il file `firebase.js` contiene credenziali pubbliche per la connessione al progetto Firebase.

---

## 🔐 Nota sulla sicurezza

Le credenziali Firebase sono attualmente visibili nel file `firebase.js`.  
In un contesto di produzione, sarebbe opportuno spostarle in un file `.env` e proteggerle adeguatamente. Questo rappresenta uno dei possibili miglioramenti futuri.

---

## 📦 Struttura progetto

```
src/
├── components/        # Componenti riutilizzabili
├── pages/             # Pagine principali (Login, Register, Dashboard, Profilo)
├── tickets/           # Gestione ticket (form, lista, dettaglio)
├── store/             # Redux store e slice
├── firebase.js        # Configurazione Firebase
├── App.jsx            # Componente principale
├── index.js           # Entry point dell'app
```

---

## 🏆 Funzionalità extra

- ✅ UI responsive e moderna con Bootstrap
- ✅ Visualizzazione dati tramite grafici dinamici
- ✅ Integrazione con API esterne reali
- ✅ Deploy effettuato su Netlify
- ✅ Routing avanzato e protetto per ruoli

---

## 🙋‍♂️ Autore

Sviluppato da **Sebastian Tanase** – studente del corso Epicode, con interesse nella creazione di soluzioni digitali.

---
