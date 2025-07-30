import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import PointageProcessPage from './pages/PointageProcess'; // CHANGEMENT ICI
import PointageListPage from './pages/PointageListPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import EmployeeListPage from './pages/EmployeeListPage';
import './styles/global.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Toujours vérifier l'état d'authentification à chaque navigation
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => !!localStorage.getItem('authToken'));

  React.useEffect(() => {
    const auth = !!localStorage.getItem('authToken');
    setIsAuthenticated(auth);
    if (!auth && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  const handleLogin = () => {
    localStorage.setItem('authToken', 'true');
    setIsAuthenticated(true);
    navigate('/accueil', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="container">
      {/* Barre de navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <Link className="navbar-brand d-flex align-items-center" to="/accueil" style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '2px', color: '#142850', fontFamily: 'Montserrat, sans-serif', textShadow: '0 2px 8px rgba(20,40,80,0.08)' }}>
          <span style={{
            background: 'linear-gradient(90deg, #142850 0%, #27496d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(20,40,80,0.08)'
          }}>MarsaTrack</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated && location.pathname !== '/login' && (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/accueil">Accueil</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/employes">Employés</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pointages">Liste des Pointages</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pointage">Pointage</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger ms-3" onClick={handleLogout}>Déconnexion</button>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* Définition des routes */}
      <Routes>
        {/* Page d'accueil publique */}
        <Route path="/" element={<HomePage />} />
        {/* Redirection explicite de /home vers / */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        {/* Route publique */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Routes protégées */}
        <Route path="/accueil" element={isAuthenticated ? <EmployeeListPage /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/pointage" element={isAuthenticated ? <PointageProcessPage /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/employes" element={isAuthenticated ? <EmployeeListPage onlyList={true} /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/ajouter-employe" element={isAuthenticated ? <EmployeeListPage onlyForm={true} /> : <LoginPage onLogin={handleLogin} />} />

        {/* Route par défaut pour les pages non trouvées */}
        <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;