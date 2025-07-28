import os
import datetime
import sys
import torch
import pytesseract
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np
from ultralytics import YOLO

# Force Tesseract à utiliser le bon dossier tessdata
os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'

# Configuration Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialisation de l'application Flask
FRONTEND_BUILD = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/build'))
app = Flask(__name__, static_folder=FRONTEND_BUILD, static_url_path='/')
CORS(app)

# Configuration de l'application
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'contacts.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialisation des extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Chargement du modèle YOLO avec ton modèle entraîné
print("🤖 Chargement du modèle YOLOv8...")
model = YOLO('best.pt')
print(f"✅ Modèle chargé. Classes disponibles: {model.names}")

# Modèles de base de données
class Employe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    cin = db.Column(db.String(20), unique=True, nullable=False)
    date_naissance = db.Column(db.String(20))
    lieu_naissance = db.Column(db.String(100))
    entite = db.Column(db.String(100), default='Informatique')
    date_creation = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Pointage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_pointage = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    employe_id = db.Column(db.Integer, db.ForeignKey('employe.id'), nullable=False)
    entite = db.Column(db.String(50), nullable=False)
    employe = db.relationship('Employe', backref=db.backref('pointages', lazy=True))

# Création des tables (à faire une fois)
with app.app_context():
    db.create_all()

def preprocess_image_for_ocr(image_path):
    """Améliore l'image pour l'OCR - VERSION RENFORCÉE"""
    print("🔧 Preprocessing image pour OCR...")
    
    # Ouvrir avec OpenCV
    img = cv2.imread(image_path)
    print(f"📐 Image originale: {img.shape}")
    
    # 1. Redimensionner pour améliorer la résolution
    height, width = img.shape[:2]
    if width < 800:  # Si image trop petite
        scale = 800 / width
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        print(f"📏 Image redimensionnée: {img.shape}")
    
    # 2. Convertir en niveaux de gris
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. Améliorer le contraste de façon plus agressive
    enhanced = cv2.convertScaleAbs(gray, alpha=2.0, beta=50)
    
    # 4. Appliquer un filtre de netteté
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)
    
    # 5. Débruitage plus fort
    denoised = cv2.medianBlur(sharpened, 5)
    
    # 6. Binarisation adaptative
    binary = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # 7. Morphologie pour nettoyer
    kernel = np.ones((2,2), np.uint8)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    # Sauvegarde toutes les étapes pour debug
    cv2.imwrite(image_path.replace('.jpg', '_1_gray.jpg'), gray)
    cv2.imwrite(image_path.replace('.jpg', '_2_enhanced.jpg'), enhanced)
    cv2.imwrite(image_path.replace('.jpg', '_3_sharpened.jpg'), sharpened)
    cv2.imwrite(image_path.replace('.jpg', '_4_denoised.jpg'), denoised)
    cv2.imwrite(image_path.replace('.jpg', '_5_binary.jpg'), binary)
    cv2.imwrite(image_path.replace('.jpg', '_6_final.jpg'), cleaned)
    
    processed_path = image_path.replace('.jpg', '_6_final.jpg')
    print(f"💾 Image finale sauvée: {processed_path}")
    return processed_path

