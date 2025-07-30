import React, { useState, useEffect } from 'react';
import CardScanner from '../components/CardScanner';
import { employeeApi } from '../services/api';

function PointageProcessPage() {
  const [step, setStep] = useState('select'); // select, scan, confirm, done
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [scanImage, setScanImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les employés du backend
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeApi.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        setError("Erreur lors du chargement des employés");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Sélection d'un employé
  const handleSelect = (emp) => {
    setSelectedEmployee(emp);
    setStep('scan');
    setScanData(null);
    setScanImage(null);
    setError('');
    setSuccess('');
  };

  // Importer une image locale et lancer le scan
  const handleImportImage = (emp, file) => {
    setSelectedEmployee(emp);
    setStep('scan');
    setScanData(null);
    setScanImage(null);
    setError('');
    setSuccess('');
    // On transmet le fichier à CardScanner via une prop spéciale
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('cardscanner-import', { detail: file }));
    }, 100);
  };

  // Scan terminé
  const handleScanComplete = (data, image) => {
    setScanData(data);
    setScanImage(image);
    setStep('confirm');
  };

  // Retour à la sélection
  const handleBack = () => {
    setStep('select');
    setSelectedEmployee(null);
    setScanData(null);
    setScanImage(null);
    setError('');
    setSuccess('');
  };

  // Validation du pointage
  const handleValidate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Appel API pour enregistrer le pointage
      const response = await fetch('/api/pointage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employe_id: selectedEmployee.id,
          entite: selectedEmployee.entite,
          scan_data: scanData,
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Erreur lors du pointage');
      setSuccess('Pointage enregistré avec succès !');
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Sélection employé
  if (step === 'select') {
    return (
      <div className="container-xl py-4">
        <h2 className="mb-4">Sélectionnez un employé pour scanner sa carte</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">Liste des employés</h5>
            {loading ? (
              <div>Chargement...</div>
            ) : employees.length === 0 ? (
              <div className="alert alert-warning">Aucun employé disponible.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>CIN</th>
                      <th>Département</th>
                      <th colSpan={2}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td>{emp.nom}</td>
                        <td>{emp.prenom}</td>
                        <td>{emp.cin}</td>
                        <td>{emp.entite}</td>
                        <td>
                          <button className="btn btn-success btn-sm" onClick={() => handleSelect(emp)}>
                            Scanner la carte (webcam)
                          </button>
                        </td>
                        <td>
                          <label className="btn btn-primary btn-sm mb-0">
                            Importer une image
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleImportImage(emp, e.target.files[0])} />
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Scan carte
  if (step === 'scan') {
    return (
      <div className="container-xl py-4">
        <h4 className="mb-3">Employé sélectionné : {selectedEmployee.nom} {selectedEmployee.prenom} ({selectedEmployee.cin})</h4>
        <CardScanner onScanComplete={handleScanComplete} onBack={handleBack} />
      </div>
    );
  }

  // 3. Confirmation et validation
  if (step === 'confirm') {
    // Extraire le numéro de carte détecté (cin ou id principal)
    let numeroCarte = '';
    if (scanData) {
      if (typeof scanData === 'string') {
        numeroCarte = scanData;
      } else if (scanData.cin) {
        numeroCarte = scanData.cin;
      } else if (scanData.numero_carte) {
        numeroCarte = scanData.numero_carte;
      } else {
        // Chercher un champ ressemblant à un numéro de carte
        const possible = Object.values(scanData).find(v => typeof v === 'string' && /^[A-Z0-9]{5,}$/.test(v));
        numeroCarte = possible || '';
      }
    }
    return (
      <div className="container-xl py-4">
        <h4 className="mb-3">Vérification du pointage pour {selectedEmployee.nom} {selectedEmployee.prenom}</h4>
        {scanImage && <img src={scanImage} alt="scan" style={{maxWidth:300, borderRadius:8, marginBottom:16}} />}
        <div className="mb-3">
          <strong>Numéro de carte détecté :</strong>
          <div style={{background:'#f8f9fa', padding:8, borderRadius:6, fontSize:'1.2rem', fontWeight:'bold'}}>{numeroCarte || 'Aucun numéro détecté'}</div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary me-2" onClick={handleValidate} disabled={loading}>
          {loading ? 'Enregistrement...' : 'Valider le pointage'}
        </button>
        <button className="btn btn-secondary" onClick={handleBack} disabled={loading}>Retour</button>
      </div>
    );
  }

  // 4. Succès
  if (step === 'done') {
    return (
      <div className="container-xl py-4 text-center">
        <div className="alert alert-success">{success}</div>
        <button className="btn btn-primary" onClick={handleBack}>Nouveau pointage</button>
      </div>
    );
  }

  return null;
}

export default PointageProcessPage;