import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const MovimentoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movimento, setMovimento] = useState(null);

  useEffect(() => {
    const fetchMovimento = async () => {
      const docSnap = await getDoc(doc(db, "expenses", id));
      if (docSnap.exists()) {
        setMovimento({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchMovimento();
  }, [id]);

  if (!movimento) return <p>Caricamento...</p>;

  const date = movimento.timestamp.toDate();

  return (
    <div className="container mt-5">
      <h2>Dettaglio Movimento</h2>
      <ul className="list-group mt-3">
        <li className="list-group-item"><strong>Data:</strong> {date.toLocaleDateString()}</li>
        <li className="list-group-item"><strong>Ora:</strong> {date.toLocaleTimeString()}</li>
        <li className="list-group-item"><strong>Tipo:</strong> {movimento.type}</li>
        <li className="list-group-item"><strong>Categoria:</strong> {movimento.category}</li>
        <li className="list-group-item"><strong>Importo:</strong> {movimento.amount.toFixed(2)} €</li>
        <li className="list-group-item"><strong>Descrizione:</strong> {movimento.description || "—"}</li>
      </ul>
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Torna indietro</button>
    </div>
  );
};

export default MovimentoDetail;
