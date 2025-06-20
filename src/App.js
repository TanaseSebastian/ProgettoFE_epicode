import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase'; // Ensure db is imported
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ExpenseForm from './ExpenseForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Removed to fix compilation error
import 'bootstrap/dist/css/bootstrap.min.css'; // Removed to fix compilation error
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Removed to fix compilation error
import { doc, getDoc } from "firebase/firestore";
import AdminPanel from './AdminPanel';
import AdminRoute from './AdminRoute';

function App() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

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
          // If user document doesn't exist, treat as a regular user without specific roles
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: 'user' // Default role if not found in Firestore
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false); // Set loading to false after auth state is determined
    });
    return () => unsubscribe();
  }, []);

  const toggleForm = () => setShowForm(!showForm);
  const handleFormSubmit = () => {
    setReloadData(true);
    setShowForm(false);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  // Show a loading indicator while determining auth state
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

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === 'admin' ? (
                // If user is admin, redirect to admin panel
                <Navigate to="/admin" />
              ) : (
                // If user is logged in but not admin, show dashboard
                <>
                  {/* Navbar */}
                  <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                      <a className="navbar-brand" href="/">Expense Tracker</a>
                      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                          <li className="nav-item mt-3">
                            <button className="btn btn-primary me-2" onClick={toggleForm}>Nuova Operazione</button>
                          </li>
                          <li className="nav-item mt-3">
                            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </nav>

                  {showForm ? (
                    <div className="container mt-5">
                      <ExpenseForm onFormSubmit={handleFormSubmit} />
                      <div className="text-center mt-3">
                        <button className="btn btn-secondary" onClick={toggleForm}>
                          Torna alla Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Dashboard reloadData={reloadData} setReloadData={setReloadData} showExpenseForm={toggleForm} />
                  )}
                </>
              )
            ) : (
              // If user is not logged in, redirect to login
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminPanel />
            </AdminRoute>
          }
        />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
