import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';

/**
 * OauthCallback Component
 * Handles the OAuth callback authentication process.
 */
const OauthCallback = () => {
  const navigate = useNavigate();

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
          navigate("/infographics");
        }
      } catch (err) {
        navigate("/");
      }
    };
    oauthAuthenticate();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Authenticating.....</h2>
    </div>
  );
};

export default OauthCallback;
