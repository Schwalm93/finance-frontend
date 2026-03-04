import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserManagement } from "./components/sites/UserManagement";
import { Navigation } from "./components/navigation/Navigation";
import { ErrorPage } from "./components/sites/ErrorPage";
import { LandingPage } from "./components/sites/LandingPage";
import { ManageTransaction } from "./components/sites/ManageTransactions";
import ManageAssets from "./components/sites/ManageAssets";

export const App = () => {
  //const [loggedIn] = useState(false);
  //const [admin, setAdmin] = useState(false);

  return (
    <div className="app-shell">
      <div className="app-shell__orb app-shell__orb--left"></div>
      <div className="app-shell__orb app-shell__orb--right"></div>
      <Router>
        <Navigation />
        <main className="app-main">
          <div className="app-content">
            <Routes>
              <Route path="/" Component={LandingPage} />
              <Route path="/home" Component={LandingPage} />
              <Route path="/showUsers" Component={UserManagement} />
              <Route path="/manageTransactions" Component={ManageTransaction} />
              <Route path="/manageAssets" Component={ManageAssets} />
              {<Route path="/*" Component={ErrorPage} />}
            </Routes>
          </div>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </div>
  );
}

export default App;
