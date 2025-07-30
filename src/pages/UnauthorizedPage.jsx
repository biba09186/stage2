import React from 'react';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{background: '#f5f7fb'}}>
      <div className="text-center">
        <h1 style={{fontSize: '6rem'}}>🚫</h1>
        <h2>Accès non autorisé</h2>
        <p className="text-muted mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/login" className="btn btn-primary">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;