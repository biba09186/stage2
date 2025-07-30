import React, { useState, useEffect } from 'react';
import { employeeApi } from '../services/api';

function EmployeeSearch({ onEmployeeSelect, onCreateNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger tous les employés depuis le backend au démarrage
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeApi.getAllEmployees();
        setAllEmployees(data.employes || []);
      } catch (err) {
        setAllEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Recherche en temps réel (backend)
  useEffect(() => {
    const fetchSearch = async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          const data = await employeeApi.getAllEmployees();
          const results = (data.employes || []).filter(emp =>
            emp.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.prenom.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(results);
        } catch (err) {
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    fetchSearch();
  }, [searchTerm]);

  // Sélectionner un employé
  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    onEmployeeSelect(employee);
  };

  // Afficher tous les employés
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="employee-search">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👥 Recherche d'Employé</h3>
          <p className="text-muted mb-0">Recherchez un employé existant ou créez un nouveau profil</p>
        </div>
        <div className="card-body">
          
          {/* Barre de recherche */}
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par CIN, nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-outline-secondary"
                onClick={toggleShowAll}
              >
                {showAll ? 'Masquer' : 'Voir tous'}
              </button>
            </div>
          </div>

          {/* Employé sélectionné */}
          {selectedEmployee && (
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{width: '50px', height: '50px'}}>
                    {selectedEmployee.prenom.charAt(0)}{selectedEmployee.nom.charAt(0)}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">✅ Employé sélectionné</h6>
                  <p className="mb-0">
                    <strong>{selectedEmployee.prenom} {selectedEmployee.nom}</strong> 
                    ({selectedEmployee.cin}) - {selectedEmployee.entite}
                  </p>
                </div>
                <button 
                  className="btn btn-sm btn-outline-success"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Changer
                </button>
              </div>
            </div>
          )}

          {/* Résultats de recherche */}
          {searchTerm.length >= 2 && searchResults.length > 0 && (
            <div className="search-results mb-4">
              <h6>📋 Résultats de recherche ({searchResults.length})</h6>
              <div className="list-group">
                {searchResults.map((employee) => (
                  <button
                    key={employee.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => selectEmployee(employee)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                             style={{width: '40px', height: '40px'}}>
                          {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{employee.prenom} {employee.nom}</h6>
                        <small className="text-muted">
                          CIN: {employee.cin} | {employee.entite} | {employee.poste}
                        </small>
                      </div>
                      <div className="badge bg-primary">
                        {employee.entite}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {searchTerm.length >= 2 && searchResults.length === 0 && (
            <div className="alert alert-warning">
              <h6>🚫 Aucun employé trouvé</h6>
              <p className="mb-3">Aucun employé ne correspond à votre recherche "{searchTerm}"</p>
              <button 
                className="btn btn-primary"
                onClick={() => onCreateNew(searchTerm)}
              >
                ➕ Créer un nouvel employé
              </button>
            </div>
          )}

          {/* Liste complète */}
          {showAll && (
            <div className="all-employees">
              <h6>👥 Tous les employés ({allEmployees.length})</h6>
              <div className="row">
                {allEmployees.map((employee) => (
                  <div key={employee.id} className="col-md-6 col-lg-4 mb-3">
                    <div className="card h-100 employee-card" 
                         style={{cursor: 'pointer'}}
                         onClick={() => selectEmployee(employee)}>
                      <div className="card-body text-center">
                        <div className="avatar bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                             style={{width: '60px', height: '60px'}}>
                          {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
                        </div>
                        <h6 className="card-title">{employee.prenom} {employee.nom}</h6>
                        <p className="card-text">
                          <small className="text-muted">
                            {employee.cin}<br/>
                            {employee.entite} - {employee.poste}
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="text-center mt-4">
            <button 
              className="btn btn-success btn-lg me-2"
              onClick={() => onCreateNew()}
            >
              ➕ Nouvel employé
            </button>
            
            {!selectedEmployee && (
              <div className="mt-3">
                <small className="text-muted">
                  Recherchez un employé existant ou créez un nouveau profil
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeSearch;