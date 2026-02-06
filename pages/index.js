console.log('VERSION ADMIN TEST');
import { useState, useEffect } from 'react';

/* =========================
   ПРОСТОЙ ТРЕКИНГ
   ========================= */
const track = (event, data = {}) => {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('is_admin') === 'true') return;

  const logs = JSON.parse(localStorage.getItem('stats') || '[]');
  logs.push({
    event,
    data,
    time: new Date().toISOString()
  });
  localStorage.setItem('stats', JSON.stringify(logs));
};

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

  /* =========================
     ЗАГРУЗКА / СТАРТ
     ========================= */
  useEffect(() => {
    track('page_view');

    const used = localStorage.getItem('used_free_test');
    if (used) setHasUsedFree(true);
  }, []);

  /* =========================
     FREE
     ========================= */
  const handleSubmitFree = async () => {
    setError('');

    if (!complaint || !situation) {
      setError('Veuillez remplir tous les champs obligatoires.');
      track('error', { type: 'validation_free' });
      return;
    }

    if (hasUsedFree) {
      setError('Vous avez déjà utilisé votre test gratuit.');
      track('error', { type: 'already_used_free' });
      return;
    }

    track('click_free_test');

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

      track('free_result_shown', { situation });

    } catch (err) {
      setError('Une erreur est survenue.');
      track('error', { type: 'api_free' });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PAID
     ========================= */
  const handlePaidGeneration = async () => {
    if (!email) {
      setError('Veuillez saisir votre email.');
      track('error', { type: 'email_missing' });
      return;
    }

    track('click_payment');

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

      track('paid_result_shown');

    } catch (err) {
      setError('Une erreur est survenue.');
      track('error', { type: 'api_paid' });
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px' }}>
            <h2>Voir un exemple de réponse</h2>

            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={6}
              placeholder="Message client"
              style={{ width: '100%', marginBottom: '20px' }}
            />

            <select
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              style={{ width: '100%', marginBottom: '20px' }}
            >
              <option value="">Situation</option>
              <option value="retard">Retard</option>
              <option value="qualite">Qualité</option>
              <option value="facturation">Facturation</option>
              <option value="autre">Autre</option>
            </select>

            <button onClick={handleSubmitFree} disabled={loading || hasUsedFree}>
              Générer une réponse test
            </button>
          </div>
        )}

        {step === 'free-result' && (
          <div>
            <p>{freeResponse}</p>
            <button onClick={() => {
              track('go_to_payment');
              setStep('payment');
            }}>
              Accéder à la réponse complète
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <button onClick={handlePaidGeneration}>
              Simuler paiement
            </button>
          </div>
        )}

        {step === 'paid-result' && (
          <div>
            <p>{paidResponse}</p>
          </div>
        )}

      </div>
    </div>
  );
}