def extract_cin_data_ocr(image_path):
    """Extrait les données de la CIN avec OCR - VERSION AMÉLIORÉE"""
    print("🔍 Extraction des données avec OCR...")
    
    try:
        # Preprocessing de l'image
        processed_path = preprocess_image_for_ocr(image_path)

        # === DEBUG ENVIRONNEMENT TESSERACT ===
        print("TESSDATA_PREFIX Python:", os.environ.get('TESSDATA_PREFIX'))
        print("Fichier fra.traineddata existe:", os.path.exists(r'C:\Program Files\Tesseract-OCR\tessdata\fra.traineddata'))
        print("pytesseract.tesseract_cmd:", pytesseract.pytesseract.tesseract_cmd)

        # 🧪 ESSAYE PLUSIEURS CONFIGURATIONS OCR AVEC LA LANGUE FRANÇAISE SEULE
        configs = [
            r'--oem 3 --psm 6',  # Mode par défaut
            r'--oem 3 --psm 8',  # Une seule ligne
            r'--oem 3 --psm 7',  # Une seule colonne
            r'--oem 3 --psm 11', # Texte épars
            r'--oem 3 --psm 13'  # Ligne brute
        ]

        all_texts = []
        for i, config in enumerate(configs):
            try:
                # Utilise uniquement la langue française pour de meilleurs résultats sur la carte
                text = pytesseract.image_to_string(processed_path, lang='fra', config=config)
                print(f"📄 CONFIGURATION {i+1} ({config}):")
                print(f"    Texte: {repr(text[:200])}")  # Limite à 200 chars
                all_texts.append(text)
            except Exception as e:
                print(f"❌ Config {i+1} échouée: {e}")
        
        # Combine tous les textes
        combined_text = "\n".join(all_texts)
        print(f"📋 TEXTE COMPLET COMBINÉ:")
        print("=" * 50)
        print(combined_text[:500])  # Limite à 500 chars pour éviter le spam
        print("=" * 50)
        
        # 🎯 PATTERNS AMÉLIORÉS pour CIN marocaine (plus robustes)
        patterns = {
            'cin': [
                r'N°\s*([A-Z0-9]{5,10})',
                r'\b([A-Z]{1,2}\d{5,8})\b',
                r'\bT\d{6,7}\b',
                r'\b\d{6,8}\b',
            ],
            'nom': [
                r'NOM[:\s]*([A-ZÉÈÀÙÂÎÔÛÇ\-\s]{2,30})',
                r'\b([A-ZÉÈÀÙÂÎÔÛÇ\-]{3,30})\b(?=\s+RAMI)',
                r'\b([A-ZÉÈÀÙÂÎÔÛÇ\-]{3,30})\b(?=\s+PRENOM)',
                r'\b([A-ZÉÈÀÙÂÎÔÛÇ\-]{3,30})\b',
            ],
            'prenom': [
                r'PRENOM[:\s]*([A-ZÉÈÀÙÂÎÔÛÇ\-\s]{2,30})',
                r'\b([A-ZÉÈÀÙÂÎÔÛÇ\-]{3,30})\b(?=\s+NÉE|\s+NEE|\s+NéE|\s+NéE)',
                r'\b([A-ZÉÈÀÙÂÎÔÛÇ\-]{3,30})\b',
            ],
            'date_naissance': [
                r'NÉE LE\s*(\d{2}[./]\d{2}[./]\d{4})',
                r'NÉ LE\s*(\d{2}[./]\d{2}[./]\d{4})',
                r'NEE LE\s*(\d{2}[./]\d{2}[./]\d{4})',
                r'\b(\d{2}[./]\d{2}[./]\d{4})\b',
            ],
            'lieu_naissance': [
                r'à\s*([A-ZÉÈÀÙÂÎÔÛÇ\-\s]{2,30})',
                r'À\s*([A-ZÉÈÀÙÂÎÔÛÇ\-\s]{2,30})',
                r'\bMOHAMMEDIA\b',
                r'\bCASABLANCA\b',
                r'\bRABAT\b',
            ]
        }
        
        extracted_data = {}

        # Liste de mots à ignorer pour nom/prénom
        mots_interdits = {"ROYAUME", "MAROC", "CARTE", "NATIONALE", "IDENTITE", "D'IDENTITE", "DU", "DE", "NATION"}

        # Dictionnaire de prénoms et noms marocains courants (extrait, à compléter selon besoin)
        prenoms_maroc = {"MOHAMED", "AHMED", "FATIMA", "KHALID", "YASSINE", "HIBA", "RAMI", "SALMA", "IMANE", "SOFIA", "YOUNES", "NOUR", "OMAR", "SAID", "HASSAN", "MOUNA", "ZAKARIA", "NABIL", "SAMIR", "RACHID", "NOURA", "AMINE"}
        noms_maroc = {"EL", "BEN", "BOUAZZA", "RAHMANI", "AIT", "BOUCHRA", "RAFIQ", "ELHASSANI", "ELKHAYAT", "ELMANSOURI", "ELFARISSI", "ELGHARBI", "ELMOUTAWAKIL", "ELAMRANI", "ELKHALFI", "ELJADIDI", "ELMIR", "ELMALKI", "ELFASSI", "ELHADDOU"}

        # 🔍 RECHERCHE AVEC TOUS LES PATTERNS
        for field, field_patterns in patterns.items():
            print(f"\n🎯 Recherche {field.upper()}: ")
            found = False
            for j, pattern in enumerate(field_patterns):
                try:
                    matches = re.findall(pattern, combined_text, re.IGNORECASE | re.MULTILINE)
                    if matches:
                        # Prendre le premier match non vide
                        for match in matches:
                            if isinstance(match, tuple):
                                match = match[0] if match[0] else (match[1] if len(match) > 1 else "")
                            if match and len(match.strip()) > 1:
                                # Nettoyage et limitation de la taille
                                value = match.upper().strip().replace('\n', ' ')
                                value = re.sub(r'\s+', ' ', value)
                                value = value[:30]  # Limite à 30 caractères
                                # Exclure les mots interdits pour nom/prénom
                                if field in ["nom", "prenom"]:
                                    if value in mots_interdits:
                                        continue
                                    # Correspondance partielle (substring) pour tolérer les erreurs OCR
                                    if field == "prenom" and not any(n in value or value in n for n in prenoms_maroc):
                                        continue
                                    if field == "nom" and not any(n in value or value in n for n in noms_maroc.union(prenoms_maroc)):
                                        continue
                                extracted_data[field] = value
                                print(f"    ✅ Pattern {j+1} trouvé: '{value}'")
                                found = True
                                break
                        if found:
                            break
                except Exception as e:
                    print(f"    ❌ Pattern {j+1} erreur: {e}")
            if not found:
                print(f"    ⚠️ {field} non trouvé avec les patterns")

        # 🔧 FALLBACK: extraction de mots significatifs
        if len(extracted_data) < 2:
            print("\n🔧 FALLBACK: Extraction de mots...")
            words = re.findall(r'[A-Z]{2,15}', combined_text)
            numbers = re.findall(r'\d{6,12}', combined_text)
            # Date ultra tolérante : accepte aussi caractères parasites, espaces, tirets, points, barres
            dates = re.findall(r'\d{2}\s*[./\-\\|_]?\s*\d{2}\s*[./\-\\|_]?\s*\d{4}', combined_text)

            print(f"    Mots trouvés: {words[:10]}")  # Limite à 10
            print(f"    Numéros trouvés: {numbers}")
            print(f"    Dates trouvées: {dates}")

            # Nom/prénom : ignorer les mots interdits et filtrer par correspondance partielle
            if not extracted_data.get('nom'):
                for w in words:
                    if w not in mots_interdits and any(n in w or w in n for n in noms_maroc.union(prenoms_maroc)):
                        extracted_data['nom'] = w[:30]
                        print(f"    🔧 Nom auto: {w}")
                        break

            if not extracted_data.get('prenom'):
                for w in words[1:]:
                    if w not in mots_interdits and any(n in w or w in n for n in prenoms_maroc):
                        extracted_data['prenom'] = w[:30]
                        print(f"    🔧 Prénom auto: {w}")
                        break

            if not extracted_data.get('cin') and len(numbers) > 0:
                extracted_data['cin'] = numbers[0][:30]
                print(f"    🔧 CIN auto: {numbers[0]}")

            if not extracted_data.get('date_naissance') and len(dates) > 0:
                # Nettoyage de la date (enlève espaces et caractères parasites)
                date_clean = re.sub(r'[^0-9./-]', '', dates[0])
                extracted_data['date_naissance'] = date_clean[:30]
                print(f"    🔧 Date auto: {date_clean}")

        print(f"\n📊 RÉSULTAT FINAL: {extracted_data}")
        return extracted_data
        
    except Exception as e:
        print(f"❌ Erreur OCR: {e}")
        import traceback
        traceback.print_exc()
        return {}

