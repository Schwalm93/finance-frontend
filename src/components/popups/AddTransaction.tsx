import { Modal } from 'react-bootstrap';
import FileHandler from './FileHandler';

export const AddTransaction: React.FC<{
  handleFileuploadModal: (isOpen: boolean) => void;
}> = (props) => {



  return (
    <Modal show={true} onHide={() => props.handleFileuploadModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center" style={{ margin: '0 auto' }}>
          <h3>Add your Transactions</h3>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {' '}
        <FileHandler />
      </Modal.Body>
      <Modal.Footer>
       {/* <Button
          variant="secondary"
          onClick={() => props.handleFileuploadModal(false)}
        >
          Cancel
          </Button> */ }
        {/* <Button variant="primary" onClick={() => props.handleFileuploadModal(false)}>
          Save Changes
        </Button> */}
      </Modal.Footer>
    </Modal>

  );
};
