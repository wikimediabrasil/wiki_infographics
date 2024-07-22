import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link
} from "react-router-dom";
// import { useEffect } from "react";
// import api from "./api/axios";

import TodoPage from './Pages/TodoPage';
import Show from "./Pages/Show";
import Home from "./Pages/Home";
import OauthCallback from "./Pages/OauthCallback";
import './App.css';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/oauth-callback" element={<OauthCallback />} /> 
        <Route path="/todos" element={<TodoPage/>} /> 
        <Route path="/todos/:id" element={<Show/>} /> 
      </Routes>
    </Router> 
  )
}

export default App
