-- Script SQL pour créer la table employes et insérer un exemple
CREATE TABLE IF NOT EXISTS employes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    cin TEXT NOT NULL,
    entite TEXT NOT NULL,
    lieu_naissance TEXT NOT NULL,
    date_naissance TEXT NOT NULL
);

INSERT INTO employes (nom, prenom, cin, entite, lieu_naissance, date_naissance) VALUES
('Rami', 'Hiba', 'T329150', 'RH', 'Mohammedia', '2003-03-18');
