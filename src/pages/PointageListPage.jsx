import React, { useEffect, useState } from 'react';
import { pointageService } from '../services/api';
import PointageForm from '../PointageForm';

function PointageListPage() {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour recharger la liste après ajout
  const reloadPointages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pointageService.getAllPointages();
      setPointages(data);
    } catch (err) {
      setError('Erreur lors du chargement des pointages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPointages();
  }, []);

  return (
    <div className="page-header">
      <div className="container-xl">
        <h2>📋 Liste des Pointages</h2>
        {/* Formulaire d'ajout de pointage */}
        <div className="mb-4">
          <PointageForm onPointageSuccess={reloadPointages} />
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3">Chargement des pointages...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">
            <strong>❌ {error}</strong>
          </div>
        ) : pointages.length === 0 ? (
          <div className="card">
            <div className="card-body text-center">
              <p>Aucun pointage enregistré.</p>
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

export default PointageListPage;