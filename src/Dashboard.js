import React, { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Form } from "react-bootstrap";
import { collection, query, getDocs, where, getDoc, doc, setDoc } from "firebase/firestore";


// Registra gli elementi necessari per i grafici
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = ({ showExpenseForm }) => {
  const [expenses, setExpenses] = useState([]);
  const [Utente1Balance, setUtente1Balance] = useState(0);
  const [Utente2Balance, setUtente2Balance] = useState(0);
  const [combinedBalance, setCombinedBalance] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Mese selezionato
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Anno selezionato

  const [Utente1Categories, setUtente1Categories] = useState({});
  const [Utente2Categories, setUtente2Categories] = useState({});
  const [combinedCategories, setCombinedCategories] = useState({});
  
  // Stati per le entrate
  const [Utente1IncomeCategories, setUtente1IncomeCategories] = useState({});
  const [Utente2IncomeCategories, setUtente2IncomeCategories] = useState({});
  const [combinedIncomeCategories, setCombinedIncomeCategories] = useState({});

  const [monthlyData, setMonthlyData] = useState({ expenses: [], income: [] });
  const [annualData, setAnnualData] = useState({ expenses: [], income: [] });

  const [currentUser, setCurrentUser] = useState(null);
  const [partnerName, setPartnerName] = useState("Partner");
  const [mostraConsenso, setMostraConsenso] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [coppiaId, setCoppiaId] = useState(null);
  const [accetto, setAccetto] = useState(false);

  const accettaConsenso = async () => {
    if (!coppiaId) return;
    await setDoc(doc(db, "coppie", coppiaId), { consensoDati: true }, { merge: true });
    setMostraConsenso(false);
    await fetchExpenses(currentUser.uid, partnerId);
  };


  const fetchExpenses = useCallback(async (uid1, uid2) => {
    const expensesRef = collection(db, "expenses");
    const q = query(expensesRef, where("timestamp", ">=", new Date(selectedYear, selectedMonth, 1)));
    const snapshot = await getDocs(q);
  
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(data => data.uid === uid1 || data.uid === uid2);
  
    const monthlyExpenses = Array(12).fill(0);
    const monthlyIncome = Array(12).fill(0);
    const annualExpenses = {};
    const annualIncome = {};
  
    const user1Cat = {};
    const user2Cat = {};
    const combinedCat = {};
    const user1Income = {};
    const user2Income = {};
    const combinedIncome = {};
  
    const enriched = data.map((item) => {
      const dateObj = item.timestamp.toDate();
      const month = dateObj.getMonth();
      const year = dateObj.getFullYear();
      const isUser1 = item.uid === uid1;
      const isUser2 = uid2 && item.uid === uid2;
      const userName = isUser1 ? currentUser?.name || "Utente 1" : partnerName;
  
      if (item.type === "Spesa") {
        if (year === selectedYear) monthlyExpenses[month] += item.amount;
        annualExpenses[year] = (annualExpenses[year] || 0) + item.amount;
  
        if (isUser1) user1Cat[item.category] = (user1Cat[item.category] || 0) + item.amount;
        if (isUser2) user2Cat[item.category] = (user2Cat[item.category] || 0) + item.amount;
        if (item.shared) combinedCat[item.category] = (combinedCat[item.category] || 0) + item.amount;
      }
  
      if (item.type === "Entrata") {
        if (year === selectedYear) monthlyIncome[month] += item.amount;
        annualIncome[year] = (annualIncome[year] || 0) + item.amount;
  
        if (isUser1) user1Income[item.category] = (user1Income[item.category] || 0) + item.amount;
        if (isUser2) user2Income[item.category] = (user2Income[item.category] || 0) + item.amount;
        if (item.shared) combinedIncome[item.category] = (combinedIncome[item.category] || 0) + item.amount;
      }
  
      return {
        ...item,
        date: dateObj.toLocaleDateString("it-IT"),
        time: dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
        userName,
      };
    });
  
    const userData = enriched.filter(item => item.userName === currentUser?.name);
    const partnerData = enriched.filter(item => item.userName === partnerName);
  
    const userBalance = userData.reduce(
      (acc, curr) => acc + (curr.type === "Entrata" ? curr.amount : -curr.amount),
      0
    );
    const partnerBalance = partnerData.reduce(
      (acc, curr) => acc + (curr.type === "Entrata" ? curr.amount : -curr.amount),
      0
    );
  
    setUtente1Balance(userBalance);
    setUtente2Balance(partnerBalance);
    setCombinedBalance(userBalance + partnerBalance);
    setExpenses(enriched);
  
    setUtente1Categories(user1Cat);
    setUtente2Categories(user2Cat);
    setCombinedCategories(combinedCat);
    setUtente1IncomeCategories(user1Income);
    setUtente2IncomeCategories(user2Income);
    setCombinedIncomeCategories(combinedIncome);
    setMonthlyData({ expenses: monthlyExpenses, income: monthlyIncome });
    setAnnualData({
      expenses: Object.values(annualExpenses),
      income: Object.values(annualIncome),
    });
  }, [selectedYear, selectedMonth, currentUser?.name, partnerName]); 

  useEffect(() => {
    const fetchUserAndExpenses = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;
  
      setCurrentUser(userData);
  
      const coppieRef = collection(db, "coppie");
      const q1 = query(coppieRef, where("utentePrincipale", "==", userData.uid));
      const q2 = query(coppieRef, where("partner", "==", userData.uid));
      const [res1, res2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
      let partnerId = null;
      if (!res1.empty) {
        partnerId = res1.docs[0].data().partner;
      } else if (!res2.empty) {
        partnerId = res2.docs[0].data().utentePrincipale;
      } else {
        console.warn("Coppia non trovata, caricamento solo dati utente");
        setPartnerName("");
        await fetchExpenses(userData.uid, null);
        return;
      }
  
      const partnerDoc = await getDoc(doc(db, "users", partnerId));
      if (partnerDoc.exists()) {
        setPartnerName(partnerDoc.data().name || "Partner");
      }

      if (!res1.empty) {
        const docCoppia = res1.docs[0];
        partnerId = docCoppia.data().partner;
        setPartnerId(partnerId);
        setCoppiaId(docCoppia.id);
        if (!docCoppia.data().consensoDati) {
          setMostraConsenso(true);
          return;
        }
      }
  
      await fetchExpenses(userData.uid, partnerId);
    };
  
    fetchUserAndExpenses();
  }, [selectedMonth, selectedYear, currentUser?.name, partnerName]);
  

  // Funzione per creare i dati per il grafico a torta
  const createPieChartData = (categories) => ({
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Totale per Categoria",
        data: Object.values(categories),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  });

  // Funzione per creare i dati per il grafico a barre mensile
  const createMonthlyBarChartData = () => ({
    labels: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
    datasets: [
      {
        label: "Spese Mensili",
        data: monthlyData.expenses,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Entrate Mensili",
        data: monthlyData.income,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  });

  // Funzione per creare i dati per il grafico annuale
  const createAnnualLineChartData = () => ({
    labels: Object.keys(annualData.expenses).map((year) => year),
    datasets: [
      {
        label: "Spese Annuali",
        data: annualData.expenses,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Entrate Annuali",
        data: annualData.income,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  });

  // Funzione per calcolare il saldo per ogni mese
  const createMonthlyBalanceData = () => ({
    labels: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
    datasets: [
      {
        label: "Saldo Mensile (Entrate - Spese)",
        data: monthlyData.income.map((inc, i) => inc - monthlyData.expenses[i]),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  });

  return (
    <div className="container mt-5">
      <h1 className="text-center">Riepilogo delle Entrate e Spese</h1>

      {/* Select per il mese */}
      <div className="text-center">
        <label htmlFor="month-select" className="form-label">
          Seleziona il mese:
        </label>
        <select
          id="month-select"
          className="form-select w-50 mx-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          <option value="0">Gennaio</option>
          <option value="1">Febbraio</option>
          <option value="2">Marzo</option>
          <option value="3">Aprile</option>
          <option value="4">Maggio</option>
          <option value="5">Giugno</option>
          <option value="6">Luglio</option>
          <option value="7">Agosto</option>
          <option value="8">Settembre</option>
          <option value="9">Ottobre</option>
          <option value="10">Novembre</option>
          <option value="11">Dicembre</option>
        </select>
      </div>

      {/* Select per l'anno */}
      <div className="text-center mt-3">
        <label htmlFor="year-select" className="form-label">
          Seleziona l'anno:
        </label>
        <select
          id="year-select"
          className="form-select w-50 mx-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Bottone per accedere al form */}
      <div className="row mt-3">
        <div className="col-md-12 text-center">
          <button className="btn btn-primary" onClick={showExpenseForm}>
            Aggiungi Entrata/Uscita
          </button>
        </div>
      </div>

      {/* Saldi individuali e complessivi */}
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card text-center">
           <div className="card-header">Saldo di {currentUser?.name || "Utente 1"}</div>
            <div className="card-body">
              <h5 className="card-title">{Utente1Balance.toFixed(2)} €</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
          <div className="card-header">Saldo di {partnerName}</div>
            <div className="card-body">
              <h5 className="card-title">{Utente2Balance.toFixed(2)} €</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-header">Saldo Totale</div>
            <div className="card-body">
              <h5 className="card-title">{combinedBalance.toFixed(2)} €</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Grafici a torta */}
      <div className="row mt-5">
        <div className="col-md-4">
        <h4>Spese per Categoria ({currentUser?.name || "Utente 1"})</h4>
          {Object.keys(Utente1Categories).length > 0 ? (
            <Pie data={createPieChartData(Utente1Categories)} />
          ) : (
            <p>Nessuna spesa disponibile per Utente1.</p>
          )}
        </div>
        <div className="col-md-4">
        <h4>Spese per Categoria ({partnerName})</h4>
          {Object.keys(Utente2Categories).length > 0 ? (
            <Pie data={createPieChartData(Utente2Categories)} />
          ) : (
            <p>Nessuna spesa disponibile per Utente2.</p>
          )}
        </div>
        <div className="col-md-4">
          <h4>Spese Combinate per Categoria</h4>
          {Object.keys(combinedCategories).length > 0 ? (
            <Pie data={createPieChartData(combinedCategories)} />
          ) : (
            <p>Nessuna spesa combinata disponibile.</p>
          )}
        </div>
      </div>

      {/* Grafico a torta per entrate */}
      <div className="row mt-5">
        <div className="col-md-4">
        <h4>Entrate per Categoria ({currentUser?.name || "Utente 1"})</h4>
          {Object.keys(Utente1IncomeCategories).length > 0 ? (
            <Pie data={createPieChartData(Utente1IncomeCategories)} />
          ) : (
            <p>Nessuna entrata disponibile per {currentUser?.name || "Utente 1"}.</p>
          )}
        </div>
        <div className="col-md-4">
        <h4>Entrate per Categoria ({partnerName})</h4>
          {Object.keys(Utente2IncomeCategories).length > 0 ? (
            <Pie data={createPieChartData(Utente2IncomeCategories)} />
          ) : (
            <p>Nessuna entrata disponibile per {partnerName}.</p>
          )}
        </div>
        <div className="col-md-4">
          <h4>Entrate Combinate per Categoria</h4>
          {Object.keys(combinedIncomeCategories).length > 0 ? (
            <Pie data={createPieChartData(combinedIncomeCategories)} />
          ) : (
            <p>Nessuna entrata combinata disponibile.</p>
          )}
        </div>
      </div>

      {/* Grafico a Barre per le spese mensili */}
      <div className="row mt-5">
        <div className="col-md-12">
          <h4>Spese Mensili</h4>
          <Bar data={createMonthlyBarChartData()} />
        </div>
      </div>

      {/* Grafico a Linee per le entrate e spese annuali */}
      <div className="row mt-5">
        <div className="col-md-12">
          <h4>Entrate e Spese Annuali</h4>
          <Line data={createAnnualLineChartData()} />
        </div>
      </div>

      {/* Grafico a barre per il saldo mensile */}
      <div className="row mt-5">
        <div className="col-md-12">
          <h4>Saldo Mensile</h4>
          <Bar data={createMonthlyBalanceData()} />
        </div>
      </div>

    {/* Lista dei movimenti */}
    <div className="row mt-5">
      {/* Tabella per schermi grandi */}
      <div className="d-none d-md-block col-md-12">
        <h4>Lista dei Movimenti</h4>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Data</th>
              <th>Orario</th>
              <th>Utente</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Descrizione</th>
              <th>Importo</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
             <tr key={index}>
             <td>
               {expense.userName}
               {expense.shared && <span className="badge bg-info ms-2">Comune</span>}
             </td>
             <td>{expense.date}</td>
             <td>{expense.time}</td>
             <td>{expense.category}</td>
             <td>{expense.type === "Entrata" ? "Entrata" : "Spesa"}</td>
             <td>{expense.description || "N/A"}</td>
             <td>{expense.amount.toFixed(2)} €</td>
           </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout per dispositivi mobili */}
      <div className="d-md-none">
        <h4>Lista dei Movimenti</h4>
        {expenses.map((expense, index) => (
          <div 
            className="card mb-3" 
            key={index}
            style={{
              backgroundColor: expense.type === "Entrata" ? "rgba(75, 192, 192, 0.2)" : "rgba(255, 99, 132, 0.2)",
            }}
          >
            <div className="card-body">
              <h5 className="card-title">
                {expense.type === "Entrata" ? "Entrata" : "Spesa"} : {expense.amount.toFixed(2)} €
              </h5>
              <p className="card-text">
                <strong>Utente:</strong> {expense.userName} <br />
                <strong>Categoria:</strong> {expense.category} <br />
                <strong>Descrizione:</strong> {expense.description || "N/A"}
              </p>
              <p className="card-text">
                <small className="text-muted">
                  {expense.date} alle {expense.time}
                </small>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>



    {mostraConsenso && (
      <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Consenso al Trattamento dei Dati</h5>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <p><strong>Gentile utente,</strong></p>
              <p>Per poter utilizzare l'app, è necessario accettare il trattamento dei dati personali.</p>
              <ul>
                <li>I dati sono usati solo per il funzionamento dell’app.</li>
                <li>Puoi revocare il consenso in qualsiasi momento.</li>
                <li>Nessun dato è condiviso con terzi.</li>
              </ul>

              <Form.Check 
                type="checkbox" 
                id="checkbox-consenso" 
                label="Ho letto e accetto il trattamento dei dati"
                onChange={(e) => setAccetto(e.target.checked)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" disabled={!accetto} onClick={accettaConsenso}>
                Accetto e continuo
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Dashboard;
