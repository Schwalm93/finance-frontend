import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { Login } from '../popups/Login';
import { AddTransaction } from '../popups/AddTransaction';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';
//import { NavItem } from 'react-bootstrap';


export const Navigation: React.FC<{
  // handleShowUserEdit: Function; 
}> = () => {
  //const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAddTransaciton, setShowAddTransaction] = useState(false);
  const isLoggedIn = true;

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
      <Navbar expand="lg" className="app-nav">
        <Container fluid className="app-nav__bar">
          <Navbar.Brand className="app-nav__brand" href="/">
            <img
              alt=""
              src="https://upload.wikimedia.org/wikipedia/commons/c/c6/Money_coin.svg"
              width="50"
              height="50"
              className="app-nav__logo"
              onClick={() => navigater("/home")}
            />
            <div className="app-nav__brand-copy">
              <span className="app-nav__brand-name">GoFinance</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="app-nav__toggle" />
          <Navbar.Collapse id="basic-navbar-nav" className="app-nav__collapse">
            <Nav className="me-auto app-nav__menu">
              {/* <NavDropdown title="UserManagement" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => navigater("/showUsers")}>
                  Edit Users
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.2">Add User</NavDropdown.Item>
              </NavDropdown> */}
              <Nav.Link className="app-nav__item" onClick={() => navigater("/manageTransactions")}>
                Bank Transaktionen
              </Nav.Link>
              <Nav.Link className="app-nav__item" onClick={() => navigater("/manageAssets")}>
                Vermögen
              </Nav.Link>
              <NavDropdown className="app-nav__dropdown" title="Berechnungen" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => navigater("/calculate1")}>
                  Haus kaufen
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => navigater("/calculate2")}>
                  Zinsen
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <div className="app-nav__login-wrap">
              <Button
                className="app-nav__login"
                variant={isLoggedIn ? 'danger' : 'success'}
                as="input"
                type="button"
                value={isLoggedIn ? 'Logout' : 'Login'}
                size="lg"
                onClick={() => setShowLogin(true)}
              />
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {showLogin && <Login handleLoginModal={handleLoginModal} />}
      {showAddTransaciton && (
        <AddTransaction handleFileuploadModal={handleFileuploadModal} />
      )}
    </>
  );
};
