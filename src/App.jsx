import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { doc, getDoc } from "firebase/firestore";
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './AdminRoute';
import Profile from './pages/Profile';
import NavbarCustom from './components/NavbarCustom';
import MovimentiList from "./pages/MovimentiList";
import MovimentoDetail from "./components/MovimentoDetail";
import TicketList from "./tickets/TicketList";
import TicketDetail from "./tickets/TicketDetail";
import TicketForm from "./tickets/TicketForm";

function App() {
  const [user, setUser] = useState(null);
  const [reloadData, setReloadData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userData
          });
        } else {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: 'user'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {user && user.role !== 'admin' && (
        <NavbarCustom onLogout={handleLogout} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <Dashboard reloadData={reloadData} setReloadData={setReloadData} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/new"
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <ExpenseForm
                  onFormSubmit={() => setReloadData(true)}
                />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/movimenti" element={<MovimentiList />} />
        <Route path="/movimenti/:id" element={<MovimentoDetail />} />

        <Route path="/profile" element={<Profile />} />

        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminPanel />
            </AdminRoute>
          }
        />

      <Route path="/ticket" element={user ? <TicketList user={user} /> : <Navigate to="/login" />} />
      <Route path="/ticket/new" element={user ? <TicketForm user={user} /> : <Navigate to="/login" />} />
      <Route path="/ticket/:id" element={user ? <TicketDetail user={user} /> : <Navigate to="/login" />} />



        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
        />

        <Route
          path="./pages/Register"
          element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
