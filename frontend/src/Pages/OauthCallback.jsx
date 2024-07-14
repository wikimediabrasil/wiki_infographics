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
        if (response.data.msg === "Authenticaction sucessfull") {
          navigate("/todos");
        }
      } catch (err) {
        navigate("/");
      }
    };
    oauthAuthenticate();
  }, [navigate]);

  return (
    <>
      <h4> Authenticating..... </h4>
    </>
  );
};

export default OauthCallback;
