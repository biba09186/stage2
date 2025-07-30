// Service API pour les pointages
export const pointageService = {
  // Simulation de base de données locale
  pointages: JSON.parse(localStorage.getItem('pointages') || '[]'),

  // Créer un nouveau pointage
  async createPointage(pointageData) {
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPointage = {
        id: Date.now(),
        ...pointageData,
        date_pointage: new Date().toISOString(),
        valide: null // En attente de validation
      };

      this.pointages.push(newPointage);
      localStorage.setItem('pointages', JSON.stringify(this.pointages));

      return newPointage;
    } catch (error) {
      throw new Error('Erreur lors de la création du pointage');
    }
  },

  // Récupérer tous les pointages
  async getAllPointages() {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.pointages;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des pointages');
    }
  },

  // Mettre à jour un pointage
  async updatePointage(id, updateData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = this.pointages.findIndex(p => p.id === id);
      if (index !== -1) {
        this.pointages[index] = { ...this.pointages[index], ...updateData };
        localStorage.setItem('pointages', JSON.stringify(this.pointages));
        return this.pointages[index];
      }
      throw new Error('Pointage non trouvé');
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du pointage');
    }
  },

  // Supprimer un pointage
  async deletePointage(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pointages = this.pointages.filter(p => p.id !== id);
      localStorage.setItem('pointages', JSON.stringify(this.pointages));
      return true;
    } catch (error) {
      throw new Error('Erreur lors de la suppression du pointage');
    }
  }
};

// Service API pour les employés (connexion au backend Flask)
export const employeeApi = {
  // Récupérer tous les employés depuis l'API Flask
  async getAllEmployees() {
    const response = await fetch('/api/employes');
    if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
    const data = await response.json();
    return data.employes || [];
  },

  // Ajouter un nouvel employé via l'API Flask
  async addEmployee(employeeData) {
    const response = await fetch('/api/employes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'employé');
    return await response.json();
  }
};