import React, { useState, useEffect } from 'react';
import { employeeApi } from '../services/api';
import './EmployeeListPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faCalendar, faMapMarkerAlt, faBuilding, faVenusMars, faBriefcase, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

function EmployeeListPage(props) {
  const [showList, setShowList] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    cin: '',
    date_naissance: '',
    lieu_naissance: '',
    entite: '',
    sexe: '',
    poste: '',
    date_embauche: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour charger les employés
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeApi.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Erreur lors du chargement des employés.');
    } finally {
      setLoading(false);
    }
  };

  // Charger au premier rendu
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Recharger la liste quand on affiche le tableau
  useEffect(() => {
    if (showList) {
      fetchEmployees();
    }
  }, [showList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validation simple
    if (!form.nom || !form.prenom || !form.cin || !form.date_naissance || !form.lieu_naissance || !form.entite) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      // Appel API pour ajouter l'employé
      const newEmp = await employeeApi.addEmployee(form);
      setSuccess('Employé ajouté avec succès !');
      setForm({
        nom: '', prenom: '', cin: '', date_naissance: '', lieu_naissance: '', entite: '', sexe: '', poste: '', date_embauche: ''
      });
      // Rafraîchir la liste
      const data = await employeeApi.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError("Erreur lors de l'ajout de l'employé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-list-page">
      <div className="container-xl py-4">
        <button className="btn btn-outline-primary mb-3" onClick={() => setShowList(v => !v)}>
          {showList ? 'Masquer la liste des employés' : 'Afficher la liste des employés'}
        </button>
        {(!props.onlyForm && !props.onlyList) && <h2 className="mb-4">👤 Liste des Employés</h2>}
        {/* Formulaire d'ajout en haut */}
        {(!props.onlyList) && (
        <div className="card shadow-sm mb-4" style={{maxWidth: 600, margin: '0 auto'}}>
          <div className="card-body">
            <h5 className="card-title mb-3">Ajouter un employé</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faUser} className="me-2 text-primary" />Nom *</label>
                <input type="text" className="form-control input-3d" name="nom" value={form.nom} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faUser} className="me-2 text-primary" />Prénom *</label>
                <input type="text" className="form-control input-3d" name="prenom" value={form.prenom} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faIdCard} className="me-2 text-primary" />CIN *</label>
                <input type="text" className="form-control input-3d" name="cin" value={form.cin} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faCalendar} className="me-2 text-primary" />Date de naissance *</label>
                <input type="date" className="form-control input-3d" name="date_naissance" value={form.date_naissance} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />Lieu de naissance *</label>
                <input type="text" className="form-control input-3d" name="lieu_naissance" value={form.lieu_naissance} onChange={handleChange} required />
              </div>
                <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />Département / Entité *</label>
                <input type="text" className="form-control input-3d" name="entite" value={form.entite} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faVenusMars} className="me-2 text-primary" />Sexe</label>
                <select className="form-select input-3d" name="sexe" value={form.sexe} onChange={handleChange}>
                  <option value="">--</option>
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label"><FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" />Poste</label>
                <input type="text" className="form-control input-3d" name="poste" value={form.poste} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label"><FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-primary" />Date d'embauche</label>
                <input type="date" className="form-control input-3d" name="date_embauche" value={form.date_embauche} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-3d" disabled={loading}>{loading ? 'Enregistrement...' : <><FontAwesomeIcon icon={faUser} className="me-2" />Ajouter</>}</button>
            </form>
          </div>
        </div>
        )}
        {/* Debug : affichage brut du tableau employees */}
        <pre style={{background:'#f8f9fa', color:'#333', fontSize:12, padding:8, borderRadius:4, marginBottom:12}}>
          {JSON.stringify(employees, null, 2)}
        </pre>
        {/* Tableau des employés */}
        {showList && (
        <div className="card shadow-lg glass-card">
          <div className="card-body">
            <h5 className="card-title mb-3"><FontAwesomeIcon icon={faUser} className="me-2 text-primary" />Employés enregistrés</h5>
            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle glass-table">
                  <thead className="table-header">
                    <tr>
                      <th><FontAwesomeIcon icon={faUser} className="me-1" />Nom</th>
                      <th><FontAwesomeIcon icon={faUser} className="me-1" />Prénom</th>
                      <th><FontAwesomeIcon icon={faIdCard} className="me-1" />CIN</th>
                      <th><FontAwesomeIcon icon={faCalendar} className="me-1" />Date naissance</th>
                      <th><FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />Lieu</th>
                      <th><FontAwesomeIcon icon={faBuilding} className="me-1" />Département</th>
                      <th><FontAwesomeIcon icon={faVenusMars} className="me-1" />Sexe</th>
                      <th><FontAwesomeIcon icon={faBriefcase} className="me-1" />Poste</th>
                      <th><FontAwesomeIcon icon={faCalendarCheck} className="me-1" />Date embauche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr><td colSpan="9" className="text-center">Aucun employé enregistré</td></tr>
                    ) : employees.map(emp => {
                      return (
                        <tr key={emp.id} className="table-row">
                          <td>{emp.nom || ''}</td>
                          <td>{emp.prenom || ''}</td>
                          <td>{emp.cin || ''}</td>
                          <td>{emp.date_naissance || ''}</td>
                          <td>{emp.lieu_naissance || ''}</td>
                          <td>{emp.entite || ''}</td>
                          <td>{emp.sexe || ''}</td>
                          <td>{emp.poste || ''}</td>
                          <td>{emp.date_embauche || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeListPage;
