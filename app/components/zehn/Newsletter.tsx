import React from 'react';
import {useState} from 'react';
import {ArrowRight, Check, Loader2, AlertCircle} from 'lucide-react';

type SubscribeStatus = 'idle' | 'submitting' | 'success' | 'error';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      const result = (await response.json()) as {success: boolean; error?: string; alreadySubscribed?: boolean};

      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-primary-foreground mb-3 sm:mb-4 text-balance">
            Stilvoll bleiben
          </h2>
          <p className="text-body lg:text-body-lg text-primary-foreground/70 mb-8 sm:mb-10 font-sans">
            Abonnieren Sie exklusive Angebote, Neuheiten und Styling-Tipps für den modernen Mann.
          </p>

          <div className={`inline-flex items-center gap-3 bg-card/10 backdrop-blur-sm rounded-full px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] ${status === 'success' ? '' : 'hidden'}`}>
            <Check className="w-5 h-5 text-accent" />
            <span className="font-sans text-body text-primary-foreground">Willkommen in der ZEHN-Familie!</span>
          </div>
          <form onSubmit={(e) => { void handleSubmit(e); }} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto ${status === 'success' ? 'hidden' : ''}`}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 bg-card/10 backdrop-blur-sm border border-border/30 rounded-full px-5 sm:px-6 py-3 sm:py-4 font-sans text-[16px] text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-border/50 transition-all duration-300 min-h-[48px]"
              required
              disabled={status === 'submitting'}
            />
            <button
              type="submit"
              disabled={status === 'submitting' || !email}
              className="group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs tracking-[0.3em] uppercase font-sans transition-all duration-300 hover:bg-accent/90 min-h-[48px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  Abonnieren
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all duration-300" />
                </>
              )}
            </button>
          </form>

          {status === 'error' && errorMessage && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <AlertCircle className="w-4 h-4 text-accent" />
              <span className="font-sans text-[13px] text-accent">{errorMessage}</span>
            </div>
          )}

          <p className="font-sans text-body text-primary-foreground/60 mt-4 sm:mt-6">
            Jederzeit abbestellbar. Wir respektieren Ihren Posteingang.
          </p>
        </div>
      </div>
    </section>
  );
}