# 🔍 MODE OCR ACTIVÉ - Route pour traiter les images de cartes nationales
@app.route('/api/process-carte', methods=['POST'])
def process_carte():
    print("🔍 API process-carte appelée - MODE OCR")
    
    if 'file' not in request.files:
        print("❌ Aucun fichier dans la requête")
        return jsonify({'success': False, 'error': 'Aucun fichier fourni'}), 400
        
    file = request.files['file']
    print(f"📁 Fichier reçu: {file.filename} ({file.content_type})")
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    print(f"💾 Fichier sauvé: {filepath}")
    
    
    try:
        # Extraction OCR
        ocr_data = extract_cin_data_ocr(filepath)
        cin_detecte = ocr_data.get('cin', None)
        if cin_detecte:
            print("✅ CIN détecté avec succès!")
            return jsonify({
                'success': True,
                'message': 'CIN détecté',
                'cin': cin_detecte,
                'debug': {
                    'mode': 'OCR_CIN_ONLY',
                    'ocr_raw_data': ocr_data
                }
            })
        else:
            print("⚠️ Aucun CIN détecté")
            return jsonify({
                'success': False,
                'message': 'Impossible de détecter le CIN'
            })
    except Exception as e:
        error_msg = f"Erreur OCR: {str(e)}"
        print(f"❌ ERREUR: {error_msg}")
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500
@app.route('/api/ajouter-exemple-employe', methods=['POST'])
def ajouter_exemple_employe():
    # Ajoute un employé exemple (Rami Hiba, département: Informatique, etc.)
    employe = Employe.query.filter_by(cin='T329150').first()
    if employe:
        return jsonify({'success': True, 'message': 'Employé existe déjà', 'employe_id': employe.id})
    # Ajout d'un champ fictif 'entite' (département) dans la table Employe si besoin
    # Si le modèle Employe n'a pas de champ 'entite', il faut l'ajouter dans la base et le modèle
    # Ici, on simule le département via le champ 'lieu_naissance' si besoin
    nouveau_employe = Employe(
        nom='RAMI',
        prenom='HIBA',
        cin='T329150',
        date_naissance='18-03-2003',
        lieu_naissance='MOHAMMEDIA',
        entite='Informatique'
    )
    try:
        db.session.add(nouveau_employe)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Employé exemple ajouté', 'employe_id': nouveau_employe.id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erreur ajout exemple employé: {str(e)}")
        return jsonify({'success': False, 'error': f'Erreur lors de l\'ajout: {str(e)}'}), 500

