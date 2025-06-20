import React, { useState, useEffect } from "react";
import { db } from "../firebase";                  
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
} from "../store/expensesSlice";
import { useNavigate } from "react-router-dom";

import BalanceCard from "../components/BalanceCard";
import PieChart    from "../components/PieChart";
import BarChart    from "../components/BarChart";
import LineChart   from "../components/LineChart";
import ConsentModal     from "../components/ConsentModal";
import MonthYearFilter   from "../components/MonthYearFilter";

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

const Dashboard = () => {
  /* ──────────────────────────── state “locali” ────────────────────────── */
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  const [currentUser,  setCurrentUser]  = useState(null);
  const [partnerName,  setPartnerName]  = useState("Partner");
  const [partnerId,    setPartnerId]    = useState(null);

  const [mostraConsenso, setMostraConsenso] = useState(false);
  const [coppiaId,        setCoppiaId]      = useState(null);
  const navigate = useNavigate();

  /* ──────────────────────────── redux hooks ───────────────────────────── */
  const dispatch     = useDispatch();
  const balances     = useSelector(selectBalances);
  const monthlyData  = useSelector(selectMonthlyData);
  const annualData   = useSelector(selectAnnualData);
  const categories   = useSelector(selectCategories);

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

      {/* ─── pulsanti centrali ────────────────────────────────────────── */}
      <div className="row mt-4">
        <div className="col text-center">
          <div className="d-inline-flex gap-3 flex-wrap justify-content-center">
            <button className="btn btn-primary" onClick={() => navigate("/new")}>
              ➕ Aggiungi Entrata/Uscita
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/movimenti")}>
              📄 Vedi tutti i movimenti
            </button>
          </div>
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
