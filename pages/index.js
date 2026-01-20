import { useState, useEffect } from 'react';

export default function Home() {
  const [step, setStep] = useState('form');
  const [complaint, setComplaint] = useState('');
  const [email, setEmail] = useState('');
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [freeResponse, setFreeResponse] = useState('');
  const [paidResponse, setPaidResponse] = useState('');
  const [error, setError] = useState('');
  const [hasUsedFree, setHasUsedFree] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const used = localStorage.getItem('used_free_test');
      if (used) setHasUsedFree(true);
    }
  }, []);

  const handleSubmitFree = async () => {
    setError('');
    if (!complaint || !situation) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (hasUsedFree) {
      setError('Vous avez déjà utilisé votre test gratuit.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint, situation, type: 'free' })
      });
      const data = await res.json();
      setFreeResponse(data.response);
      localStorage.setItem('used_free_test', 'true');
      setHasUsedFree(true);
      setStep('free-result');
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaidGeneration = async () => {
    if (!email) {
      setError('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint, situation, email, type: 'paid' })
      });
      const data = await res.json();
      setPaidResponse(data.response);
      setStep('paid-result');
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe)', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
            Une mauvaise réponse écrite peut créer un risque juridique
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '10px' }}>
            Générez une réponse professionnelle et juridiquement neutre, sans reconnaissance de faute ni engagement.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Pour les artisans et petites entreprises du bâtiment confrontés à des réclamations clients
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '15px', marginBottom: '20px', color: '#c00' }}>
            {error}
          </div>
        )}

        {step === 'form' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '30px' }}>Voir un exemple de réponse</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Message de réclamation *</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={6}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                placeholder="Exemple : Bonjour, je vous contacte concernant les travaux réalisés..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Type de situation *</label>
              <select
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <option value="">Sélectionnez...</option>
                <option value="retard">Retard de travaux</option>
                <option value="qualite">Qualité contestée</option>
                <option value="facturation">Facturation</option>
                <option value="comportement">Communication</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <button
              onClick={handleSubmitFree}
              disabled={loading || hasUsedFree}
              style={{
                width: '100%',
                padding: '16px',
                background: hasUsedFree ? '#94a3b8' : '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: hasUsedFree ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Génération...' : hasUsedFree ? 'Test gratuit utilisé' : 'Générer une réponse test'}
            </button>
          </div>
        )}

        {step === 'free-result' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Votre aperçu - Version TEST</h2>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{freeResponse}</p>
            </div>
            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Ce qui manque :</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>• Formulation complète prête à envoyer</li>
                <li>• Protection juridique renforcée</li>
                <li>• Ton professionnel optimal</li>
              </ul>
            </div>
            <button
              onClick={() => setStep('payment')}
              style={{
                width: '100%',
                padding: '16px',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Accéder à la réponse complète - 9,90€
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Accès à la réponse complète</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Votre email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                placeholder="votre@email.com"
              />
            </div>
            <button
              onClick={handlePaidGeneration}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Génération...' : 'Simuler le paiement (9,90€)'}
            </button>
          </div>
        )}

        {step === 'paid-result' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Votre réponse complète</h2>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
              ✅ Réponse envoyée à {email}
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #cbd5e1' }}>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{paidResponse}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(paidResponse);
                alert('Copié!');
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📋 Copier la réponse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
