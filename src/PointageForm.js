// src/PointageForm.js
import React, { useState } from 'react';

function PointageForm({ employe, onPointageSuccess }) {
  const [entite, setEntite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employe || !employe.id) {
      setError("Aucun employé sélectionné");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/pointage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employe_id: employe.id,
          entite: entite
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur d'envoi");
      }

      setSuccess(true);
      setEntite('');
      
      // Réinitialisation après 3 secondes et appel du callback
      setTimeout(() => {
        setSuccess(false);
        if (onPointageSuccess) onPointageSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow p-4 mt-5" style={{ maxWidth: 500, margin: "auto", background: "#fff", borderRadius: 16 }}>
      <h2 className="mb-4 text-center text-primary">Enregistrement du Pointage</h2>
      
      {success && (
        <div className="alert alert-success text-center">
          Pointage enregistré avec succès !
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}
      
      {/* Affichage des informations de l'employé */}
      {employe && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Employé</h5>
            <p className="card-text">
              <strong>Nom:</strong> {employe.nom}<br />
              <strong>Prénom:</strong> {employe.prenom}<br />
              <strong>CIN:</strong> {employe.cin}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Entité</label>
          <select 
            className="form-select" 
            value={entite} 
            onChange={(e) => setEntite(e.target.value)} 
            required
          >
            <option value="">Sélectionnez une entité</option>
            <option value="DTC">Département Terminal Conteneurs</option>
            <option value="DTV">Département Voiturier</option>
            <option value="DTP">Département Polyvalent</option>
          </select>
        </div>
        
        <button 
          className="btn btn-primary w-100 py-2 fw-bold" 
          type="submit"
          disabled={loading || !employe}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Enregistrement...
            </>
          ) : (
            "Finaliser le pointage"
          )}
        </button>
      </form>
    </div>
  );
}

export default PointageForm;