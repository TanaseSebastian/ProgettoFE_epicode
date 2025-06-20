import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const TicketList = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const q = query(
        collection(db, "tickets"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTickets();
  }, [user.uid]);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <h2>I tuoi ticket</h2>
        <button className="btn btn-primary" onClick={() => navigate("/ticket/new")}>
          ➕ Nuovo Ticket
        </button>
      </div>

      <ul className="list-group mt-4">
        {tickets.map(t => (
          <li
            key={t.id}
            className="list-group-item d-flex justify-content-between align-items-center"
            onClick={() => navigate(`/ticket/${t.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div>
              <strong>{t.subject}</strong><br />
              <small>{new Date(t.createdAt.toDate()).toLocaleString()}</small>
            </div>
            <span className={`badge ${t.status === "open" ? "bg-success" : "bg-secondary"}`}>
              {t.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketList;
