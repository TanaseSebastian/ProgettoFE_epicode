import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [emailMain, setEmailMain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailPartner, setEmailPartner] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && (!name || !emailMain)) return alert("Compila tutti i campi");
    if (step === 2 && password !== confirmPassword) return alert("Le password non corrispondono");
    if (!isAdmin && step === 3 && (!emailPartner || !partnerName)) return alert("Compila i dati della compagna");

    // Se admin, salta lo step 3
    if (isAdmin && step === 2) {
      handleRegister();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // Crea utente principale
      const mainUserCred = await createUserWithEmailAndPassword(auth, emailMain, password);
      const mainUID = mainUserCred.user.uid;

      // Salva utente principale nel DB
      await setDoc(doc(db, "users", mainUID), {
        uid: mainUID,
        email: emailMain,
        name: name,
        ruolo: "principale",
        role: isAdmin ? "admin" : "user"
      });

      if (!isAdmin) {
        // Crea partner con password temporanea
        const tempPassword = Math.random().toString(36).slice(-8);
        const partnerUserCred = await createUserWithEmailAndPassword(auth, emailPartner, tempPassword);
        const partnerUID = partnerUserCred.user.uid;

        // Salva partner nel DB
        await setDoc(doc(db, "users", partnerUID), {
          uid: partnerUID,
          email: emailPartner,
          name: partnerName,
          ruolo: "partner",
          role: "user"
        });

        // Invia reset password alla partner
        await sendPasswordResetEmail(auth, emailPartner);

        // Crea documento coppia
        await addDoc(collection(db, "coppie"), {
          utentePrincipale: mainUID,
          partner: partnerUID,
          createdAt: new Date()
        });
      }

      alert("Registrazione completata! Ora accedi.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Errore durante la registrazione: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Registrazione</h2>
      <form onSubmit={handleRegister} className="mx-auto" style={{ maxWidth: '400px' }}>

        {step === 1 && (
          <>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Il tuo nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="La tua email"
                value={emailMain}
                onChange={(e) => setEmailMain(e.target.value)}
                required
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="isAdminCheck"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isAdminCheck">
                Questo utente è un admin
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Conferma Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {!isAdmin && step === 3 && (
          <>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nome della tua compagna"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email della tua compagna"
                value={emailPartner}
                onChange={(e) => setEmailPartner(e.target.value)}
                required
              />
              <small className="form-text text-muted">
                Le verrà inviata un'email per impostare la sua password
              </small>
            </div>
          </>
        )}

        <div className="d-flex justify-content-between">
          {step > 1 && (
            <button type="button" className="btn btn-secondary" onClick={handleBack}>
              Indietro
            </button>
          )}
          {step < 3 && (
            <button type="button" className="btn btn-primary ms-auto" onClick={handleNext}>
              Avanti
            </button>
          )}
          {(!isAdmin && step === 3) && (
            <button type="submit" className="btn btn-success ms-auto" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Conferma e Registra"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Register;