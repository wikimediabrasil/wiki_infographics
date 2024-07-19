import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./Pages/Home";
import OauthCallback from "./Pages/OauthCallback";
import Infographics from "./Pages/Infographics";
import './App.css';


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/oauth-callback" element={<OauthCallback />} /> 
        <Route path="/infographics" element={<Infographics />} /> 
      </Routes>
    </Router> 
  )
}

export default App
