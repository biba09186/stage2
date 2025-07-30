import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { pointageService } from '../services/api';

function ChefDashboard() {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadPointages();
  }, []);

  const loadPointages = async () => {
    try {
      const data = await pointageService.getPointages();
      setPointages(data);
    } catch (error) {
      setError('Erreur lors du chargement des pointages');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (pointageId, isValid) => {
    try {
      // Simulation de validation (à implémenter côté backend)
      const updatedPointages = pointages.map(p => 
        p.id === pointageId 
          ? { ...p, valide: isValid, validateur: user.nom + ' ' + user.prenom }
          : p
      );
      setPointages(updatedPointages);
      
      // Ici vous feriez un appel API pour sauvegarder la validation
      console.log(`Pointage ${pointageId} ${isValid ? 'validé' : 'rejeté'} par ${user.nom}`);
    } catch (error) {
      setError('Erreur lors de la validation');
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: '#f5f7fb'}}>
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-xl">
          <span className="navbar-brand">👨‍💼 Dashboard Chef d'Équipe</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">Bonjour, {user.prenom} {user.nom}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container-xl py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1>Validation des Pointages</h1>
            <p className="text-muted">Validez ou rejetez les pointages des employés</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            ❌ {error}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Pointages à valider ({pointages.filter(p => !p.hasOwnProperty('valide')).length})
            </h3>
          </div>
          <div className="card-body">
            {pointages.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">Aucun pointage à valider</p>
              </div>
            ) : (
              <div className="row g-3">
                {pointages.map((pointage) => (
                  <div key={pointage.id} className="col-12 col-md-6 col-lg-4">
                    <div className={`card border ${
                      pointage.valide === true ? 'border-success' :
                      pointage.valide === false ? 'border-danger' : 'border-warning'
                    }`}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title">
                              {pointage.employe_nom} {pointage.employe_prenom}
                            </h5>
                            <p className="text-muted small mb-1">CIN: {pointage.employe_cin}</p>
                            <span className={`badge ${
                              pointage.entite === 'DTC' ? 'bg-primary' :
                              pointage.entite === 'DTV' ? 'bg-success' :
                              'bg-warning'
                            }`}>
                              {pointage.entite}
                            </span>
                          </div>
                          <span className="badge bg-light text-dark">#{pointage.id}</span>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            📅 {new Date(pointage.date_pointage).toLocaleDateString('fr-FR')} - 
                            🕐 {new Date(pointage.date_pointage).toLocaleTimeString('fr-FR', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </small>
                        </div>

                        {pointage.hasOwnProperty('valide') ? (
                          <div className={`alert ${pointage.valide ? 'alert-success' : 'alert-danger'} mb-0`}>
                            {pointage.valide ? '✅ Validé' : '❌ Rejeté'}
                            <br/>
                            <small>par {pointage.validateur}</small>
                          </div>
                        ) : (
                          <div className="d-grid gap-2">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleValidation(pointage.id, true)}
                            >
                              ✅ Valider
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleValidation(pointage.id, false)}
                            >
                              ❌ Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefDashboard;