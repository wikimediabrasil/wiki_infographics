/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/axios';

/**
 * ProtectedRoutes component to guard routes and redirect unauthenticated users.
 * 
 * @param {ReactNode} children - The child components to render if authenticated.
 * @returns {JSX.Element|null} The children components if authenticated, otherwise null.
 */
const ProtectedRoutes = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await api.get("/user-info");
        if (response.data.username) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate('/');
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoutes;
