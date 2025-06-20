// src/AdminPanel.js – versione funzionale (React + Bootstrap + Redux)
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChartFill,
  PeopleFill,
  HeartFill,
  CashStack,
  List,
  BoxArrowRight,
} from "react-bootstrap-icons";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "./store/usersSlice";
import {
  fetchCouples,
  addCouple,
  updateCouple,
  deleteCouple,
} from "./store/couplesSlice";
import { fetchExpenses } from "./store/expensesSlice";
import { logout } from "./store/authSlice";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MENU = [
  { id: "dashboard", label: "Dashboard", icon: BarChartFill },
  { id: "users", label: "Utenti", icon: PeopleFill },
  { id: "couples", label: "Coppie", icon: HeartFill },
  { id: "expenses",  label: "Spese",      icon: CashStack },
];

export default function AdminPanel() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users.list);
  const couples = useSelector((s) => s.couples.list);
  const expenses = useSelector((s) => s.expenses.list);

  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalCouple, setModalCouple] = useState(null);
  const [selectedCoupleId, setSelectedCoupleId] = useState(null);

  // restituisce il nome dato un uid oppure l'uid troncato se manca
  const getUserName = (uid) => {
    if (!uid) return "—";
    const user = users.find((u) => u.uid === uid || u.id === uid);
    return user ? user.name : String(uid).slice(0, 8) + "…";
  };
  
  const describeCouple = (c) =>
    `${getUserName(c.utentePrincipale)} – ${getUserName(c.partner)}`;

  /* ---------------- FETCH DATA una sola volta ---------------- */
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCouples());
    dispatch(fetchExpenses());
  }, [dispatch]);

  /* ----------------- chart data ----------------- */
  const monthly = Array(12).fill(0);
  users.forEach((u) => {
    const m = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).getMonth() : 0;
    monthly[m]++;
  });
  const chartData = {
    labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
    datasets: [{ label: "Iscritti", data: monthly, backgroundColor: "rgba(13,110,253,0.7)" }],
  };

  /* ----------------- DASHBOARD ----------------- */
  const Dashboard = (
    <Container fluid>
      <Row className="g-4 mb-4">
        <Col md={4}><Card><Card.Body><small className="text-muted">Utenti</small><h3>{users.length}</h3></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><small className="text-muted">Coppie</small><h3>{couples.length}</h3></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><small className="text-muted">Spese</small><h3>{expenses.length}</h3></Card.Body></Card></Col>
      </Row>
      <Card><Card.Body><Bar data={chartData} options={{ plugins: { legend: { display: false } } }} /></Card.Body></Card>
    </Container>
  );

  /* ----------------- USERS TABLE ----------------- */
  const Users = (
    <Container fluid>
      <Button className="mb-3" onClick={() => setModalUser({})}>Aggiungi utente</Button>
      <Table striped hover responsive>
        <thead><tr><th>Nome</th><th>Email</th><th>Azione</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setModalUser(u)}>Modifica</Button>{" "}
                <Button size="sm" variant="outline-danger" onClick={() => dispatch(deleteUser(u.id))}>Elimina</Button>
              </td></tr>
          ))}
        </tbody>
      </Table>
      {modalUser !== null && (
        <Modal show onHide={() => setModalUser(null)}>
          <Modal.Header closeButton><Modal.Title>{modalUser.id ? "Modifica" : "Nuovo"} utente</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                modalUser.id ? dispatch(updateUser(modalUser)) : dispatch(addUser(modalUser));
                setModalUser(null);
              }}>
              <Form.Group className="mb-3"><Form.Label>Nome</Form.Label>
                <Form.Control value={modalUser.name || ""} onChange={(e) => setModalUser({ ...modalUser, name: e.target.value })} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Email</Form.Label>
                <Form.Control type="email" value={modalUser.email || ""} onChange={(e) => setModalUser({ ...modalUser, email: e.target.value })} required /></Form.Group>
              <Button type="submit">Salva</Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );

  /* ----------------- COUPLES TABLE ----------------- */
  const Couples = (
    <Container fluid>
      <Button className="mb-3" onClick={() => setModalCouple({})}>Aggiungi coppia</Button>
      <Table striped hover responsive>
        <thead><tr><th>Partner 1</th><th>Partner 2</th><th>Azione</th></tr></thead>
        <tbody>
          {couples.map((c) => (
            <tr key={c.id}>
              <td>{getUserName(c.utentePrincipale)}</td>
              <td>{getUserName(c.partner)}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setModalCouple(c)}>Modifica</Button>{" "}
                <Button size="sm" variant="outline-danger" onClick={() => dispatch(deleteCouple(c.id))}>Elimina</Button>
              </td></tr>
          ))}
        </tbody>
      </Table>
      {modalCouple !== null && (
        <Modal show onHide={() => setModalCouple(null)}>
          <Modal.Header closeButton><Modal.Title>{modalCouple.id ? "Modifica" : "Nuova"} coppia</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                modalCouple.id ? dispatch(updateCouple(modalCouple)) : dispatch(addCouple(modalCouple));
                setModalCouple(null);
              }}>
              <Form.Group className="mb-3"><Form.Label>Partner 1</Form.Label>
                <Form.Control value={modalCouple.partner1 || ""} onChange={(e) => setModalCouple({ ...modalCouple, partner1: e.target.value })} required /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Partner 2</Form.Label>
                <Form.Control value={modalCouple.partner2 || ""} onChange={(e) => setModalCouple({ ...modalCouple, partner2: e.target.value })} required /></Form.Group>
              <Button type="submit">Salva</Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );

  /* EXPENSES */
  const Expenses = (
    <Container fluid>
      {/* Selettore coppia */}
      <Form.Select
        className="mb-3"
        value={selectedCoupleId || ""}
        onChange={(e) => setSelectedCoupleId(e.target.value || null)}
      >
        <option value="">Seleziona una coppia</option>
        {couples.map((c) => (
          <option key={c.id} value={c.id}>
            {describeCouple(c)}
          </option>
        ))}
      </Form.Select>
  
      {/* Controllo: nessuna selezione */}
      {!selectedCoupleId && (
        <p className="text-muted">🔒 Seleziona una coppia per visualizzare le spese.</p>
      )}
  
      {/* Controllo: consenso mancante */}
      {selectedCoupleId && (() => {
        const coppia = couples.find((x) => x.id === selectedCoupleId);
        if (!coppia?.consensoDati) {
          return <p className="text-danger">❌ La coppia selezionata non ha acconsentito al trattamento dei dati. Le spese non possono essere visualizzate.</p>;
        }
  
        const filteredExpenses = expenses.filter((e) =>
          [coppia.partner1, coppia.partner2].includes(e.userId)
        );
  
        return (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Utente</th><th>Tipo</th><th>Categoria</th>
                <th>Importo</th><th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{getUserName(e.userId)}</td>
                  <td>{e.type}</td>
                  <td>{e.category}</td>
                  <td>€ {e.amount}</td>
                  <td>{new Date(e.timestamp.seconds * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      })()}
    </Container>
  );
  

  const renderPage = () => {
    switch (page) {
      case "dashboard": return Dashboard;
      case "users": return Users;
      case "couples": return Couples;
      case "expenses": return Expenses;
      default: return null;
    }
  };

  /* ----------------- SIDEBAR  ----------------- */
  const Sidebar = (
    <div
      className={`offcanvas-lg offcanvas-start bg-primary text-white d-flex flex-column`}
      style={{ width: 260, zIndex: 1045, height: "100vh", position: "relative" }}
    >
      {/* Titolo */}
      <div className="px-4 py-4 border-bottom border-primary-subtle">
        <div className="text-white text-uppercase small fw-semibold opacity-75">Expense Tracker</div>
        <div className="text-white fs-5 fw-bold">Amministrazione</div>
      </div>
  
      {/* Menu centrale scrollabile */}
      <div className="flex-grow-1 overflow-auto">
        <nav className="nav flex-column py-3">
          {MENU.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setPage(id); setMobileMenu(false); }}
              className={`nav-link d-flex align-items-center gap-2 px-4 py-2 rounded-start ${
                page === id ? "bg-white text-primary fw-semibold shadow-sm" : "text-white text-opacity-75"
              }`}
              style={{ textAlign: "left" }}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </div>
  
      {/* Logout fisso in basso */}
      <div
        className="border-top border-primary-subtle px-4 py-3"
        style={{ position: "sticky", bottom: 0, backgroundColor: "#0d6efd" }}
      >
        <button
          className="btn btn-danger w-100 d-flex align-items-center gap-2"
          onClick={() => dispatch(logout())}
        >
          <BoxArrowRight size={18} /> Logout
        </button>
      </div>
    </div>
  );
  
  
  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Mobile Topbar */}
      <div className="d-lg-none bg-primary text-white w-100 d-flex align-items-center justify-content-between px-3" style={{ height: 56 }}>
        <span className="fw-bold">Admin</span>
        <button className="btn btn-sm text-white" onClick={() => setMobileMenu(true)}>
          <List size={22} />
        </button>
      </div>

      {/* Overlay mobile */}
      {mobileMenu && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={() => setMobileMenu(false)} />}

      {Sidebar}

      <main className="flex-grow-1 overflow-auto p-4 pt-lg-4 pt-2">
        <h2 className="fw-bold text-capitalize mb-4">{page}</h2>
        {renderPage()}
      </main>
    </div>
  );
}
