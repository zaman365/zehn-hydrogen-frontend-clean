import {useState} from 'react';
import {Mail, Send, CheckCircle, AlertCircle, Loader2} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ============================================
// CONSTANTS
// ============================================

const SUBJECT_OPTIONS = [
  {value: '', label: 'Bitte wählen...'},
  {value: 'order', label: 'Bestellanfrage'},
  {value: 'return', label: 'Retoure'},
  {value: 'product', label: 'Produktfrage'},
  {value: 'complaint', label: 'Reklamation'},
  {value: 'other', label: 'Sonstiges'},
];

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

// ============================================
// VALIDATION
// ============================================

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Bitte geben Sie Ihren Namen ein.';
  }

  if (!data.email.trim()) {
    errors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  }

  if (!data.subject) {
    errors.subject = 'Bitte wählen Sie einen Betreff.';
  }

  if (!data.message.trim()) {
    errors.message = 'Bitte geben Sie eine Nachricht ein.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Die Nachricht muss mindestens 10 Zeichen lang sein.';
  }

  return errors;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-sans text-body font-medium text-foreground">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-accent">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-sans text-[13px]">{error}</span>
        </div>
      )}
    </div>
  );
}

function SuccessView({onReset}: {onReset: () => void}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-5">
        <CheckCircle className="w-8 h-8 text-accent" />
      </div>
      <h3 className="font-sans text-h3 text-foreground mb-2">
        Nachricht gesendet!
      </h3>
      <p className="font-sans text-body-lg text-secondary max-w-md mb-6">
        Vielen Dank für Ihre Nachricht. Unser Team wird sich innerhalb von 24
        Stunden (werktags) bei Ihnen melden.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-foreground text-foreground font-sans text-body font-semibold hover:bg-foreground hover:text-primary-foreground transition-colors"
      >
        Weitere Nachricht senden
      </button>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function ContactEmailForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({...prev, [field]: value}));
    // Clear error on change if field was touched
    if (touched.has(field) && errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(field));
    // Validate single field on blur
    const fieldErrors = validateForm(formData);
    if (fieldErrors[field]) {
      setErrors((prev) => ({...prev, [field]: fieldErrors[field]}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched(new Set(['name', 'email', 'subject', 'message']));
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as {success: boolean};
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setTouched(new Set());
    setStatus('idle');
  };

  const inputBaseClass =
    'w-full px-4 py-3 rounded-lg border bg-card font-sans text-body-lg text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors';
  const inputErrorClass = 'border-red-300 focus:ring-red-200 focus:border-red-400';
  const inputNormalClass = 'border-border/20 hover:border-border/40';

  return (
    <section id="email" className="scroll-mt-0">
      <div className="bg-card border border-border/10 rounded-xl p-3">
        {status === 'success' ? (
          <SuccessView onReset={handleReset} />
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-5">
            {/* Name field */}
            <FormField label="Name" error={errors.name} required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Ihr vollständiger Name"
                className={`${inputBaseClass} ${
                  errors.name ? inputErrorClass : inputNormalClass
                }`}
              />
            </FormField>

            {/* Email field */}
            <FormField label="E-Mail" error={errors.email} required>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="ihre@email.de"
                className={`${inputBaseClass} ${
                  errors.email ? inputErrorClass : inputNormalClass
                }`}
              />
            </FormField>

            {/* Subject */}
            <FormField label="Betreff" error={errors.subject} required>
              <select
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                className={`${inputBaseClass} ${
                  errors.subject ? inputErrorClass : inputNormalClass
                } ${!formData.subject ? 'text-secondary/50' : ''}`}
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Message */}
            <FormField label="Nachricht" error={errors.message} required>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder="Beschreiben Sie Ihr Anliegen..."
                rows={5}
                className={`${inputBaseClass} resize-y min-h-[120px] ${
                  errors.message ? inputErrorClass : inputNormalClass
                }`}
              />
            </FormField>

            {/* Error Banner */}
            {status === 'error' && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="font-sans text-body text-accent">
                  Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es
                  erneut oder kontaktieren Sie uns direkt unter hello@zehn.store.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-sans text-body-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Nachricht senden
                </>
              )}
            </button>

            <p className="font-sans text-[13px] text-secondary">
              * Pflichtfelder. Ihre Daten werden gemäß unserer{' '}
              <a
                href="/pages/privacy"
                className="text-accent hover:underline"
              >
                Datenschutzerklärung
              </a>{' '}
              verarbeitet.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
