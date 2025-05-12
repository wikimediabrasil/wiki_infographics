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

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oauth-callback" element={<OauthCallback />} /> 

        <Route
          path="/infographics"
          element={
            <ProtectedRoutes>
              <Infographics />
            </ProtectedRoutes>
          }
        />
        
      </Routes>
    </Router>

  )
}

export default App
