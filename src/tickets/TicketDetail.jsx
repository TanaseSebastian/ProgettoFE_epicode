import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const TicketDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      const ticketSnap = await getDoc(doc(db, "tickets", id));
      if (ticketSnap.exists()) setTicket({ id: ticketSnap.id, ...ticketSnap.data() });

      const msgQ = query(
        collection(db, "tickets", id, "messages"),
        orderBy("createdAt", "asc")
      );
      const msgSnap = await getDocs(msgQ);
      setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchTicket();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await addDoc(collection(db, "tickets", id, "messages"), {
        sender: user.uid,
        text: reply,
        createdAt: Timestamp.now(),
      });
      setReply("");
      const updated = await getDocs(query(collection(db, "tickets", id, "messages"), orderBy("createdAt", "asc")));
      setMessages(updated.docs.map(d => ({ id: d.id, ...d.data() })));
      toast.success("Messaggio inviato");
    } catch {
      toast.error("Errore invio messaggio");
    }
  };

  if (!ticket) return <p>Caricamento...</p>;

  return (
    <div className="container mt-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>← Torna indietro</button>
      <h2>{ticket.subject}</h2>

      {/* Conversazione */}
      <div className="mt-4 border rounded p-3 bg-light" style={{ maxHeight: 500, overflowY: "auto" }}>
        {messages.map((m) => {
          const isUser = m.sender === user.uid;
          return (
            <div
              key={m.id}
              className={`mb-4 d-flex ${isUser ? "justify-content-end" : "justify-content-start"}`}
            >
              <div className={`p-3 rounded-3 shadow-sm ${isUser ? "bg-primary text-white" : "bg-white border"}`} style={{ maxWidth: "75%" }}>
                <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>
                  {isUser ? "Tu" : "Operatore"}
                </div>
                <div>{m.text}</div>
                <div className="mt-1 text-end" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  {new Date(m.createdAt.toDate()).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form risposta */}
      {ticket.status === "open" && (
        <form onSubmit={handleReply} className="mt-4">
          <label className="form-label">Rispondi:</label>
          <textarea
            className="form-control"
            rows="4"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button className="btn btn-primary mt-2">Invia risposta</button>
        </form>
      )}
    </div>
  );
};

export default TicketDetail;
