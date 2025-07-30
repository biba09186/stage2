// Service d'authentification
export const authService = {
  // Utilisateurs de test (remplacer par une vraie API)
  users: [
    { id: 1, username: 'pointeur1', password: 'password123', role: 'pointeur', nom: 'Dupont', prenom: 'Jean' },
    { id: 2, username: 'chef1', password: 'password123', role: 'chef', nom: 'Martin', prenom: 'Marie' },
    { id: 3, username: 'pointeur2', password: 'password123', role: 'pointeur', nom: 'Bernard', prenom: 'Paul' }
  ],

  // Connexion
  login: async (username, password) => {
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = authService.users.find(u => 
        u.username === username && u.password === password
      );
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      } else {
        throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier le rôle
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  }
};