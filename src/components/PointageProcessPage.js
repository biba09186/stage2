import React, { useState } from 'react';
import { pointageService } from '../services/api';
import { employeeService } from '../services/employeeService';
// Gardez seulement un import pour CardScanner
import CardScanner from './CardScanner';
import EmployeeSearch from './EmployeeSearch';
function PointageProcessPage() {
  const [step, setStep] = useState(0); // 0: recherche, 1: formulaire, 2: scan, 3: confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Informations employé
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    entite: '',
    date_naissance: '',
    lieu_naissance: ''
  });

  // Gestion du changement dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Sélection d'un employé existant
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      nom: employee.nom,
      prenom: employee.prenom,
      cin: employee.cin,
      entite: employee.entite,
      date_naissance: employee.date_naissance,
      lieu_naissance: employee.lieu_naissance
    });
    setStep(1); // Aller au formulaire pré-rempli
  };

  // Créer un nouvel employé
  const handleCreateNew = (searchTerm = '') => {
    setSelectedEmployee(null);
    // Pré-remplir avec le terme de recherche si disponible
    if (searchTerm) {
      const parts = searchTerm.split(' ');
      setFormData({
        nom: parts[0] || '',
        prenom: parts[1] || '',
        cin: searchTerm.startsWith('ID') ? searchTerm : '',
        entite: '',
        date_naissance: '',
        lieu_naissance: ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        cin: '',
        entite: '',
        date_naissance: '',
        lieu_naissance: ''
      });
    }
    setStep(1); // Aller au formulaire vide
  };

  // Passer au scan
  const proceedToScan = (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.entite) {
      setError('Veuillez remplir au minimum le nom, prénom et entité');
      return;
    }
    
    setStep(2);
    setError('');
  };

  // Callback du scanner
  const handleScanComplete = (scannedData, image) => {
    // Fusionner les données scannées avec les données existantes
    setFormData(prev => ({
      ...prev,
      ...scannedData,
      // Conserver l'entité du formulaire si pas dans les données scannées
      entite: scannedData.entite || prev.entite
    }));
    setScannedImage(image);
    setStep(3);
  };

  // Retour aux étapes précédentes
  const goBack = (targetStep) => {
    setStep(targetStep);
    setError('');
  };

  // Soumission finale
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Si c'est un nouvel employé, l'ajouter à la base
      if (!selectedEmployee) {
        const newEmployee = employeeService.addEmployee({
          ...formData,
          poste: 'Non défini',
          date_embauche: new Date().toISOString().split('T')[0]
        });
        console.log('Nouvel employé ajouté:', newEmployee);
      }

      // Enregistrer le pointage
      const pointageData = {
        employe_id: selectedEmployee?.id || null,
        employe_nom: formData.nom,
        employe_prenom: formData.prenom,
        employe_cin: formData.cin,
        entite: formData.entite,
        date_naissance: formData.date_naissance,
        lieu_naissance: formData.lieu_naissance,
        date_pointage: new Date().toISOString(),
        scanned_image: scannedImage,
        scan_method: scannedImage ? 'yolo_ai' : 'manual',
        employee_existed: !!selectedEmployee
      };

      await pointageService.createPointage(pointageData);
      setSuccess(true);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        restart();
      }, 3000);
      
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du pointage');
    } finally {
      setLoading(false);
    }
  };

  // Redémarrer le processus
  const restart = () => {
    setStep(0);
    setSelectedEmployee(null);
    setFormData({
      nom: '',
      prenom: '',
      cin: '',
      entite: '',
      date_naissance: '',
      lieu_naissance: ''
    });
    setScannedImage(null);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="page-header">
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">

            {/* Indicateur d'étapes */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className={`text-center ${step >= 0 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 0 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                      {step > 0 ? '✓' : '👥'}
                    </div>
                    <small className="d-block mt-1">Recherche</small>
                  </div>
                  <div className="flex-fill border-top mx-2"></div>
                  <div className={`text-center ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                      {step > 1 ? '✓' : '📝'}
                    </div>
                    <small className="d-block mt-1">Formulaire</small>
                  </div>
                  <div className="flex-fill border-top mx-2"></div>
                  <div className={`text-center ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                      {step > 2 ? '✓' : '🤖'}
                    </div>
                    <small className="d-block mt-1">Scan IA</small>
                  </div>
                  <div className="flex-fill border-top mx-2"></div>
                  <div className={`text-center ${step >= 3 ? 'text-success' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 3 ? 'bg-success text-white' : 'bg-light'}`} style={{width: '40px', height: '40px'}}>
                      {step >= 3 ? '✓' : '✅'}
                    </div>
                    <small className="d-block mt-1">Validation</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 0: Recherche d'employé */}
            {step === 0 && (
              <div className="animate-fadeInUp">
                <EmployeeSearch 
                  onEmployeeSelect={handleEmployeeSelect}
                  onCreateNew={handleCreateNew}
                />
              </div>
            )}

            {/* Étape 1: Formulaire */}
            {step === 1 && (
              <div className="card animate-fadeInUp">
                <div className="card-header">
                  <h3 className="card-title">
                    📝 {selectedEmployee ? 'Vérification des données' : 'Nouvel employé'}
                  </h3>
                  <p className="text-muted mb-0">
                    {selectedEmployee 
                      ? 'Vérifiez et complétez les informations avant le scan'
                      : 'Saisissez les informations de base avant le scan IA'
                    }
                  </p>
                </div>
                <div className="card-body">
                  {selectedEmployee && (
                    <div className="alert alert-info">
                      <strong>👤 Employé sélectionné:</strong> {selectedEmployee.prenom} {selectedEmployee.nom} 
                      ({selectedEmployee.cin}) - {selectedEmployee.entite}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger">❌ {error}</div>
                  )}

                  <form onSubmit={proceedToScan}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">👤 Nom <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Nom de famille"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">👤 Prénom <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Prénom"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">🏢 Entité <span className="text-danger">*</span></label>
                      <select
                        name="entite"
                        value={formData.entite}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="">Sélectionnez une entité</option>
                        <option value="DTC">DTC - Département Terminal Conteneurs</option>
                        <option value="DTV">DTV - Département Terminal Voiturier</option>
                        <option value="DTP">DTP - Département Terminal Polyvalent</option>
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">🆔 Numéro CIN</label>
                        <input
                          type="text"
                          name="cin"
                          value={formData.cin}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Sera complété par le scan"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">📅 Date de naissance</label>
                        <input
                          type="date"
                          name="date_naissance"
                          value={formData.date_naissance}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">📍 Lieu de naissance</label>
                      <input
                        type="text"
                        name="lieu_naissance"
                        value={formData.lieu_naissance}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Sera complété par le scan"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => goBack(0)}
                      >
                        ← Retour à la recherche
                      </button>
                      <button type="submit" className="btn btn-primary flex-fill">
                        Continuer vers le scan IA 🤖
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Étape 2: Scanner */}
            {step === 2 && (
              <div className="animate-fadeInUp">
                <CardScanner 
                  onScanComplete={handleScanComplete}
                  onBack={() => goBack(1)}
                />
              </div>
            )}

            {/* Étape 3: Confirmation */}
            {step === 3 && !success && (
              <div className="card animate-fadeInUp">
                <div className="card-header">
                  <h3 className="card-title">✅ Confirmation finale</h3>
                  <p className="text-muted mb-0">Vérifiez toutes les informations avant validation</p>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger">❌ {error}</div>
                  )}

                  <div className="row">
                    {scannedImage && (
                      <div className="col-md-4 mb-3">
                        <h6>📷 Carte scannée:</h6>
                        <img 
                          src={scannedImage} 
                          alt="Carte" 
                          className="img-fluid rounded border"
                        />
                      </div>
                    )}
                    
                    <div className="col-md-8">
                      <h6>📝 Informations finales:</h6>
                      
                      {selectedEmployee && (
                        <div className="alert alert-success mb-3">
                          <strong>👤 Employé existant</strong> - Données mises à jour
                        </div>
                      )}
                      
                      {!selectedEmployee && (
                        <div className="alert alert-info mb-3">
                          <strong>➕ Nouvel employé</strong> - Sera ajouté à la base
                        </div>
                      )}

                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-sm-6">
                              <p><strong>Nom:</strong> {formData.nom}</p>
                              <p><strong>Prénom:</strong> {formData.prenom}</p>
                              <p><strong>CIN:</strong> {formData.cin}</p>
                            </div>
                            <div className="col-sm-6">
                              <p><strong>Entité:</strong> {formData.entite}</p>
                              <p><strong>Date naissance:</strong> {formData.date_naissance}</p>
                              <p className="mb-0"><strong>Lieu:</strong> {formData.lieu_naissance}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => goBack(2)}
                      disabled={loading}
                    >
                      ← Scanner à nouveau
                    </button>
                    <button 
                      className="btn btn-primary flex-fill"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enregistrement...
                        </>
                      ) : (
                        'Valider le pointage ✅'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Succès final */}
            {success && (
              <div className="card border-success animate-fadeInUp">
                <div className="card-body text-center">
                  <div className="mb-4">
                    <span style={{fontSize: '5rem'}}>🎉</span>
                  </div>
                  <h3 className="text-success mb-3">Pointage Enregistré!</h3>
                  <p className="text-muted mb-4">
                    Le pointage de <strong>{formData.prenom} {formData.nom}</strong> 
                    a été enregistré avec succès.
                  </p>
                  
                  {!selectedEmployee && (
                    <div className="alert alert-info">
                      <strong>➕ Nouvel employé ajouté</strong> à la base de données
                    </div>
                  )}
                  
                  <div className="alert alert-success">
                    <strong>🤖 Processus IA:</strong> Données extraites avec Roboflow YOLO
                  </div>
                  
                  <button className="btn btn-primary btn-lg" onClick={restart}>
                    Nouveau pointage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointageProcessPage;