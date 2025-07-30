import React, { useRef, useState, useEffect } from 'react';

function CardScanner({ onScanComplete, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [scanResult, setScanResult] = useState(null); // Ajout pour afficher le résultat

  // Ajout : écouteur pour scan d'image importée
  useEffect(() => {
    const handleImport = (e) => {
      const file = e.detail;
      if (!file) return;
      handleFileUpload({ target: { files: [file] } });
    };
    document.addEventListener('cardscanner-import', handleImport);
    return () => document.removeEventListener('cardscanner-import', handleImport);
  }, []);

  // Initialiser la webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        console.log('🎥 Demande d\'accès à la caméra...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        console.log('✅ Caméra autorisée');
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          console.log('📹 Stream assigné à la vidéo');
        }
      } catch (err) {
        console.error('❌ Erreur caméra:', err);
        setError("Impossible d'accéder à la caméra: " + err.message);
      }
    };

    startWebcam();
    
    // Cleanup function
    return () => {
      if (stream) {
        console.log('🔴 Arrêt du stream caméra');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capturer et analyser
  const captureAndAnalyze = async () => {
    console.log('🔥 DEBUT captureAndAnalyze - bouton cliqué !');
    
    if (!videoRef.current || !canvasRef.current) {
      console.log('❌ Refs non disponibles:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current
      });
      return;
    }

    console.log('✅ Refs OK, début analyse...');
    
    setIsScanning(true);
    setError('');
    setScanCount(prev => prev + 1);
    setAnalysisProgress('📸 Capture de l\'image...');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    console.log('📺 Video readyState:', video.readyState);
    console.log('📺 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      console.log('✅ Vidéo prête, capture en cours...');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log('🖼️ Image dessinée sur canvas');

      console.log('⏱️ Envoi immédiat vers le serveur');
      setAnalysisProgress('🚀 Envoi vers l\'IA YOLOv8...');

      canvas.toBlob(async (blob) => {
        console.log('📷 Blob créé, taille:', blob ? blob.size : 'null');
        
        if (!blob) {
          console.error('❌ Echec création blob');
          setError('Erreur lors de la création de l\'image');
          setIsScanning(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', blob, `capture_${Date.now()}.jpg`);
        console.log('📦 FormData préparé');

        try {
          console.log('🚀 Envoi de la requête vers /api/process-carte');
          const response = await fetch('/api/process-carte', {
            method: 'POST',
            body: formData
          });

          console.log('📡 Réponse reçue:', response.status, response.statusText);

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          setAnalysisProgress('🔍 Analyse des données...');
          const result = await response.json();
          console.log('📊 Résultat du serveur:', result);

          setScanResult(result); // Affiche toujours le résultat brut

          if (result.success) {
            // Utilise les vraies données du backend
            const extractedData = result.detections;
            setAnalysisProgress('✅ Analyse terminée !');
            setIsScanning(false);
            console.log('🎉 Analyse réussie, appel onScanComplete');
            onScanComplete && onScanComplete(extractedData, canvas.toDataURL('image/jpeg'));
          } else {
            console.log('⚠️ Aucune carte détectée:', result.message);
            setError(result.message || 'Aucune carte détectée');
            setIsScanning(false);
            setAnalysisProgress('');
          }
        } catch (err) {
          console.error('❌ Erreur capture:', err);
          setError("Erreur lors de l'analyse: " + err.message);
          setIsScanning(false);
          setAnalysisProgress('');
        }
      }, 'image/jpeg', 0.9);
    } else {
      console.log('❌ Vidéo pas prête, readyState:', video.readyState);
      setError("La caméra n'est pas encore prête");
      setIsScanning(false);
      setAnalysisProgress('');
    }
  };

  const stopScan = () => {
    console.log('🛑 Arrêt du scan demandé');
    setIsScanning(false);
    setError('');
    setAnalysisProgress('');
  };

  // Gestion de l'upload d'image depuis le disque
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsScanning(true);
    setError("");
    setAnalysisProgress('🚀 Envoi de l\'image sélectionnée...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/process-carte', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      setAnalysisProgress('🔍 Analyse des données...');
      const result = await response.json();
      setScanResult(result);
      if (result.success) {
        setAnalysisProgress('✅ Analyse terminée !');
        setIsScanning(false);
        onScanComplete && onScanComplete(result.detections, null);
      } else {
        setError(result.message || 'Aucune carte détectée');
        setIsScanning(false);
        setAnalysisProgress('');
      }
    } catch (err) {
      setError("Erreur lors de l'analyse: " + err.message);
      setIsScanning(false);
      setAnalysisProgress('');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🤖 Scanner IA YOLOv8</h3>
        <p className="text-muted mb-0">Placez la carte d'identité dans le cadre et cliquez sur "Capturer" ou importez une image</p>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            ❌ {error}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => setError('')}
            >
              Fermer
            </button>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded border"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '400px'
              }}
            />

            {/* Cadre de guidage */}
            <div
              className="position-absolute border border-success"
              style={{
                top: '10%',
                left: '10%',
                width: '80%',
                height: '60%',
                borderWidth: '3px',
                borderStyle: 'dashed',
                borderRadius: '10px',
                pointerEvents: 'none'
              }}
            />

            {/* Overlay d'analyse */}
            {isScanning && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 rounded">
                <div className="text-center text-white">
                  <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Analyse en cours...</span>
                  </div>
                  <h5 className="mb-2">{analysisProgress}</h5>
                  <small>Scan #{scanCount}</small>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary btn-3d"
            onClick={onBack}
            disabled={isScanning}
          >
            ← Retour
          </button>

          {/* BOUTON DE DEBUG TEMPORAIRE */}
          <button
            className="btn btn-warning btn-3d"
            onClick={() => console.log('🧪 Test bouton cliqué !')}
          >
            🧪 Test
          </button>

          {/* Bouton d'upload d'image */}
          <label className="btn btn-primary flex-fill mb-0 btn-3d">
            📁 Importer une image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isScanning} />
          </label>
          {!isScanning ? (
            <button
              className="btn btn-success flex-fill btn-3d"
              onClick={captureAndAnalyze}
            >
              📸 Capturer et analyser
            </button>
          ) : (
            <button
              className="btn btn-danger flex-fill btn-3d"
              onClick={stopScan}
            >
              ⏹️ Arrêter l'analyse
            </button>
          )}
        </div>

        {/* Indicateur de progression */}
        {isScanning && (
          <div className="mt-3">
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                role="progressbar"
                style={{ width: '100%' }}
              ></div>
            </div>
            <small className="text-muted d-block mt-1 text-center">
              {analysisProgress}
            </small>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            💡 Conseil : Assurez-vous que la carte soit bien éclairée et dans le cadre vert
          </small>
        </div>

        {/* === Affichage du résultat OCR === */}
        {scanResult && (
          <div className="alert alert-info mt-3">
            <h5>Résultat OCR</h5>
            <div>Nom : {scanResult.nom || scanResult.detections?.nom || 'Non détecté'}</div>
            <div>Prénom : {scanResult.prenom || scanResult.detections?.prenom || 'Non détecté'}</div>
            <div>CIN : {
              scanResult.cin ||
              scanResult.detections?.cin ||
              (scanResult.detections && typeof scanResult.detections === 'object' && Object.values(scanResult.detections).find(v => /^[A-Z0-9]{6,}$/.test(v))) ||
              'Non détecté'
            }</div>
            <div>Date de naissance : {scanResult.date_naissance || scanResult.detections?.date_naissance || 'Non détecté'}</div>
            <div>Lieu de naissance : {scanResult.lieu_naissance || scanResult.detections?.lieu_naissance || 'Non détecté'}</div>
            <hr />
            <pre style={{fontSize:12, background:'#f8f9fa', padding:8}}>
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardScanner;