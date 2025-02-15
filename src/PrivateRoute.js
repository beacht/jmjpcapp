import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();  // Use isLoggedIn from context

  if (!isLoggedIn) {
    return <Navigate to="/login" />;  // Redirect to login if not logged in
  }

  return children;  // Otherwise, render the child component
};

export default PrivateRoute;
