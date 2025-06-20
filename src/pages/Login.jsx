import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Recupera dati utente da Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        throw new Error("Utente non trovato nel database.");
      }

      const userData = userSnap.data();

      // Verifica se l'utente è in una coppia
      const coppieRef = collection(db, "coppie");
      const queryPrincipale = query(coppieRef, where("utentePrincipale", "==", user.uid));
      const queryPartner = query(coppieRef, where("partner", "==", user.uid));

      const [res1, res2] = await Promise.all([getDocs(queryPrincipale), getDocs(queryPartner)]);
      const coppiaEsistente = !res1.empty || !res2.empty;

      if (!coppiaEsistente) {
        toast.error("La tua coppia non è ancora stata creata. Contatta il tuo partner.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Salva l'utente nel localStorage (opzionale, o usare Context)
      localStorage.setItem("userData", JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: userData.name || "",
        ruolo: userData.ruolo || ""
      }));

      toast.success("Login effettuato con successo!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      toast.error("Errore durante il login: " + error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#001f3f" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-10">
            <div className="card" style={{ borderRadius: "1rem" }}>
              <div className="row g-0">
                
                {/* Colonna Immagine */}
                <div className="col-md-6 col-lg-5 d-none d-md-block" style={{ backgroundColor: "#001f3f" }}> 
                  <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: "#001f3f", borderRadius: "1rem 0 0 1rem" }}>
                    <img src="./sebastian.png" alt="login form" className="img-fluid" style={{ maxHeight: "80%", maxWidth: "80%" }} />
                  </div>
                </div>
                
                {/* Colonna Form */}
                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                  <div className="card-body p-4 p-lg-5 text-black">
                    <form onSubmit={handleLogin}>
                      <div className="text-center">
                        <img src="./logo.png" style={{ width: "185px" }} alt="logo" />
                        <h4 className="mt-1 mb-5 pb-1">Sistema Expense-Tracker Tanase</h4>
                      </div>

                      <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Accedi al tuo account</h5>

                      <div className="form-outline mb-4">
                        <input 
                          type="email" 
                          id="email" 
                          className="form-control form-control-lg" 
                          placeholder="Indirizzo email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="email">Indirizzo email</label>
                      </div>

                      <div className="form-outline mb-4">
                        <input 
                          type="password" 
                          id="password" 
                          className="form-control form-control-lg" 
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="password">Password</label>
                      </div>

                      <div className="pt-1 mb-4">
                        <button className="btn btn-dark btn-lg btn-block" type="submit">
                          Login
                        </button>
                      </div>

                      <a className="small text-muted" href="#!">Password dimenticata?</a>
                      <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                        Non hai un account? <Link to="./pages/Register" style={{ color: "#393f81" }}>Registrati qui</Link>
                      </p>
                      <a href="#!" className="small text-muted">Termini di utilizzo.</a>
                      <a href="#!" className="small text-muted">Politica sulla privacy</a>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
