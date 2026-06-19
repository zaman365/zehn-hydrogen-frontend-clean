import {useState} from 'react';
import {ChevronDown, HelpCircle} from 'lucide-react';

// ============================================
// FAQ DATA
// ============================================

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'order',
    title: 'Bestellung & Zahlung',
    items: [
      {
        question: 'Wie kann ich eine Bestellung aufgeben?',
        answer:
          'Wählen Sie Ihre gewünschten Artikel aus, legen Sie sie in den Warenkorb und folgen Sie dem Bestellprozess. Sie können als Gast oder mit einem ZEHN-Konto bestellen.',
      },
      {
        question: 'Welche Zahlungsmethoden werden akzeptiert?',
        answer:
          'Wir akzeptieren Visa, Mastercard, American Express, PayPal, Klarna (Rechnung, Ratenzahlung, Sofortzahlung), Apple Pay, Google Pay und SEPA-Lastschrift.',
      },
      {
        question: 'Kann ich meine Bestellung nachträglich ändern oder stornieren?',
        answer:
          'Solange Ihre Bestellung noch nicht versandt wurde, können Sie sie über Ihr Kundenkonto stornieren. Für Änderungen kontaktieren Sie bitte unseren Kundenservice so schnell wie möglich.',
      },
      {
        question: 'Wo finde ich meine Rechnung?',
        answer:
          'Ihre Rechnung wird Ihnen per E-Mail zugesandt und ist auch in Ihrem Kundenkonto unter „Meine Bestellungen" verfügbar.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Versand & Lieferung',
    items: [
      {
        question: 'Wie lange dauert die Lieferung?',
        answer:
          'Standardversand innerhalb Deutschlands dauert 2–4 Werktage. Expressversand ist in 1–2 Werktagen möglich. Internationale Lieferungen dauern je nach Zielland 4–14 Werktage.',
      },
      {
        question: 'Wie hoch sind die Versandkosten?',
        answer:
          'Standardversand kostet 4,95€ und ist ab einem Bestellwert von 50€ kostenlos. Expressversand kostet 9,95€. ZEHN Club-Mitglieder erhalten immer kostenlosen Standardversand.',
      },
      {
        question: 'Kann ich meine Bestellung verfolgen?',
        answer:
          'Ja, nach dem Versand erhalten Sie eine E-Mail mit einem Tracking-Link. Sie können den Status auch jederzeit in Ihrem Kundenkonto unter „Meine Bestellungen" einsehen.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Retouren & Umtausch',
    items: [
      {
        question: 'Wie kann ich einen Artikel zurücksenden?',
        answer:
          'Nutzen Sie das beigelegte Retourenlabel oder erstellen Sie ein neues Label in Ihrem Kundenkonto. Die Rücksendung ist innerhalb von 30 Tagen kostenlos.',
      },
      {
        question: 'Wann erhalte ich meine Rückerstattung?',
        answer:
          'Nach Eingang und Prüfung Ihrer Retoure erstatten wir den Betrag innerhalb von 5–7 Werktagen auf Ihr ursprüngliches Zahlungsmittel zurück.',
      },
      {
        question: 'Kann ich einen Artikel umtauschen?',
        answer:
          'Ein direkter Umtausch ist derzeit nicht möglich. Bitte senden Sie den Artikel zurück und bestellen Sie die gewünschte Alternative neu.',
      },
      {
        question: 'Was passiert, wenn mein Artikel beschädigt ankommt?',
        answer:
          'Kontaktieren Sie bitte sofort unseren Kundenservice mit Fotos des beschädigten Artikels. Wir kümmern uns umgehend um einen Ersatz oder eine Rückerstattung.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Produkte & Pflege',
    items: [
      {
        question: 'Wie finde ich die richtige Größe?',
        answer:
          'Nutzen Sie unseren Fitguide für detaillierte Maßtabellen und Passform-Empfehlungen. Unser Kundenservice berät Sie auch gerne persönlich.',
      },
      {
        question: 'Wie pflege ich meine ZEHN-Kleidung richtig?',
        answer:
          'Detaillierte Pflegehinweise finden Sie auf unserer Stoffpflege-Seite und auf dem Etikett jedes Kleidungsstücks. Grundsätzlich empfehlen wir Waschen bei niedrigen Temperaturen.',
      },
      {
        question: 'Sind die Materialien nachhaltig?',
        answer:
          'Ja, wir verwenden ausschließlich zertifizierte und nachhaltig gewonnene Materialien wie Bio-Baumwolle, recyceltes Polyester und Tencel™.',
      },
    ],
  },
  {
    id: 'club',
    title: 'ZEHN Club',
    items: [
      {
        question: 'Was ist der ZEHN Club?',
        answer:
          'Der ZEHN Club ist unser kostenloses Mitgliedschaftsprogramm mit exklusiven Vorteilen wie Early Access, 10% Willkommensrabatt, kostenlosem Versand und Einladungen zu Events.',
      },
      {
        question: 'Wie werde ich Mitglied?',
        answer:
          'Registrieren Sie sich einfach mit Ihrer E-Mail-Adresse — die Mitgliedschaft ist kostenlos. Ab der ersten Bestellung genießen Sie alle Member-Vorteile.',
      },
      {
        question: 'Welche Club-Stufen gibt es?',
        answer:
          'Es gibt drei Stufen: Member (ab 1. Bestellung), Insider (ab 3 Bestellungen) und Icon (ab 10 Bestellungen). Mit jeder Stufe steigen Ihre exklusiven Vorteile.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Konto & Sicherheit',
    items: [
      {
        question: 'Wie erstelle ich ein Kundenkonto?',
        answer:
          'Klicken Sie auf „Anmelden" in der oberen Navigation und wählen Sie „Konto erstellen". Alternativ können Sie während des Bestellvorgangs ein Konto anlegen.',
      },
      {
        question: 'Ich habe mein Passwort vergessen — was nun?',
        answer:
          'Klicken Sie auf der Login-Seite auf „Passwort vergessen". Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts per E-Mail.',
      },
      {
        question: 'Wie werden meine Daten geschützt?',
        answer:
          'Alle Daten werden über verschlüsselte SSL-Verbindungen übertragen. Wir speichern keine Zahlungsdaten auf unseren Servern. Weitere Details finden Sie in unserer Datenschutzerklärung.',
      },
    ],
  },
];

// ============================================
// SUB-COMPONENTS
// ============================================

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-sans text-body-lg text-foreground font-medium group-hover:text-accent transition-colors">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-secondary flex-shrink-0 mt-0.5 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="font-sans text-body lg:text-body-lg text-foreground/70 leading-relaxed pr-8">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

function FAQCategorySection({
  category,
  isExpanded,
  onToggleCategory,
  openQuestionId,
  onToggleQuestion,
}: {
  category: FAQCategory;
  isExpanded: boolean;
  onToggleCategory: () => void;
  openQuestionId: string | null;
  onToggleQuestion: (questionId: string) => void;
}) {
  return (
    <div className="bg-card border border-border/10 rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-md">
      {/* Category Header */}
      <button
        type="button"
        onClick={onToggleCategory}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 bg-card hover:bg-background/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <h3 className="font-sans text-h3 text-foreground tracking-tight-2">
          {category.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-sans text-body text-secondary">
            {category.items.length} Fragen
          </span>
          <ChevronDown
            className={`w-5 h-5 text-secondary transition-transform duration-300 ${
              isExpanded ? 'rotate-180 text-accent' : ''
            }`}
          />
        </div>
      </button>

      {/* Questions List */}
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-2 border-t border-border/10">
          {category.items.map((item, idx) => {
            const questionId = `${category.id}-${idx}`;
            return (
              <FAQAccordionItem
                key={questionId}
                item={item}
                isOpen={openQuestionId === questionId}
                onToggle={() => onToggleQuestion(questionId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function ContactFAQ() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    FAQ_CATEGORIES[0]?.id ?? null
  );
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    // Reset open question when switching categories
    setOpenQuestion(null);
  };

  const handleToggleQuestion = (questionId: string) => {
    setOpenQuestion((prev) => (prev === questionId ? null : questionId));
  };

  return (
    <section id="faq" className="scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="font-sans text-h2 sm:text-h2-sm text-foreground">
            Häufige Fragen
          </h2>
          <p className="font-sans text-body text-secondary mt-0.5">
            Schnelle Antworten auf die wichtigsten Fragen
          </p>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-3">
        {FAQ_CATEGORIES.map((category) => (
          <FAQCategorySection
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggleCategory={() => handleToggleCategory(category.id)}
            openQuestionId={openQuestion}
            onToggleQuestion={handleToggleQuestion}
          />
        ))}
      </div>
    </section>
  );
}
