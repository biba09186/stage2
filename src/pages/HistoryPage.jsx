import React, { useState, useEffect } from 'react';
import { pointageService } from '../services/api';

function HistoryPage() {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointages();
  }, []);

  const loadPointages = async () => {
    try {
      const data = await pointageService.getPointages();
      setPointages(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="page-header">
      <div className="container-xl">
        <h2>📋 Historique des Pointages</h2>
        
        {pointages.length === 0 ? (
          <div className="card">
            <div className="card-body text-center">
              <p>Aucun pointage enregistré</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>CIN</th>
                      <th>Entité</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointages.map((pointage) => (
                      <tr key={pointage.id}>
                        <td>{pointage.employe_nom}</td>
                        <td>{pointage.employe_prenom}</td>
                        <td>{pointage.employe_cin}</td>
                        <td>{pointage.entite}</td>
                        <td>{new Date(pointage.date_pointage).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;