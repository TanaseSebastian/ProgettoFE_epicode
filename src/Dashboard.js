import React, { useState, useEffect } from "react";
import { db } from "./firebase";                  
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
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
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExpenses,
  selectBalances,
  selectMonthlyData,
  selectAnnualData,
  selectCategories,
  selectExpensesList,
} from "./store/expensesSlice";

import BalanceCard from "./components/BalanceCard";
import PieChart    from "./components/PieChart";
import BarChart    from "./components/BarChart";
import LineChart   from "./components/LineChart";
import ConsentModal     from "./components/ConsentModal";
import MonthYearFilter   from "./components/MonthYearFilter";

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ showExpenseForm }) => {
  /* ──────────────────────────── state “locali” ────────────────────────── */
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  const [currentUser,  setCurrentUser]  = useState(null);
  const [partnerName,  setPartnerName]  = useState("Partner");
  const [partnerId,    setPartnerId]    = useState(null);

  const [mostraConsenso, setMostraConsenso] = useState(false);
  const [coppiaId,        setCoppiaId]      = useState(null);

  /* ──────────────────────────── redux hooks ───────────────────────────── */
  const dispatch     = useDispatch();
  const balances     = useSelector(selectBalances);
  const monthlyData  = useSelector(selectMonthlyData);
  const annualData   = useSelector(selectAnnualData);
  const categories   = useSelector(selectCategories);
  const expenses     = useSelector(selectExpensesList);

  /* ───────────────────────── consenso partner ─────────────────────────── */
  const accettaConsenso = async () => {
    if (!coppiaId) return;
    await setDoc(doc(db, "coppie", coppiaId), { consensoDati: true }, { merge: true });
    setMostraConsenso(false);
    dispatch(fetchExpenses({ uid1: currentUser.uid, uid2: partnerId, year: selectedYear, month: selectedMonth }));
  };

  /* ─────────────────────────── fetch iniziali ─────────────────────────── */
  useEffect(() => {
    const init = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;
      setCurrentUser(userData);

      /* recupera la coppia */
      const coppieRef = collection(db, "coppie");
      const [res1, res2] = await Promise.all([
        getDocs(query(coppieRef, where("utentePrincipale", "==", userData.uid))),
        getDocs(query(coppieRef, where("partner",         "==", userData.uid))),
      ]);

      let partnerIdTmp = null;
      if (!res1.empty) partnerIdTmp = res1.docs[0].data().partner;
      else if (!res2.empty) partnerIdTmp = res2.docs[0].data().utentePrincipale;

      /* recupera nome partner se c’è */
      if (partnerIdTmp) {
        const partnerSnap = await getDoc(doc(db, "users", partnerIdTmp));
        if (partnerSnap.exists()) setPartnerName(partnerSnap.data().name || "Partner");
      } else {
        setPartnerName("");
      }

      /* consenso dati? */
      if (!res1.empty && !res1.docs[0].data().consensoDati) {
        setMostraConsenso(true);
        setCoppiaId(res1.docs[0].id);
        setPartnerId(partnerIdTmp);
        return; // fermati e mostra il modal
      }

      // salva id partner/coppia e lancia il thunk
      setPartnerId(partnerIdTmp);
      if (!res1.empty) setCoppiaId(res1.docs[0].id);
      dispatch(fetchExpenses({ uid1: userData.uid, uid2: partnerIdTmp, year: selectedYear, month: selectedMonth }));
    };

    init();
  }, [dispatch, selectedYear, selectedMonth]);

  /* ───────────────────────── dati per i grafici ───────────────────────── */
  const createMonthlyBarChartData = () => ({
    labels: [
      "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
      "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
    ],
    datasets: [
      { label: "Spese",  data: monthlyData.expenses, backgroundColor: "rgba(255,99,132,0.6)" },
      { label: "Entrate", data: monthlyData.income,  backgroundColor: "rgba(75,192,192,0.6)" },
    ],
  });

  const createAnnualLineChartData = () => {
    /* recupero gli anni: assumo ordinale crescente terminante con selectedYear */
    const startYear = selectedYear - annualData.expenses.length + 1;
    const labels = Array.from({ length: annualData.expenses.length }, (_, i) => startYear + i);

    return {
      labels,
      datasets: [
        {
          label: "Spese",
          data: annualData.expenses,
          backgroundColor: "rgba(255,99,132,0.6)",
          borderColor: "rgba(255,99,132,1)",
          fill: false,
        },
        {
          label: "Entrate",
          data: annualData.income,
          backgroundColor: "rgba(75,192,192,0.6)",
          borderColor: "rgba(75,192,192,1)",
          fill: false,
        },
      ],
    };
  };

  const createMonthlyBalanceData = () => ({
    labels: [
      "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
      "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
    ],
    datasets: [
      {
        label: "Saldo (Entrate-Spese)",
        data: monthlyData.income.map((inc, i) => inc - monthlyData.expenses[i]),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  });

  /* ────────────────────────────── render ──────────────────────────────── */
  return (
    <div className="container mt-5">
      <h1 className="text-center">Riepilogo Entrate e Spese</h1>

      {/* ─── filtro mese/anno ─────────────────────────────────────────── */}
      <MonthYearFilter
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* ─── pulsante aggiunta movimento ──────────────────────────────── */}
      <div className="row mt-3">
        <div className="col text-center">
          <button className="btn btn-primary" onClick={showExpenseForm}>
            Aggiungi Entrata/Uscita
          </button>
        </div>
      </div>

      {/* ─── saldi ───────────────────────────────────────────────────── */}
      <div className="row mt-5">
        <div className="col-md-4">
          <BalanceCard title={`Saldo di ${currentUser?.name || "Utente 1"}`} amount={balances.utente1} />
        </div>
        <div className="col-md-4">
          <BalanceCard title={`Saldo di ${partnerName}`} amount={balances.utente2} />
        </div>
        <div className="col-md-4">
          <BalanceCard title="Saldo Totale" amount={balances.combined} />
        </div>
      </div>

      {/* ─── grafici a torta spese ───────────────────────────────────── */}
      <div className="row mt-5">
        <PieChart title={`Spese per Categoria (${currentUser?.name})`} categories={categories.u1Expenses} />
        <PieChart title={`Spese per Categoria (${partnerName})`}      categories={categories.u2Expenses} />
        <PieChart title="Spese Combinate"                             categories={categories.combinedExpenses} />
      </div>

      {/* ─── grafici a torta entrate ─────────────────────────────────── */}
      <div className="row mt-5">
        <PieChart title={`Entrate per Categoria (${currentUser?.name})`} categories={categories.u1Income} />
        <PieChart title={`Entrate per Categoria (${partnerName})`}      categories={categories.u2Income} />
        <PieChart title="Entrate Combinate"                             categories={categories.combinedIncome} />
      </div>

      {/* ─── grafici serie temporali ─────────────────────────────────── */}
      <BarChart  title="Spese Mensili"           data={createMonthlyBarChartData()} />
      <LineChart title="Entrate e Spese Annuali" data={createAnnualLineChartData()} />
      <BarChart  title="Saldo Mensile"           data={createMonthlyBalanceData()} />

      {/* ─── lista movimenti ─────────────────────────────────────────── */}
      <div className="row mt-5">
        <div className="d-none d-md-block col-12">
          <h4>Lista Movimenti</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Utente</th><th>Data</th><th>Ora</th><th>Categoria</th>
                <th>Tipo</th><th>Descrizione</th><th>Importo</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const dateObj = exp.timestamp.toDate();
                const userName = exp.uid === currentUser?.uid ? currentUser?.name || "Utente 1" : partnerName;
                return (
                  <tr key={exp.id}>
                    <td>{userName}{exp.shared && <span className="badge bg-info ms-2">Comune</span>}</td>
                    <td>{dateObj.toLocaleDateString("it-IT")}</td>
                    <td>{dateObj.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</td>
                    <td>{exp.category}</td>
                    <td>{exp.type}</td>
                    <td>{exp.description || "—"}</td>
                    <td>{exp.amount.toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* layout card su mobile */}
        <div className="d-md-none col-12">
          <h4>Lista Movimenti</h4>
          {expenses.map((exp) => {
            const dateObj = exp.timestamp.toDate();
            const userName = exp.uid === currentUser?.uid ? currentUser?.name || "Utente 1" : partnerName;
            const bg = exp.type === "Entrata" ? "rgba(75,192,192,0.2)" : "rgba(255,99,132,0.2)";
            return (
              <div key={exp.id} className="card mb-3" style={{ backgroundColor: bg }}>
                <div className="card-body">
                  <h5 className="card-title">
                    {exp.type}: {exp.amount.toFixed(2)} €
                  </h5>
                  <p className="card-text">
                    <strong>Utente:</strong> {userName}<br/>
                    <strong>Categoria:</strong> {exp.category}<br/>
                    <strong>Descrizione:</strong> {exp.description || "—"}
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      {dateObj.toLocaleDateString("it-IT")} — {dateObj.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}
                    </small>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── modal consenso dati ─────────────────────────────────────── */}
      <ConsentModal
        show={mostraConsenso}
        onAccept={accettaConsenso}
        onDismiss={() => setMostraConsenso(false)}
      />
    </div>
  );
};

export default Dashboard;
