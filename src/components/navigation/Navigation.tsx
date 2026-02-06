import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { Login } from '../popups/Login';
import { AddTransaction } from '../popups/AddTransaction';
import { useNavigate } from 'react-router-dom';
//import { NavItem } from 'react-bootstrap';


export const Navigation: React.FC<{
  // handleShowUserEdit: Function; 
}> = () => {
  //const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddTransaciton, setShowAddTransaction] = useState(false);

  function handleLoginModal(state: boolean) {
    setShowLogin(state);
  }

  function handleFileuploadModal(state: boolean) {
    setShowAddTransaction(state);
  }

  // function handleHomeButton() {
  //   props.handleShowUserEdit(false);
  // }

  const navigater = useNavigate();

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="https://upload.wikimedia.org/wikipedia/commons/c/c6/Money_coin.svg"
              width="50"
              height="50"
              className="d-inline-block align-top"
              onClick={() => navigater("/home")}
            />{' '}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* <NavDropdown title="UserManagement" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => navigater("/showUsers")}>
                  Edit Users
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.2">Add User</NavDropdown.Item>
              </NavDropdown> */}
              <NavDropdown title="Bank Transaktionen" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => setShowAddTransaction(true)}>
                  Hinzufügen
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigater("/manageTransactions")}>
                  Übersicht
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Vermögen" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => setShowAddTransaction(true)}>
                  Anpassen
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigater("/manageAssets")}>
                  Übersicht
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Berechnungen" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => navigater("/calculate1")}>
                  Haus kaufen
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigater("/calculate2")}>
                  Zinsen
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
        <div className="m-4 mt-1 mb-1">
          <Button
            variant={!true ? 'success' : 'danger'}
            as="input"
            type="button"
            value={!true ? 'Login' : 'Logout'}
            size="lg"
            onClick={() => setShowLogin(true)}
          />
        </div>
      </Navbar>
      {showLogin && <Login handleLoginModal={handleLoginModal} />}
      {showAddTransaciton && (
        <AddTransaction handleFileuploadModal={handleFileuploadModal} />
      )}
    </>
  );
};
