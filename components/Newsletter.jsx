import { useState } from 'react';
import { sanitizeCheckoutField } from '../src/lib/security';

const Newsletter = () => {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubscribe = () => {
    const safeEmail = sanitizeCheckoutField('email', email).trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(safeEmail);
    if (!isValid) {
      setError('Por favor ingresa un email válido.');
      return;
    }

    setSubmitted(true);
    setEmail('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubscribe();
  };

  return (
    <section
      className="bg-surface-container py-[120px] text-center"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-xl mx-auto px-6">
        <h2
          id="newsletter-heading"
          className="font-headline-md text-headline-md mb-4 uppercase tracking-wider"
        >
          Únete al Círculo Íntimo
        </h2>
        <p className="font-body-md text-on-surface-variant mb-10">
          Sé la primera en conocer nuestras ediciones limitadas y vistas privadas.
        </p>

        {submitted ? (
          <p
            role="status"
            className="font-label-lg text-label-lg uppercase tracking-widest text-primary"
          >
            Bienvenida al círculo MARA.
          </p>
        ) : (
          <div className="relative max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Tu dirección de email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(sanitizeCheckoutField('email', e.target.value)); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="TU CORREO ELECTRÓNICO"
              autoComplete="email"
              aria-describedby={error ? 'newsletter-error' : undefined}
              className="w-full bg-transparent border-b border-primary py-4 px-0
                         focus:ring-0 focus:border-primary
                         placeholder:text-primary/40
                         font-label-sm text-label-sm uppercase tracking-widest
                         outline-none"
            />

            <button
              onClick={handleSubscribe}
              aria-label="Suscribirse al newsletter"
              className="absolute right-0 bottom-4 font-label-lg text-label-lg
                         uppercase tracking-widest text-primary
                         hover:opacity-70 transition-opacity"
            >
              Suscribirse
            </button>

            {error && (
              <p
                id="newsletter-error"
                role="alert"
                className="mt-3 text-left font-label-sm text-label-sm text-error"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
