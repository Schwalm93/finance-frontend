import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import FileHandler from './FileHandler';
import './ModalTheme.css';

export const AddTransaction: React.FC<{
  handleFileuploadModal: (isOpen: boolean) => void;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
    props.handleFileuploadModal(false);
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      centered
      dialogClassName="app-modal__dialog"
      contentClassName="app-modal__content"
    >
      <Modal.Header closeButton className="app-modal__header">
        <div className="app-modal__title-wrap">
          <span className="app-modal__eyebrow">Transaktionen</span>
          <Modal.Title className="app-modal__title">Datei hochladen</Modal.Title>
          <p className="app-modal__subtitle">
            Importiere neue Banktransaktionen per Datei-Upload und schließe den
            Vorgang direkt im Modal ab.
          </p>
        </div>
      </Modal.Header>
      <Modal.Body className="app-modal__body">
        <div className="app-modal__surface">
          <FileHandler onUploadSuccess={closeModal} />
        </div>
      </Modal.Body>
      <Modal.Footer className="app-modal__footer">
        <div className="app-modal__actions">
          <Button
            variant="light"
            className="app-modal__button-outline"
            onClick={closeModal}
          >
            Schließen
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
