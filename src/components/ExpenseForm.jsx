import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ExpenseForm = ({ onFormSubmit }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [shared, setShared] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userName = userData?.name || "Utente";
  
    if (user) {
      try {
        if (isNaN(amount) || amount <= 0) {
          toast.error("Inserisci un importo valido.", { autoClose: 3000 });
          return;
        }
  
        await addDoc(collection(db, "expenses"), {
          uid: user.uid, // 🔄 importante!
          userName,
          amount: parseFloat(amount),
          type: type === "income" ? "Entrata" : "Spesa",
          category,
          description,
          shared,
          timestamp: date,
        });
  
        toast.success("Transazione registrata con successo!", {
          position: "top-right",
          autoClose: 3000,
        });
  
        setAmount("");
        setCategory("");
        setDescription("");
        setDate(new Date());
        setType("income");
        onFormSubmit();
        navigate("/");
  
      } catch (error) {
        console.error("Errore nel salvataggio: ", error);
        toast.error("Errore nella registrazione della transazione!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };
  

  const incomeCategories = ["Stipendio", "Bonus", "Freelance/Prestazione", "Investimenti", "Altro"];
  const expenseCategories = [
    "Affitto/Mutuo",
    "Spese Mediche (Dentista, Visite)",
    "Trasporti (Benzina, Manutenzione Auto)",
    "Cibo (Supermercato, Cibo quotidiano)",
    "Mangiare fuori (Ristoranti, Bar)",
    "Tempo Libero (Viaggi, Cinema)",
    "Formazione",
    "Shopping",
    "Altro",
  ];

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
        <h4 className="mb-4 text-center">Aggiungi una nuova Entrata/Spesa</h4>

        {/* Importo */}
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Importo</label>
          <input
            type="number"
            className="form-control"
            id="amount"
            placeholder="Inserisci l'importo"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Tipo di transazione */}
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Tipo</label>
          <select
            className="form-select"
            id="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategory(""); // Reset della categoria quando si cambia il tipo
            }}
            required
          >
            <option value="income">Entrata</option>
            <option value="expense">Spesa</option>
          </select>
        </div>

        {/* Categoria basata sul tipo */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Categoria</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Seleziona una categoria</option>
            {type === "income" &&
              incomeCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            {type === "expense" &&
              expenseCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="shared"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="shared">
            Spesa/Entrata comune con il partner
          </label>
        </div>

        {/* Descrizione */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descrizione</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            placeholder="Aggiungi una descrizione (opzionale)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Data e ora */}
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Data e ora</label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy h:mm aa"
            className="form-control"
          />
        </div>

        {/* Pulsante di invio */}
        <div className="text-center">
          <button type="submit" className="btn btn-success w-100">Aggiungi Entrata/Spesa</button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
