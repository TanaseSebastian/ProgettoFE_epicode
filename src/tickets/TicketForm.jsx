import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TicketForm = ({ user }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 👈 aggiunto hook per navigare

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return toast.error("Compila tutti i campi.");
    setLoading(true);

    try {
      const ticketRef = await addDoc(collection(db, "tickets"), {
        uid: user.uid,
        email: user.email,
        subject,
        status: "open",
        createdAt: Timestamp.now(),
      });

      await addDoc(collection(db, "tickets", ticketRef.id, "messages"), {
        sender: user.uid,
        text: message,
        createdAt: Timestamp.now(),
      });

      toast.success("Ticket inviato con successo!");
      navigate("/ticket"); // 👈 redirect alla lista
    } catch {
      toast.error("Errore durante l'invio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2>Nuovo Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Oggetto</label>
          <input type="text" className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Messaggio</label>
          <textarea className="form-control" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Invio..." : "Invia Ticket"}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
