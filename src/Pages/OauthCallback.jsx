import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';

import { Notification } from '../Components/Notification/notification';

/**
 * OauthCallback Component
 * Handles the OAuth callback authentication process.
 */
const OauthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  

  useEffect(() => {
    /**
     * Authenticate the user via OAuth.
     * Sends the query string to the backend for authentication.
     */
    const oauthAuthenticate = async () => {
      try {
        const queryString = window.location.search.substring(1);
        const response = await api.post('/oauth-callback', { queryString: queryString });
        console.log(response.data.msg);
        if (response.data.msg === "Authentication successful") {
          navigate("/infographics", { state: { data: response.data.data.username } });
        }
      } catch (error) {
        setError(error?.response?.data?.error || "Error Authenticating User")
        console.error(error?.response?.data?.error || error);
        setTimeout(() => {
          navigate("/");
        }, 5000);
      }
    };
    oauthAuthenticate();
  }, [navigate]);

  const handleClearError = () => {
    setError("");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      {error && <Notification message={error} clearError={handleClearError}/>}
      <h2 className="text-2xl font-bold">Authenticating.....</h2>
    </div>
  );
};

export default OauthCallback;
