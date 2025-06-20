import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle} from "react-icons/fa";

const NavbarCustom = ({ onNewExpense, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Expense Tracker</a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-3">
              <button className="btn btn-primary me-2" onClick={() => navigate("/new")}>
                Nuova Operazione
              </button>
            </li>
            <li className="nav-item me-3">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate("/ticket")}>
                🛠️
                <span className="d-none d-md-inline">Assistenza</span>
            </button>
            </li>
            <li className="nav-item me-3">
              <button className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={() => navigate("/profile")}>
                <FaUserCircle size={20} />
                <span className="d-none d-md-inline">Profilo</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger" onClick={onLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarCustom;
