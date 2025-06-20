import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ConsentModal = ({ show, onAccept, onDismiss }) => {
  const [accepted, setAccepted] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (show) setAccepted(false);
  }, [show]);

  return (
    <Modal show={show} onHide={onDismiss} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Consenso al Trattamento dei Dati</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p><strong>Caro utente,</strong></p>
        <p>
          Per ricevere supporto tecnico in caso di problemi, potremmo dover visualizzare i tuoi
          movimenti (entrate/uscite) esclusivamente allo scopo di aiutarti a risolvere eventuali
          malfunzionamenti dell’app.
        </p>
        <ul>
          <li>I dati non verranno mai condivisi con terze parti.</li>
          <li>Puoi revocare il consenso in qualsiasi momento.</li>
          <li>Puoi comunque usare l’app anche senza accettare.</li>
        </ul>
        <Form.Check
          type="checkbox"
          id="consentCheckbox"
          label="Ho letto e accetto il trattamento dei dati per l’assistenza"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-3"
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onDismiss}>
          Più tardi
        </Button>
        <Button variant="primary" onClick={onAccept} disabled={!accepted}>
          Accetto e continuo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConsentModal;
