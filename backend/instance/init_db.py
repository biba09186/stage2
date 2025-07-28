import sqlite3

conn = sqlite3.connect('contacts.db')
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS employes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    cin TEXT NOT NULL,
    entite TEXT NOT NULL,
    lieu_naissance TEXT NOT NULL,
    date_naissance TEXT NOT NULL
)
''')

employes = [
    ('Rami', 'Hiba', 'T329150', 'RH', 'Mohammedia', '2003-03-18'),
    ('El Amrani', 'Yassine', 'B123456', 'IT', 'Casablanca', '1998-07-12'),
    ('Benali', 'Sara', 'C654321', 'Finance', 'Rabat', '1995-11-23'),
    ('Moujahid', 'Omar', 'D789012', 'RH', 'Fès', '1990-02-05'),
    ('Ait Taleb', 'Imane', 'E345678', 'Marketing', 'Agadir', '1987-09-30')
]
for emp in employes:
    c.execute('''
    INSERT INTO employes (nom, prenom, cin, entite, lieu_naissance, date_naissance)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', emp)

conn.commit()
conn.close()
print('Base de données initialisée avec plusieurs employés.')