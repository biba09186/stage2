// src/theme/Theme.js
import React from 'react';

const Theme = ({ children }) => {
  // Variables CSS injectées directement
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Définir les couleurs du thème
    root.style.setProperty('--theme-blue', '#467fcf');
    root.style.setProperty('--theme-indigo', '#6574cd');
    root.style.setProperty('--theme-purple', '#a55eea');
    root.style.setProperty('--theme-pink', '#e83e8c');
    root.style.setProperty('--theme-red', '#cd201f');
    root.style.setProperty('--theme-orange', '#fd9644');
    root.style.setProperty('--theme-yellow', '#f1c40f');
    root.style.setProperty('--theme-green', '#5eba00');
    root.style.setProperty('--theme-teal', '#2bcbba');
    root.style.setProperty('--theme-cyan', '#17a2b8');
    root.style.setProperty('--theme-gray', '#868e96');
    
    // Variables Bootstrap équivalentes
    root.style.setProperty('--bs-primary', '#467fcf');
    root.style.setProperty('--bs-secondary', '#868e96');
    root.style.setProperty('--bs-success', '#5eba00');
    root.style.setProperty('--bs-info', '#17a2b8');
    root.style.setProperty('--bs-warning', '#f1c40f');
    root.style.setProperty('--bs-danger', '#cd201f');
  }, []);

  return (
    <div className="theme-provider">
      {children}
    </div>
  );
};

export default Theme;