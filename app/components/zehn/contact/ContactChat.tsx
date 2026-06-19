import {useState, useRef, useEffect, useCallback} from 'react';
import {MessageCircle, X, Send, User, Bot, ArrowRight, Loader2, Mail, HelpCircle, CheckCircle, AlertCircle} from 'lucide-react';
import {useNavigate} from 'react-router';
import type {ChatResponse} from '~/lib/chat/types';

// ============================================
// TYPES
// ============================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

type ChatState = 'closed' | 'open' | 'escalated';
type WidgetTab = 'chat' | 'email' | 'whatsapp';

// ============================================
// EMAIL FORM TYPES
// ============================================

interface EmailFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type EmailFormStatus = 'idle' | 'submitting' | 'success' | 'error';

const SUBJECT_OPTIONS = [
  {value: '', label: 'Bitte wählen...'},
  {value: 'order', label: 'Bestellanfrage'},
  {value: 'return', label: 'Retoure'},
  {value: 'product', label: 'Produktfrage'},
  {value: 'complaint', label: 'Reklamation'},
  {value: 'other', label: 'Sonstiges'},
];

const INITIAL_EMAIL_FORM: EmailFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function validateEmailForm(data: EmailFormData): EmailFormErrors {
  const errors: EmailFormErrors = {};
  if (!data.name.trim()) errors.name = 'Name ist erforderlich';
  if (!data.email.trim()) {
    errors.email = 'E-Mail ist erforderlich';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ungültige E-Mail-Adresse';
  }
  if (!data.subject) errors.subject = 'Betreff ist erforderlich';
  if (!data.message.trim()) {
    errors.message = 'Nachricht ist erforderlich';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Nachricht muss mindestens 10 Zeichen lang sein';
  }
  return errors;
}

// ============================================
// AI API CLIENT
// ============================================

const GREETING_MESSAGE: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Hallo! 👋 Ich bin der ZEHN Assistent. Ich kann Ihnen bei Fragen zu Bestellungen, Versand, Retouren, Größen, Zahlung und mehr helfen. Wie kann ich Ihnen weiterhelfen?',
  timestamp: new Date(),
};

const FALLBACK_ERROR =
  'Entschuldigung, ich konnte Ihre Anfrage gerade nicht verarbeiten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns per E-Mail (hello@zehn.store) oder Telefon (+49 30 123 456 789).';

const ESCALATION_CONFIRMATION =
  'Sie werden nun mit einem unserer Kundenservice-Mitarbeiter verbunden. Unser Team ist Mo–Fr von 9:00–18:00 Uhr erreichbar. Außerhalb der Geschäftszeiten hinterlassen Sie bitte eine Nachricht — wir melden uns schnellstmöglich zurück.';

const INSTANT_RESPONSES: Record<string, {content: string; links?: Array<{label: string; href: string}>}> = {
  'Wo ist meine Bestellung?': {
    content: 'Den aktuellen Status Ihrer Bestellung finden Sie in Ihrem ZEHN-Kundenkonto unter "Meine Bestellungen". Dort sehen Sie den Bestellstatus und die Tracking-Nummer. Sie können Ihr Paket auch direkt bei DHL verfolgen.',
    links: [
      {label: 'Meine Bestellungen', href: '/account/orders'},
      {label: 'DHL Sendungsverfolgung', href: '/pages/track-order'},
    ],
  },
  'Wie kann ich retournieren?': {
    content: 'Sie haben 30 Tage kostenloses Rückgaberecht. Das Retourenlabel liegt Ihrer Bestellung bei oder kann im Kundenkonto erstellt werden. Die Rückerstattung erfolgt innerhalb von 5–7 Werktagen nach Eingang. Ein direkter Umtausch ist leider nicht möglich — bitte retournieren Sie den Artikel und bestellen Sie neu.',
    links: [
      {label: 'Retoure starten', href: '/account/orders'},
      {label: 'Versand & Retouren', href: '/pages/shipping'},
    ],
  },
  'Welche Größe passt mir?': {
    content: 'Oberteile (Brustumfang): S: 88–92 cm, M: 94–98 cm, L: 100–104 cm, XL: 106–110 cm, XXL: 112–116 cm. Hosen (Bundweite): 28: 72 cm, 30: 76 cm, 32: 80 cm, 34: 84 cm, 36: 88 cm. Bei Unsicherheit empfehlen wir die größere Größe.',
    links: [
      {label: 'Zum Fitguide', href: '/pages/fitguide'},
    ],
  },
  'Welche Zahlungsarten gibt es?': {
    content: 'Wir akzeptieren: Visa, Mastercard, American Express, PayPal, Klarna (Rechnung, Ratenzahlung, Sofortzahlung), Apple Pay, Google Pay und SEPA-Lastschrift. Alle Zahlungen sind SSL-verschlüsselt.',
    links: [
      {label: 'Zahlungsinfo', href: '/pages/payment'},
    ],
  },
};

