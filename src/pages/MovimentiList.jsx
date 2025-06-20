import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import MonthYearFilter from "../components/MonthYearFilter";

const MovimentiList = () => {
  const [movimenti, setMovimenti] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sharedOnly, setSharedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("userData"));
      if (!user) return;

      const coppieRef = collection(db, "coppie");
      const [res1, res2] = await Promise.all([
        getDocs(query(coppieRef, where("utentePrincipale", "==", user.uid))),
        getDocs(query(coppieRef, where("partner", "==", user.uid))),
      ]);

      let partnerId = null;
      if (!res1.empty) partnerId = res1.docs[0].data().partner;
      else if (!res2.empty) partnerId = res2.docs[0].data().utentePrincipale;

      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 1);

      const q = query(
        collection(db, "expenses"),
        where("timestamp", ">=", start),
        where("timestamp", "<", end)
      );

      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((e) => e.uid === user.uid || e.uid === partnerId);

      setMovimenti(docs);
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    let filteredList = [...movimenti];

    if (typeFilter) filteredList = filteredList.filter((m) => m.type === typeFilter);
    if (categoryFilter) filteredList = filteredList.filter((m) => m.category === categoryFilter);
    if (sharedOnly) filteredList = filteredList.filter((m) => m.shared === true);
    if (search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filteredList = filteredList.filter((m) =>
        (m.description || "").toLowerCase().includes(q)
      );
    }

    setFiltered(filteredList);
  }, [movimenti, typeFilter, categoryFilter, sharedOnly, search]);

  const allCategories = [...new Set(movimenti.map((m) => m.category))];

  const resetFilters = () => {
    setTypeFilter("");
    setCategoryFilter("");
    setSharedOnly(false);
    setSearch("");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📋 Tutti i Movimenti</h2>

      <MonthYearFilter
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <div className="row my-3 g-2">
        <div className="col-md-2">
          <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Tutti i tipi</option>
            <option value="Entrata">Entrate</option>
            <option value="Spesa">Spese</option>
          </select>
        </div>

        <div className="col-md-3">
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {allCategories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per descrizione"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input me-2"
            checked={sharedOnly}
            onChange={(e) => setSharedOnly(e.target.checked)}
            id="sharedOnly"
          />
          <label className="form-check-label" htmlFor="sharedOnly">Solo condivisi</label>
        </div>

        <div className="col-md-2 text-end">
          <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Importo</th>
              <th>Descrizione</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mov) => {
              const date = mov.timestamp.toDate();
              return (
                <tr key={mov.id}>
                  <td>{date.toLocaleDateString("it-IT")}</td>
                  <td>{mov.type}</td>
                  <td>{mov.category}</td>
                  <td>{mov.amount.toFixed(2)} €</td>
                  <td>{mov.description || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/movimenti/${mov.id}`)}
                    >
                      Dettaglio
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  Nessun movimento trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovimentiList;
