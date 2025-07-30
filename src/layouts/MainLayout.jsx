import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: '🏠', label: 'Accueil', path: '/' },
    { icon: '👤', label: 'Pointage', path: '/pointage' },
    { icon: '🕐', label: 'Historique', path: '/history' },
  ];

  return (
    <div className="page">
      <header className="navbar navbar-expand-md navbar-dark bg-primary d-print-none">
        <div className="container-xl">
          <button 
            className="navbar-toggler" 
            type="button"
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <h1 className="navbar-brand mb-0">
            <Link to="/" className="text-white text-decoration-none">
              MarsaTrack
            </Link>
          </h1>
        </div>
      </header>

      <div className="page-wrapper">
        <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <div className="navbar-nav">
            {menuItems.map((item, index) => (
              <div className="nav-item" key={index}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="page-body">
          <div className="container-xl py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;