/**
 * Call the backend /api/chat endpoint with conversation history.
 */
async function callChatApi(
  messages: ChatMessage[]
): Promise<string> {
  const apiMessages = messages
    .filter((msg) => (msg.role === 'user' || msg.role === 'assistant') && !msg.content.startsWith('__INSTANT__'))
    .map((msg) => ({role: msg.role, content: msg.content}));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({messages: apiMessages}),
  });

  const data = (await response.json()) as ChatResponse;

  if (data.content) {
    return data.content;
  }

  throw new Error(data.error || 'Empty response');
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex items-center gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="font-sans text-[11px] text-secondary ml-1.5">
        tippt...
      </span>
    </div>
  );
}

function MessageBubble({message}: {message: ChatMessage}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Handle instant response cards
  if (!isUser && message.content.startsWith('__INSTANT__')) {
    const key = message.content.replace('__INSTANT__', '');
    const instant = INSTANT_RESPONSES[key];
    if (instant) {
      return <InstantResponseBubble content={instant.content} links={instant.links} />;
    }
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-accent/10 border border-accent/20 rounded-full px-4 py-2">
          <p className="font-sans text-[13px] text-accent text-center">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-1.5 mb-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-accent text-accent-foreground'
            : 'bg-foreground text-primary-foreground'
        }`}
      >
        {isUser ? (
          <User className="w-3 h-3" />
        ) : (
          <Bot className="w-3 h-3" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 ${
          isUser
            ? 'bg-accent text-accent-foreground rounded-br-sm'
            : 'bg-background border border-border/10 text-foreground rounded-bl-sm'
        }`}
      >
        <p className="font-sans text-[13px] leading-snug whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={`font-sans text-[10px] mt-0.5 ${
            isUser ? 'text-accent-foreground/60' : 'text-secondary/60'
          }`}
        >
          {message.timestamp.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function InstantResponseBubble({content, links}: {content: string; links?: Array<{label: string; href: string}>}) {
  return (
    <div className="flex gap-1.5 mb-2 flex-row">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-foreground text-primary-foreground"
      >
        <Bot className="w-3 h-3" />
      </div>
      <div className="max-w-[85%] rounded-xl px-3 py-2 bg-background border border-border/10 text-foreground rounded-bl-sm">
        <p className="font-sans text-[13px] leading-snug whitespace-pre-wrap">
          {content}
        </p>
        {links && links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent font-sans text-[11px] font-medium hover:bg-accent/20 transition-colors"
              >
                {link.label}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickSuggestions({onSelect}: {onSelect: (text: string) => void}) {
  const suggestions = [
    'Wo ist meine Bestellung?',
    'Wie kann ich retournieren?',
    'Welche Größe passt mir?',
    'Welche Zahlungsarten gibt es?',
  ];

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-border/10">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="px-2.5 py-1 rounded-full bg-background border border-border/20 font-sans text-[11px] text-foreground hover:border-accent hover:text-accent transition-colors"
        >
          {text}
        </button>
      ))}
    </div>
  );
}

// ============================================
// EMAIL FORM PANEL
// ============================================

function EmailFormPanel() {
  const [formData, setFormData] = useState<EmailFormData>(INITIAL_EMAIL_FORM);
  const [errors, setErrors] = useState<EmailFormErrors>({});
  const [status, setStatus] = useState<EmailFormStatus>('idle');

  const handleChange = (field: keyof EmailFormData, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: undefined}));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEmailForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        setFormData(INITIAL_EMAIL_FORM);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-accent" />
        </div>
        <h4 className="font-sans text-body-lg font-semibold text-foreground">
          Nachricht gesendet!
        </h4>
        <p className="font-sans text-body text-foreground/70">
          Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 px-6 py-2.5 rounded-full bg-accent text-accent-foreground font-sans text-body font-medium hover:opacity-90 transition-opacity"
        >
          Neue Nachricht
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {status === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
          <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="font-sans text-[13px] text-accent">
            Fehler beim Senden. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="font-sans text-[13px] font-medium text-foreground mb-1 block">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ihr Name"
          className={`w-full px-3 py-2.5 rounded-xl bg-background border font-sans text-body text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${
            errors.name ? 'border-red-400' : 'border-border/20'
          }`}
        />
        {errors.name && <p className="font-sans text-[12px] text-accent mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="font-sans text-[13px] font-medium text-foreground mb-1 block">E-Mail *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="ihre@email.de"
          className={`w-full px-3 py-2.5 rounded-xl bg-background border font-sans text-body text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${
            errors.email ? 'border-red-400' : 'border-border/20'
          }`}
        />
        {errors.email && <p className="font-sans text-[12px] text-accent mt-1">{errors.email}</p>}
      </div>

      {/* Subject */}
      <div>
        <label className="font-sans text-[13px] font-medium text-foreground mb-1 block">Betreff *</label>
        <select
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className={`w-full px-3 py-2.5 rounded-xl bg-background border font-sans text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${
            errors.subject ? 'border-red-400' : 'border-border/20'
          }`}
        >
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.subject && <p className="font-sans text-[12px] text-accent mt-1">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label className="font-sans text-[13px] font-medium text-foreground mb-1 block">Nachricht *</label>
        <textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Wie können wir Ihnen helfen?"
          rows={4}
          className={`w-full px-3 py-2.5 rounded-xl bg-background border font-sans text-body text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none ${
            errors.message ? 'border-red-400' : 'border-border/20'
          }`}
        />
        {errors.message && <p className="font-sans text-[12px] text-accent mt-1">{errors.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-accent text-accent-foreground font-sans text-body font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Nachricht senden
          </>
        )}
      </button>
    </form>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function ContactChat({initialOpen = false}: {initialOpen?: boolean}) {
  const [chatState, setChatState] = useState<ChatState>(
    initialOpen ? 'open' : 'closed'
  );
  const [activeTab, setActiveTab] = useState<WidgetTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // WhatsApp form state
  const [whatsappName, setWhatsappName] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Allow parent to open the chat
  useEffect(() => {
    if (initialOpen && chatState === 'closed') {
      setChatState('open');
    }
  }, [initialOpen]);

  // Listen for custom event to open chat widget
  useEffect(() => {
    const handleOpenChat = () => {
      setChatState('open');
      setActiveTab('chat');
      // Focus input after a short delay to ensure widget is open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    };

    const handleOpenEmail = () => {
      setChatState('open');
      setActiveTab('email');
      // Focus first input in email form after delay
      setTimeout(() => {
        const firstInput = document.querySelector<HTMLInputElement>('#email input[type="text"]');
        firstInput?.focus();
      }, 300);
    };

    const handleOpenWhatsApp = () => {
      setChatState('open');
      setActiveTab('whatsapp');
    };

    window.addEventListener('openChatWidget', handleOpenChat);
    window.addEventListener('openEmailWidget', handleOpenEmail);
    window.addEventListener('openWhatsAppWidget', handleOpenWhatsApp);
    
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChat);
      window.removeEventListener('openEmailWidget', handleOpenEmail);
      window.removeEventListener('openWhatsAppWidget', handleOpenWhatsApp);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatState === 'open') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatState]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping || chatState === 'escalated') return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputValue('');
      setUserMessageCount((prev) => prev + 1);

      // Check if user wants WhatsApp or real representative
      const lowerText = text.toLowerCase();
      const whatsappKeywords = ['whatsapp', 'whats app', 'wa'];
      const representativeKeywords = [
        'mitarbeiter', 'mensch', 'person', 'agent', 'representative',
        'real', 'human', 'echte', 'echter', 'kundenservice', 'support'
      ];

      const wantsWhatsApp = whatsappKeywords.some(keyword => lowerText.includes(keyword));
      const wantsRepresentative = representativeKeywords.some(keyword => lowerText.includes(keyword));

      if (wantsWhatsApp || wantsRepresentative) {
        // Switch to WhatsApp tab
        setActiveTab('whatsapp');

        // Add system message
        const systemMsg: ChatMessage = {
          id: generateId(),
          role: 'system',
          content: 'Sie werden zum WhatsApp-Tab weitergeleitet, um direkt mit unserem Team zu sprechen.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMsg]);
        return;
      }

      setIsTyping(true);

      try {
        const aiContent = await callChatApi(updatedMessages);
        const aiMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error) {
        console.error('[Chat] API error:', error);
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: FALLBACK_ERROR,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, chatState, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleEscalate = () => {
    // Switch to WhatsApp tab instead of just escalating
    setActiveTab('whatsapp');
    const systemMsg: ChatMessage = {
      id: generateId(),
      role: 'system',
      content: 'Sie werden zum WhatsApp-Tab weitergeleitet, um direkt mit unserem Team zu sprechen.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMsg]);
  };

  const handleQuickSuggestion = (text: string) => {
    const instant = INSTANT_RESPONSES[text];
    if (instant) {
      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      // Add instant assistant response
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `__INSTANT__${text}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setUserMessageCount((prev) => prev + 1);
    } else {
      sendMessage(text);
    }
  };

  const showEscalation = userMessageCount >= 2 && chatState !== 'escalated';

  // WhatsApp send handler
  const handleSendWhatsApp = () => {
    const phoneNumber = '491634210324'; // WhatsApp number
    const greeting = whatsappName ? `Hallo, ich bin ${whatsappName}.\n\n` : '';
    const fullMessage = greeting + whatsappMessage;
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setWhatsappName('');
    setWhatsappMessage('');
  };

  // Chat panel height
  const panelHeight = 'h-[420px] sm:h-[460px]';

  return (
    <>
      {/* ============ VERTICAL SIDE TAB ============ */}
      {chatState === 'closed' && (
        <button
          type="button"
          onClick={() => setChatState('open')}
          className="fixed right-0 bottom-6 z-50 bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-2 py-3 px-1.5 rounded-l-lg group"
          aria-label="Chat öffnen"
        >
          <span
            className="font-sans text-[11px] font-bold tracking-[0.12em] uppercase rotate-180"
            style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}
          >
            FRAGEN?
          </span>
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* ============ CHAT PANEL ============ */}
      {chatState !== 'closed' && (
        <div
          className={`fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-[340px] ${panelHeight} flex flex-col bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border/10 overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom`}
          role="dialog"
          aria-label="ZEHN Chat"
        >
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-foreground text-primary-foreground flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                {activeTab === 'chat' ? (
                  <Bot className="w-4 h-4 text-accent-foreground" />
                ) : activeTab === 'whatsapp' ? (
                  <MessageCircle className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Mail className="w-4 h-4 text-accent-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-sans text-body font-semibold text-primary-foreground">
                  {activeTab === 'chat' ? 'ZEHN Assistent' : activeTab === 'whatsapp' ? 'WhatsApp Nachricht' : 'E-Mail senden'}
                </h3>
                {(activeTab === 'email' || activeTab === 'whatsapp' || chatState === 'escalated') && (
                  <p className="font-sans text-[11px] text-primary-foreground/60">
                    {activeTab === 'chat'
                      ? 'Verbunden mit Kundenservice'
                      : activeTab === 'whatsapp'
                      ? 'Direkter WhatsApp Support'
                      : 'Wir antworten innerhalb von 24h'}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatState('closed')}
              className="w-7 h-7 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center transition-colors"
              aria-label="Chat schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ---- Tab Navigation ---- */}
          <div className="flex border-b border-border/10 bg-card flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-sans text-[12px] font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-sans text-[12px] font-medium transition-colors ${
                activeTab === 'whatsapp'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-sans text-[12px] font-medium transition-colors ${
                activeTab === 'email'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              E-Mail
            </button>
          </div>

          {/* ---- Content Area ---- */}
          {activeTab === 'chat' ? (
            <>
              {/* ---- Messages Area ---- */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 bg-card">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {isTyping && <TypingIndicator />}

                {/* Escalation Button */}
                {showEscalation && !isTyping && (
                  <div className="flex justify-center my-3">
                    <button
                      type="button"
                      onClick={handleEscalate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-accent text-accent font-sans text-body font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mit Mitarbeiter sprechen
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ---- Quick Suggestions (only before first user message) ---- */}
              {userMessageCount === 0 && !isTyping && (
                <QuickSuggestions onSelect={handleQuickSuggestion} />
              )}

              {/* ---- Input Area ---- */}
              {chatState !== 'escalated' ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-1.5 px-3 py-2 border-t border-border/10 bg-card flex-shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ihre Frage eingeben..."
                    disabled={isTyping}
                    className="flex-1 px-3 py-2 rounded-full bg-background border border-border/20 font-sans text-[13px] text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Nachricht senden"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              ) : (
                <div className="px-4 py-4 border-t border-border/10 bg-accent/10 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse flex-shrink-0" />
                    <p className="font-sans text-body text-accent">
                      Ein Mitarbeiter wird sich in Kürze bei Ihnen melden. Sie
                      können uns auch direkt unter{' '}
                      <a
                        href="mailto:hello@zehn.store"
                        className="font-semibold underline"
                      >
                        hello@zehn.store
                      </a>{' '}
                      erreichen.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'whatsapp' ? (
            // WhatsApp Form
            <div className="flex-1 overflow-hidden px-3 py-3 bg-card flex flex-col">
              <div className="space-y-2 flex-1 flex flex-col">
                <p className="font-sans text-xs text-foreground/70">
                  Nachricht per WhatsApp senden
                </p>
                
                <div>
                  <label className="font-sans text-[11px] font-medium text-foreground mb-0.5 block">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={whatsappName}
                    onChange={(e) => setWhatsappName(e.target.value)}
                    placeholder="Ihr Name"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border/50 bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="font-sans text-[11px] font-medium text-foreground mb-0.5 block">
                    Nachricht *
                  </label>
                  <textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Ihre Nachricht..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border/50 bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none flex-1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!whatsappMessage.trim()}
                  className="w-full px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] disabled:bg-muted disabled:cursor-not-allowed text-white font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Senden
                </button>

                <p className="font-sans text-[10px] text-foreground/50 text-center">
                  Öffnet WhatsApp
                </p>
              </div>
            </div>
          ) : (
            <div className="contact-chat-widget flex-1 overflow-y-auto">
              <EmailFormPanel />
            </div>
          )}
        </div>
      )}
    </>
  );
}
