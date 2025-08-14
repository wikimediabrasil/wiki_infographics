import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

import { Notification } from "../Components/Notification/notification";

/**
 * Home component for user authentication and login.
 * 
 * This component:
 * - Checks if the user is authenticated on mount.
 * - Redirects authenticated users to the "/infographics" route.
 * - Provides a button to initiate login with Wikimedia.
 * 
 * @returns {JSX.Element} The Home component.
 */
const Home = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const continue_to_app = async () => {
    navigate("/infographics");
  };

  const handleClearError = () => {
    setError("");
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {error && <Notification message={error} clearError={handleClearError}/>}
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to Wiki Infographics</h1>
      <button 
        onClick={continue_to_app} 
        className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300"
      >
        Continue
      </button>
    </div>
  );
};

export default Home;
