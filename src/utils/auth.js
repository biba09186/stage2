export const isAuthenticated = () => {
  // Vérifie si un token ou une information d'authentification est stockée
  return localStorage.getItem('authToken') !== null;
};

export const login = (token) => {
  // Stocke le token dans localStorage
  localStorage.setItem('authToken', token);
};

export const logout = () => {
  // Supprime le token pour déconnecter l'utilisateur
  localStorage.removeItem('authToken');
};