import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  // Handler pour importer une image locale et aller vers la page de scan avec l'image
  const handleImportImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Stocker le fichier dans le localStorage ou le state global, ou utiliser une route dédiée
      // Ici, on redirige vers /pointage avec un paramètre (à adapter côté scan)
      const reader = new FileReader();
      reader.onload = (event) => {
        localStorage.setItem('importedImage', event.target.result);
        navigate('/pointage');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="homepage-bg">
      <nav className="navbar">
        <div className="logo">
          <a href="/">MarsaTrack</a>
        </div>
        <ul className="links">
          <li><a href="/login">Connexion</a></li>
        </ul>
        <div className="navbar-right">
          <a href="/login" className="signin">Se connecter</a>
        </div>
      </nav>
      <section className="hero-section">
        <div className="hero">
          <h2>Bienvenue sur MarsaTrack</h2>
          <p>Suivez vos employés, générez des rapports et optimisez votre productivité.</p>
          <div className="buttons" style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
            <button type="button" className="join" onClick={() => navigate('/ajouter-employe')}>Ajouter un employé</button>
            <button type="button" className="join" onClick={() => navigate('/employes')}>Voir les employés</button>
            <button type="button" className="join" onClick={() => navigate('/pointage')}>Scanner une carte</button>
            <label htmlFor="import-image" className="join" style={{cursor: 'pointer', margin: 0}}>
              Importer une image à scanner
              <input id="import-image" type="file" accept="image/*" style={{display: 'none'}} onChange={handleImportImage} />
            </label>
          </div>
        </div>
        <div className="img">
          <img src="/public/hero-img.png" alt="hero" />
        </div>
      </section>
    </div>
  );
}

export default HomePage;