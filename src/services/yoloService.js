import axios from 'axios';

export class RoboflowYOLOService {
  constructor() {
    // Configuration Roboflow (mode développement par défaut)
    this.ROBOFLOW_API_KEY = "demo_key";
    this.ROBOFLOW_MODEL_URL = "https://detect.roboflow.com/demo-model/1";
    this.isLoaded = true;
  }

  // Convertir une image en base64
  imageToBase64(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageElement.width || imageElement.videoWidth || 640;
    canvas.height = imageElement.height || imageElement.videoHeight || 480;
    
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  // Détecter une carte d'identité
  async detectCard(imageElement) {
    try {
      console.log('🤖 Analyse avec Roboflow YOLO...');
      
      // Mode simulation pour le développement
      return this.simulateDetection();
      
      // Code pour Roboflow réel (décommenter quand vous avez les clés)
      /*
      const base64Image = this.imageToBase64(imageElement);
      
      const response = await axios.post(
        `${this.ROBOFLOW_MODEL_URL}?api_key=${this.ROBOFLOW_API_KEY}`,
        base64Image,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      const predictions = response.data.predictions || [];
      
      if (predictions.length > 0) {
        const bestPrediction = predictions.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );

        if (bestPrediction.confidence > 0.7) {
          return {
            success: true,
            confidence: bestPrediction.confidence,
            boundingBox: {
              x: bestPrediction.x - bestPrediction.width / 2,
              y: bestPrediction.y - bestPrediction.height / 2,
              width: bestPrediction.width,
              height: bestPrediction.height
            },
            class: bestPrediction.class,
            message: `Carte détectée avec ${(bestPrediction.confidence * 100).toFixed(1)}% de confiance`
          };
        }
      }

      return {
        success: false,
        message: 'Aucune carte d\'identité détectée'
      };
      */

    } catch (error) {
      console.error('Erreur Roboflow:', error);
      return this.simulateDetection();
    }
  }

  // Simulation pour le développement
  async simulateDetection() {
    console.log('🎭 Mode simulation YOLO...');
    
    // Délai de simulation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const detectionSuccess = Math.random() > 0.2; // 80% de succès
    
    if (detectionSuccess) {
      return {
        success: true,
        confidence: 0.85 + Math.random() * 0.1,
        boundingBox: {
          x: 50 + Math.random() * 20,
          y: 100 + Math.random() * 20,
          width: 300 + Math.random() * 50,
          height: 200 + Math.random() * 30
        },
        class: 'national_id_card',
        message: 'Carte détectée (simulation)'
      };
    } else {
      return {
        success: false,
        message: 'Aucune carte détectée. Repositionnez la carte dans le cadre.'
      };
    }
  }

  // Extraire les données OCR (simulation)
  async extractCardData(imageElement) {
    try {
      console.log('📖 Extraction des données OCR...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Données simulées réalistes
      const noms = ['BENALI', 'ALAMI', 'CHAKIR', 'MANSOURI', 'IDRISSI', 'TAZI', 'FASSI'];
      const prenoms = ['Mohamed', 'Fatima', 'Ahmed', 'Aicha', 'Youssef', 'Khadija', 'Omar'];
      const villes = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknes'];
      
      const extractedData = {
        nom: noms[Math.floor(Math.random() * noms.length)],
        prenom: prenoms[Math.floor(Math.random() * prenoms.length)],
        cin: 'ID' + Math.floor(Math.random() * 900000 + 100000),
        date_naissance: '199' + Math.floor(Math.random() * 5) + '-' + 
                       String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + 
                       String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
        lieu_naissance: villes[Math.floor(Math.random() * villes.length)],
        sexe: Math.random() > 0.5 ? 'M' : 'F'
      };

      return {
        success: true,
        data: extractedData,
        message: 'Données extraites avec succès'
      };
    } catch (error) {
      console.error('Erreur OCR:', error);
      throw new Error('Erreur lors de l\'extraction des données');
    }
  }

  // Configurer Roboflow (pour la production)
  configure(apiKey, modelUrl) {
    this.ROBOFLOW_API_KEY = apiKey;
    this.ROBOFLOW_MODEL_URL = modelUrl;
    console.log('✅ Roboflow configuré');
  }

  // Vérifier la configuration
  isConfigured() {
    return this.ROBOFLOW_API_KEY && 
           this.ROBOFLOW_API_KEY !== "demo_key" &&
           this.ROBOFLOW_MODEL_URL;
  }
}

// Instance singleton
export const yoloService = new RoboflowYOLOService();