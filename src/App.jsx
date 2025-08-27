import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./Pages/Home";
import OauthCallback from "./Pages/OauthCallback";
import Infographics from "./Pages/Infographics";
import ProtectedRoutes from "./Components/ProtectedRoutes/protectedRoutes";
import './App.css';


const App = () => {

  return (

    <div className="bg-gray-100 dark:bg-gray-700">
      <Router basename="/web">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/infographics"
            element={<Infographics />}
          />

        </Routes>
      </Router>
    </div>

  )
}

export default App