# Route de test API
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({
        "message": "API fonctionne",
        "status": "ok",
        "mode": "OCR_AVANCE_TEST_PHOTO"
    })

# Route de test pour vérifier le modèle
@app.route('/api/test-model', methods=['GET'])
def test_model():
    try:
        model_info = {
            'model_loaded': True,
            'model_type': str(type(model)),
            'classes': model.names,
            'num_classes': len(model.names),
            'expected_classes': ['nom', 'prenom']
        }
        print(f"🔧 Info modèle: {model_info}")
        return jsonify(model_info)
    except Exception as e:
        return jsonify({
            'model_loaded': False,
            'error': str(e)
        })

# Route pour créer un nouvel employé
@app.route('/api/employes', methods=['POST'])
def creer_employe():
    data = request.get_json()
    if not data or 'cin' not in data or 'nom' not in data or 'prenom' not in data:
        return jsonify({'success': False, 'error': 'Données manquantes (CIN, nom et prénom sont obligatoires)'}), 400
    
    employe = Employe.query.filter_by(cin=data['cin']).first()
    if employe:
        return jsonify({'success': True, 'message': 'Employé existe déjà', 'employe_id': employe.id})
    
    nouveau_employe = Employe(
        nom=data['nom'],
        prenom=data['prenom'],
        cin=data['cin'],
        date_naissance=data.get('date_naissance', ''),
        lieu_naissance=data.get('lieu_naissance', ''),
        entite=data.get('entite', 'Informatique')
    )
    try:
        db.session.add(nouveau_employe)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Employé créé avec succès', 'employe_id': nouveau_employe.id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erreur création employé: {str(e)}")
        return jsonify({'success': False, 'error': f'Erreur lors de la création: {str(e)}'}), 500

# Route pour lister tous les employés
@app.route('/api/employes', methods=['GET'])
def lister_employes():
    try:
        employes = Employe.query.all()
        result = [{
            'id': e.id,
            'nom': e.nom,
            'prenom': e.prenom,
            'cin': e.cin,
            'date_naissance': e.date_naissance,
            'lieu_naissance': e.lieu_naissance,
            'entite': e.entite,
            'date_creation': e.date_creation.isoformat() if e.date_creation else None
        } for e in employes]
        return jsonify({'success': True, 'employes': result})
    except Exception as e:
        app.logger.error(f"Erreur liste employés: {str(e)}")
        return jsonify({'success': False, 'error': 'Erreur lors de la récupération des employés'}), 500

# Route pour enregistrer un pointage
@app.route('/api/pointage', methods=['POST'])
def enregistrer_pointage():
    data = request.get_json()
    if not data or 'employe_id' not in data or 'entite' not in data:
        return jsonify({'success': False, 'error': 'Données manquantes (employe_id et entite sont obligatoires)'}), 400
    
    employe = Employe.query.get(data['employe_id'])
    if not employe:
        return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404
    
    nouveau_pointage = Pointage(
        employe_id=data['employe_id'],
        entite=data['entite']
    )
    try:
        db.session.add(nouveau_pointage)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Pointage enregistré avec succès', 'pointage_id': nouveau_pointage.id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erreur enregistrement pointage: {str(e)}")
        return jsonify({'success': False, 'error': f'Erreur lors de l\'enregistrement: {str(e)}'}), 500

# Route pour lister tous les pointages
@app.route('/api/pointages', methods=['GET'])
def lister_pointages():
    try:
        pointages = db.session.query(Pointage, Employe).join(Employe).all()
        result = []
        for pointage, employe in pointages:
            result.append({
                'id': pointage.id,
                'date_pointage': pointage.date_pointage.isoformat() if pointage.date_pointage else None,
                'entite': pointage.entite,
                'employe_id': pointage.employe_id,
                'nom': employe.nom,
                'prenom': employe.prenom,
                'cin': employe.cin
            })
        return jsonify({'success': True, 'pointages': result})
    except Exception as e:
        app.logger.error(f"Erreur liste pointages: {str(e)}")
        return jsonify({'success': False, 'error': 'Erreur lors de la récupération des pointages'}), 500

# Route pour servir les fichiers uploadés
@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Route catch-all pour servir l'application React sur toutes les routes non-API
# Cette route doit rester APRÈS toutes les routes API !
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Si le fichier demandé existe dans le build (ex: image, JS, CSS), on le sert directement
    fichier = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(fichier):
        return send_from_directory(app.static_folder, path)
    # Sinon, on sert index.html pour laisser React Router gérer la route
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)