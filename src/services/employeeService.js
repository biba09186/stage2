// Service pour gérer la base de données des employés
export const employeeService = {
  // Base de données locale des employés
  employees: JSON.parse(localStorage.getItem('employees') || JSON.stringify([
    {
      id: 1,
      nom: 'BENALI',
      prenom: 'Mohamed',
      cin: 'ID123456',
      entite: 'DTC',
      date_naissance: '1990-05-15',
      lieu_naissance: 'Casablanca',
      sexe: 'M',
      poste: 'Opérateur',
      date_embauche: '2020-01-15',
      status: 'actif',
      photo: null
    },
    {
      id: 2,
      nom: 'ALAMI',
      prenom: 'Fatima',
      cin: 'ID789012',
      entite: 'DTV',
      date_naissance: '1988-12-22',
      lieu_naissance: 'Rabat',
      sexe: 'F',
      poste: 'Superviseur',
      date_embauche: '2019-03-10',
      status: 'actif',
      photo: null
    },
    {
      id: 3,
      nom: 'CHAKIR',
      prenom: 'Ahmed',
      cin: 'ID345678',
      entite: 'DTP',
      date_naissance: '1985-08-30',
      lieu_naissance: 'Marrakech',
      sexe: 'M',
      poste: 'Chef d\'équipe',
      date_embauche: '2018-07-20',
      status: 'actif',
      photo: null
    },
    {
      id: 4,
      nom: 'MANSOURI',
      prenom: 'Aicha',
      cin: 'ID901234',
      entite: 'DTC',
      date_naissance: '1992-03-18',
      lieu_naissance: 'Fès',
      sexe: 'F',
      poste: 'Administrateur',
      date_embauche: '2021-09-05',
      status: 'actif',
      photo: null
    },
    {
      id: 5,
      nom: 'IDRISSI',
      prenom: 'Youssef',
      cin: 'ID567890',
      entite: 'DTV',
      date_naissance: '1987-11-12',
      lieu_naissance: 'Tanger',
      sexe: 'M',
      poste: 'Technicien',
      date_embauche: '2020-06-01',
      status: 'actif',
      photo: null
    }
  ])),

  // Sauvegarder dans localStorage
  saveToStorage() {
    localStorage.setItem('employees', JSON.stringify(this.employees));
  },

  // Récupérer tous les employés
  getAllEmployees() {
    return this.employees.filter(emp => emp.status === 'actif');
  },

  // Rechercher un employé par CIN
  findByCIN(cin) {
    return this.employees.find(emp => 
      emp.cin.toLowerCase() === cin.toLowerCase() && emp.status === 'actif'
    );
  },

  // Rechercher par nom et prénom
  findByName(nom, prenom) {
    return this.employees.find(emp => 
      emp.nom.toLowerCase() === nom.toLowerCase() && 
      emp.prenom.toLowerCase() === prenom.toLowerCase() && 
      emp.status === 'actif'
    );
  },

  // Rechercher avec critères multiples
  searchEmployees(criteria) {
    return this.employees.filter(emp => {
      if (emp.status !== 'actif') return false;
      
      let matches = true;
      
      if (criteria.cin) {
        matches = matches && emp.cin.toLowerCase().includes(criteria.cin.toLowerCase());
      }
      if (criteria.nom) {
        matches = matches && emp.nom.toLowerCase().includes(criteria.nom.toLowerCase());
      }
      if (criteria.prenom) {
        matches = matches && emp.prenom.toLowerCase().includes(criteria.prenom.toLowerCase());
      }
      if (criteria.entite) {
        matches = matches && emp.entite === criteria.entite;
      }
      
      return matches;
    });
  },

  // Ajouter un nouvel employé
  addEmployee(employeeData) {
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      status: 'actif',
      date_creation: new Date().toISOString()
    };
    
    this.employees.push(newEmployee);
    this.saveToStorage();
    return newEmployee;
  },

  // Mettre à jour un employé
  updateEmployee(id, updateData) {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...updateData };
      this.saveToStorage();
      return this.employees[index];
    }
    return null;
  },

  // Supprimer un employé (désactiver)
  deleteEmployee(id) {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees[index].status = 'inactif';
      this.saveToStorage();
      return true;
    }
    return false;
  },

  // Vérifier si un employé existe
  employeeExists(cin) {
    return this.employees.some(emp => 
      emp.cin.toLowerCase() === cin.toLowerCase() && emp.status === 'actif'
    );
  },

  // Statistiques
  getStats() {
    const total = this.employees.filter(emp => emp.status === 'actif').length;
    const byEntite = {};
    
    this.employees.forEach(emp => {
      if (emp.status === 'actif') {
        byEntite[emp.entite] = (byEntite[emp.entite] || 0) + 1;
      }
    });
    
    return {
      total,
      byEntite,
      totalInactif: this.employees.filter(emp => emp.status === 'inactif').length
    };
  }
};