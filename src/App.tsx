import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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
    <>
      <div >
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" Component={LandingPage} />
            <Route path="/home" Component={LandingPage} />
            <Route path="/showUsers" Component={UserManagement} />
            <Route path="/manageTransactions" Component={ManageTransaction} />
            <Route path="/manageAssets" Component={ManageAssets} />
            {<Route path="/*" Component={ErrorPage} />}
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;