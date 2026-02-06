import { Button, Modal } from 'react-bootstrap';

export const Login: React.FC<{
  handleLoginModal: Function;
}> = (props) => {
  return (
    <Modal show={true} onHide={() => props.handleLoginModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center">Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{display: 'flex'}}>
          <div>
            <h4 style={{marginBottom: 20 }}>Username</h4>
            <h4>Password</h4>
          </div>
          <div>
            <input className="m-3 mt-0" type="text"></input>
            <input className="m-3 mt-0 " type="password"></input>
          </div>
        </div>
        <a href="#">forgot your password?</a>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => props.handleLoginModal(false)}
        >
          Close
        </Button>
        <Button variant="primary" onClick={() => props.handleLoginModal(false)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
