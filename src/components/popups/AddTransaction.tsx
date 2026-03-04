import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import FileHandler from './FileHandler';

export const AddTransaction: React.FC<{
  handleFileuploadModal: (isOpen: boolean) => void;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
    props.handleFileuploadModal(false);
  };

  return (
    <Modal show={isOpen} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center" style={{ margin: '0 auto' }}>
          <h3>Add your Transactions</h3>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FileHandler onUploadSuccess={closeModal} />
      </Modal.Body>
      <Modal.Footer>
        {/* <Button
          variant="secondary"
          onClick={closeModal}
        >
          Cancel
          </Button> */}
        {/* <Button variant="primary" onClick={() => props.handleFileuploadModal(false)}>
          Save Changes
        </Button> */}
      </Modal.Footer>
    </Modal>
  );
};
