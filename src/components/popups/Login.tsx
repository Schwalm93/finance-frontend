import { Button, Form, Modal } from 'react-bootstrap';
import './ModalTheme.css';
import './Login.css';

type LoginProps = {
  handleLoginModal: (isOpen: boolean) => void;
};

export const Login: React.FC<LoginProps> = ({ handleLoginModal }) => {
  const closeModal = () => {
    handleLoginModal(false);
  };

  return (
    <Modal
      show={true}
      onHide={closeModal}
      centered
      dialogClassName="login-modal__dialog"
      contentClassName="login-modal__content"
    >
      <Modal.Header closeButton className="login-modal__header">
        <Modal.Title className="login-modal__title">Willkommen zurück</Modal.Title>
      </Modal.Header>
      <Modal.Body className="login-modal__body">
        <div className="login-modal__hero">
          <span className="login-modal__eyebrow">GoFinance</span>
          <h2>Deine Finanzen an einem Ort.</h2>
          <p>
            Melde dich an, um Transaktionen, Vermögen und Auswertungen in einem
            klaren Workflow zu verwalten.
          </p>
          <div className="login-modal__highlights">
            <div>
              <strong>Live Überblick</strong>
              <span>Konten, Uploads und Kategorien schnell im Blick.</span>
            </div>
            <div>
              <strong>Weniger Reibung</strong>
              <span>Kurzer Einstieg, klare Felder, direkte Aktion.</span>
            </div>
          </div>
        </div>

        <Form className="login-modal__form">
          <Form.Group className="mb-3" controlId="loginUsername">
            <Form.Label>Benutzername</Form.Label>
            <Form.Control
              type="text"
              placeholder="max.mustermann"
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="loginPassword">
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              placeholder="Passwort eingeben"
              autoComplete="current-password"
            />
          </Form.Group>

          <div className="login-modal__meta">
            <Form.Check
              type="checkbox"
              id="loginRemember"
              label="Angemeldet bleiben"
            />
            <a href="#" className="login-modal__link">
              Passwort vergessen?
            </a>
          </div>

          <div className="login-modal__actions">
            <Button variant="light" className="login-modal__secondary" onClick={closeModal}>
              Abbrechen
            </Button>
            <Button variant="dark" className="login-modal__primary" onClick={closeModal}>
              Einloggen
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
