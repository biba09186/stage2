import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children }) => {
  // Si l'utilisateur n'est pas authentifié, redirige vers /login
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Sinon, affiche la page demandée
  return children;
};

export default PrivateRoute;