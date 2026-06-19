/**
 * Static Page Content Data Map
 *
 * Placeholder content for all footer-linked pages. These are rendered
 * when the corresponding Shopify CMS page doesn't exist yet.
 * Once a page is published in Shopify, it automatically takes precedence.
 *
 * All content is in German to match the ZEHN brand language.
 */

// ============================================
// TYPES
// ============================================

export interface StaticPageSection {
  /** Section heading */
  heading: string;
  /** Body content — supports simple HTML for formatting */
  body: string;
}

export interface StaticPageData {
  /** Page handle — must match the URL slug */
  handle: string;
  /** Page title (displayed as H1) */
  title: string;
  /** Subtitle / tagline below the title */
  subtitle: string;
  /** SEO meta title */
  seoTitle: string;
  /** SEO meta description */
  seoDescription: string;
  /** Page category for breadcrumb styling */
  category: 'legal' | 'about' | 'service';
  /** Content sections */
  sections: StaticPageSection[];
  /** Layout metadata for per-page visual variants */
  layout?: {
    /** Layout variant identifier */
    variant?: string;
    /** Hero visual style */
    heroStyle?: 'dark' | 'light' | 'gradient' | 'minimal' | 'split';
    /** Section rendering style */
    sectionStyle?: 'cards' | 'alternating' | 'flat' | 'steps' | 'numbered-clauses' | 'timeline' | 'accordion';
    /** Lucide icon name */
    icon?: string;
  };
}

// ============================================
// CONTENT MAP
// ============================================

const STATIC_PAGES: Record<string, StaticPageData> = {};

// ------------------------------------------
// a) LEGAL (Rechtliches)
// ------------------------------------------

STATIC_PAGES['terms'] = {
  handle: 'terms',
  title: 'Allgemeine Geschäftsbedingungen',
  subtitle: 'AGB für den Online-Shop ZEHN',
  seoTitle: 'AGB – Geschäftsbedingungen',
  seoDescription: 'Allgemeine Geschäftsbedingungen für den ZEHN Online-Shop. Informationen zu Bestellung, Lieferung, Zahlung und Widerruf.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'numbered-clauses', icon: 'Scale'},
  sections: [
    {
      heading: 'Stand: Januar 2026',
      body: 'Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Bestellungen, die Verbraucher über den Online-Shop der Marke ZEHN tätigen.',
    },
    {
      heading: 'Anbieter und Vertragspartner',
      body: 'Der Kaufvertrag kommt zustande mit:\nVINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland\nRegistergericht: Amtsgericht Chemnitz\nHandelsregister: HRB 36403\nUSt-ID: DE343868243\nE-Mail: info@zehnfashion.de\nTelefon: +49 163 4210324\nDer Anbieter betreibt den Online-Shop für Bekleidung und Accessoires der Marke ZEHN.',
    },
    {
      heading: 'Geltungsbereich',
      body: 'Diese AGB gelten für alle Bestellungen über unseren Online-Shop durch Verbraucher (§ 13 BGB).\nVerbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können.\nAbweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.',
    },
    {
      heading: 'Vertragsschluss',
      body: 'Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.\nDurch Anklicken des Buttons „Zahlungspflichtig bestellen" geben Sie ein verbindliches Angebot zum Kauf der im Warenkorb enthaltenen Waren ab.\nDie Bestätigung des Eingangs der Bestellung erfolgt automatisch per E-Mail unmittelbar nach dem Absenden der Bestellung und stellt noch keine Vertragsannahme dar.\nDer Kaufvertrag kommt zustande, sobald wir:\neine separate Auftragsbestätigung per E-Mail versenden oder\ndie Ware an Sie versenden.',
    },
    {
      heading: 'Preise und Versandkosten',
      body: 'Alle Preise sind in Euro (€) angegeben und enthalten die gesetzliche Mehrwertsteuer.\nZusätzlich zu den angegebenen Preisen können Versandkosten anfallen. Diese werden im Bestellprozess deutlich angezeigt.\nBei Lieferungen außerhalb der Europäischen Union können zusätzliche Zölle, Steuern oder Gebühren entstehen, die vom Kunden zu tragen sind.',
    },
    {
      heading: 'Zahlungsbedingungen',
      body: 'In unserem Online-Shop stehen Ihnen grundsätzlich folgende Zahlungsarten zur Verfügung:\nA. Sofortige Zahlungsarten\neWallets: PayPal, Apple Pay, Google Pay, Amazon Pay.\nKarten: Kreditkarte (Visa, Mastercard, American Express).\nDirekt-Überweisung: Sofortüberweisung (Klarna), Giropay.\n\nB. Bankbasierte Zahlungsarten\nVorkasse: Der Rechnungsbetrag ist unmittelbar nach Vertragsschluss zu überweisen. Der Versand erfolgt nach Zahlungseingang.\nSEPA-Lastschrift: Der Einzug erfolgt nach Abschluss der Bestellung.\n\nC. Zahlung nach Lieferung (Klarna)\nKauf auf Rechnung (Direkt): Sie überweisen den Rechnungsbetrag nach Erhalt der Ware innerhalb von 14 Tagen auf das in der Rechnung angegebene Bankkonto der VINCET GmbH. Wir behalten uns vor, diese Zahlungsart erst nach einer erfolgreichen Bonitätsprüfung freizuschalten.\nKauf auf Rechnung / Ratenkauf: In Zusammenarbeit mit der Klarna Bank AB. Die Zahlung erfolgt direkt an Klarna. Diese Zahlungsart kann eine Bonitätsprüfung voraussetzen.\n\nHinweis: Nicht alle Zahlungsarten stehen in jedem Land zur Verfügung.',
    },
    {
      heading: 'Lieferung und Versand',
      body: 'Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse.\nRegellieferzeiten:\nDeutschland: 2–5 Werktage\nEU: 3–8 Werktage\nSollte ein Produkt nicht verfügbar sein, informieren wir Sie unverzüglich.\nTeillieferungen sind zulässig, sofern dies für den Kunden zumutbar ist.\nDer Versand erfolgt über Dienstleister wie DHL, DPD, UPS, Hermes oder vergleichbare Anbieter.',
    },
    {
      heading: 'Eigentumsvorbehalt',
      body: 'Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.',
    },
    {
      heading: 'Gesetzliches Widerrufsrecht',
      body: 'Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen zu. Die vollständige Widerrufsbelehrung sowie das Muster-Widerrufsformular sind auf einer separaten Seite unseres Online-Shops abrufbar und werden Ihnen in Textform zugesandt.',
    },
    {
      heading: 'Freiwilliges Rückgaberecht (30 Tage)',
      body: 'Zusätzlich zum gesetzlichen Widerrufsrecht gewähren wir Ihnen ein freiwilliges Rückgaberecht von insgesamt 30 Tagen ab Warenerhalt.\nBedingungen: Die Ware muss ungetragen, ungewaschen, mit originalen Etiketten und in einwandfreiem Zustand zurückgesendet werden.\nKosten: Der Kunde trägt die unmittelbaren Kosten der Rücksendung, sofern im Shop (z.B. im Rahmen von Aktionen) nichts anderes angegeben ist.\nErstattung: Rückerstattungen erfolgen über die ursprünglich verwendete Zahlungsmethode.\nHinweis: Ihr gesetzliches Widerrufsrecht bleibt von diesem freiwilligen Rückgaberecht unberührt.',
    },
    {
      heading: 'Gewährleistung',
      body: 'Es gelten die gesetzlichen Gewährleistungsrechte gemäß §§ 434 ff. BGB. Im Falle eines Mangels hat der Kunde Anspruch auf Nacherfüllung, Minderung oder Rücktritt vom Vertrag gemäß den gesetzlichen Vorschriften.',
    },
    {
      heading: 'Haftung',
      body: 'Wir haften uneingeschränkt bei Vorsatz und grober Fahrlässigkeit.\nBei einfacher Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten).\nUnberührt bleibt die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie die Haftung nach dem Produkthaftungsgesetz.',
    },
    {
      heading: 'Produktdarstellung',
      body: 'Produktbilder dienen der Illustration; Farbabweichungen aufgrund unterschiedlicher Bildschirmeinstellungen sind möglich.\nMaß- und Größenangaben können geringfügige produktionsbedingte Abweichungen aufweisen.',
    },
    {
      heading: 'Urheber- und Markenrechte',
      body: 'Alle Inhalte dieser Website (Logos, Texte, Bilder, Designs) sind urheber- und markenrechtlich geschützt. Eine Verwendung ohne ausdrückliche schriftliche Zustimmung der VINCET GmbH / ZEHN ist untersagt.',
    },
    {
      heading: 'Online-Streitbeilegung (EU ODR)',
      body: 'Die EU-Kommission bietet eine Plattform zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr. Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle weder verpflichtet noch bereit.',
    },
    {
      heading: 'Schlussbestimmungen',
      body: 'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.\nSollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (Salvatorische Klausel).',
    },
  ],
};

STATIC_PAGES['privacy'] = {
  handle: 'privacy',
  title: 'Datenschutz',
  subtitle: 'Datenschutzerklärung',
  seoTitle: 'Datenschutzerklärung',
  seoDescription: 'Erfahren Sie, wie ZEHN Ihre personenbezogenen Daten schützt und verarbeitet. Transparenz und Sicherheit stehen bei uns an erster Stelle.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'alternating', icon: 'Shield'},
  sections: [
    {
      heading: '1. Einleitung',
      body: 'Wir freuen uns über Ihr Interesse an unserem Online-Shop. Der Schutz Ihrer personenbezogenen Daten hat für uns höchste Priorität.\nDie Verarbeitung Ihrer Daten erfolgt auf Grundlage der Datenschutz-Grundverordnung (DSGVO) sowie der einschlägigen nationalen Datenschutzbestimmungen.\nDiese Datenschutzerklärung informiert Sie darüber:\nwelche personenbezogenen Daten wir erheben\nwie wir diese Daten verwenden\nwelche Rechte Sie in Bezug auf Ihre Daten haben',
    },
    {
      heading: '2. Verantwortlicher',
      body: 'Verantwortlicher für die Datenverarbeitung auf dieser Website ist:\nVINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland\nGeschäftsführerin: Faria Jarin\nTelefon: +49 163 4210324\nE-Mail: info@zehnfashion.de\nWebsite: https://www.zehnfashion.de',
    },
    {
      heading: '3. Hosting und Website-Plattform (Shopify)',
      body: 'Unsere Website wird über die Plattform Shopify Inc. betrieben.\nShopify Inc.\n151 O\'Connor Street\nOttawa, ON K2P 2L8\nKanada\nShopify stellt die E-Commerce-Plattform bereit, über die wir unsere Produkte und Dienstleistungen anbieten.\nDabei können folgende Daten verarbeitet werden:\nIP-Adresse\nBrowserinformationen\nGerätedaten\nBestellinformationen\nZahlungsdaten\nKundenkontodaten\nDie Verarbeitung erfolgt zur Bereitstellung und sicheren Nutzung unseres Online-Shops.\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)\nArt. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)\nWeitere Informationen:\nhttps://www.shopify.com/legal/privacy',
    },
    {
      heading: '4. Zugriffsdaten und Server-Logfiles',
      body: 'Beim Besuch unserer Website werden automatisch Informationen erfasst:\nIP-Adresse\nDatum und Uhrzeit des Zugriffs\nBrowsertyp und Version\nBetriebssystem\nReferrer URL\nHostname des zugreifenden Rechners\nDiese Daten werden ausschließlich zur Sicherstellung des störungsfreien Betriebs der Website verwendet.\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. f DSGVO',
    },
    {
      heading: '5. Bestellungen und Kundenkonto',
      body: 'Wenn Sie eine Bestellung aufgeben oder ein Kundenkonto erstellen, verarbeiten wir folgende Daten:\nName\nAdresse\nE-Mail-Adresse\nTelefonnummer\nZahlungsinformationen\nBestellhistorie\nDie Verarbeitung erfolgt zur:\nVertragsabwicklung\nLieferung der Waren\nZahlungsabwicklung\nKundenkommunikation\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. b DSGVO',
    },
    {
      heading: '6. Zahlungsanbieter',
      body: 'Zur Abwicklung von Zahlungen können folgende Zahlungsdienstleister eingesetzt werden:\nPayPal\nPayPal (Europe) S.à r.l. et Cie, S.C.A.\n22–24 Boulevard Royal\n2449 Luxemburg\nKlarna\nKlarna Bank AB\nSveavägen 46\n11134 Stockholm\nSchweden\nKreditkartenanbieter\nVisa, Mastercard oder andere Kreditkartenanbieter können zur Zahlungsabwicklung eingesetzt werden.\nWeitere Zahlungsarten\nApple Pay\nGoogle Pay\nAmazon Pay\nGiropay\nSofortüberweisung\nDie Zahlungsdaten werden direkt von den jeweiligen Zahlungsdienstleistern verarbeitet.',
    },
    {
      heading: '7. Versanddienstleister',
      body: 'Zur Lieferung Ihrer Bestellung können folgende Versanddienstleister eingesetzt werden:\nDHL\nDPD\nUPS\nHermes\nDabei werden nur die für die Lieferung erforderlichen Daten übermittelt:\nName\nLieferadresse\nggf. E-Mail oder Telefonnummer',
    },
    {
      heading: '8. Cookies und Consent-Management',
      body: 'Unsere Website verwendet Cookies.\nCookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.\nWir verwenden Cookies für:\ndie technische Funktionalität des Shops\ndie Speicherung des Warenkorbs\nAnalysezwecke\nMarketingzwecke\nBeim ersten Besuch unserer Website können Sie über ein Cookie-Consent-Banner entscheiden, welche Cookies gesetzt werden dürfen.\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
    },
    {
      heading: '9. Google Tag Manager',
      body: 'Diese Website nutzt Google Tag Manager.\nAnbieter:\nGoogle Ireland Limited\nGordon House\nBarrow Street\nDublin 4\nIrland\nDer Google Tag Manager selbst speichert keine personenbezogenen Daten, ermöglicht jedoch die Integration weiterer Tracking-Tools.',
    },
    {
      heading: '10. Google Analytics',
      body: 'Unsere Website nutzt Google Analytics, einen Webanalysedienst von Google.\nGoogle Analytics verwendet Cookies, um Informationen über die Nutzung unserer Website zu sammeln.\nDabei können folgende Daten verarbeitet werden:\nIP-Adresse (anonymisiert)\nSeitenaufrufe\nVerweildauer\nInteraktionen auf der Website\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
    },
    {
      heading: '11. Meta Pixel (Facebook / Instagram)',
      body: 'Wir verwenden das Meta Pixel von:\nMeta Platforms Ireland Ltd.\n4 Grand Canal Square\nDublin 2\nIrland\nDas Meta Pixel ermöglicht uns:\ndie Analyse des Nutzerverhaltens\ndie Optimierung von Werbekampagnen\ndas Retargeting von Websitebesuchern\nDabei können Daten an Meta übermittelt werden.',
    },
    {
      heading: '12. TikTok Pixel',
      body: 'Unsere Website nutzt den TikTok Pixel.\nAnbieter:\nTikTok Technology Limited\n10 Earlsfort Terrace\nDublin\nIrland\nDer TikTok Pixel dient zur:\nAnalyse der Website-Nutzung\nOptimierung von Werbekampagnen\nConversion-Tracking',
    },
    {
      heading: '13. Newsletter (Klaviyo)',
      body: 'Für den Versand unseres Newsletters verwenden wir Klaviyo.\nAnbieter:\nKlaviyo Inc.\n225 Franklin St\nBoston, MA\nUSA\nWenn Sie unseren Newsletter abonnieren, verarbeiten wir:\nIhre E-Mail-Adresse\nggf. Ihren Namen\nInformationen über Ihr Nutzerverhalten\nDie Anmeldung erfolgt über ein Double-Opt-In Verfahren.\nSie können den Newsletter jederzeit über den Abmeldelink abbestellen.',
    },
    {
      heading: '14. Social Media Präsenzen',
      body: 'Wir betreiben Social-Media-Präsenzen auf Plattformen wie:\nInstagram\nFacebook\nTikTok\nBeim Besuch unserer Social-Media-Seiten gelten die Datenschutzrichtlinien der jeweiligen Anbieter.',
    },
    {
      heading: '15. Speicherdauer',
      body: 'Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist.\nGesetzliche Aufbewahrungsfristen ergeben sich insbesondere aus:\nHandelsgesetzbuch (HGB)\nAbgabenordnung (AO)',
    },
    {
      heading: '16. Ihre Rechte als betroffene Person',
      body: 'Sie haben folgende Rechte gemäß DSGVO:\nRecht auf Auskunft (Art. 15 DSGVO)\nRecht auf Berichtigung (Art. 16 DSGVO)\nRecht auf Löschung (Art. 17 DSGVO)\nRecht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)\nRecht auf Datenübertragbarkeit (Art. 20 DSGVO)\nRecht auf Widerspruch (Art. 21 DSGVO)',
    },
    {
      heading: '17. Beschwerderecht bei einer Aufsichtsbehörde',
      body: 'Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.\nZuständige Aufsichtsbehörde kann sein:\nDer Sächsische Datenschutzbeauftragte',
    },
    {
      heading: '18. SSL-Verschlüsselung',
      body: 'Unsere Website verwendet eine SSL- bzw. TLS-Verschlüsselung, um übertragene Daten zu schützen.',
    },
    {
      heading: '19. Änderungen dieser Datenschutzerklärung',
      body: 'Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn rechtliche oder technische Änderungen dies erforderlich machen.',
    },
  ],
};

STATIC_PAGES['cookies'] = {
  handle: 'cookies',
  title: 'Cookie-Richtlinie',
  subtitle: 'Informationen zur Verwendung von Cookies',
  seoTitle: 'Cookie-Richtlinie',
  seoDescription: 'Informationen über die Verwendung von Cookies auf der ZEHN-Website. Erfahren Sie, welche Cookies wir nutzen und wie Sie Ihre Einstellungen verwalten können.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'cards', icon: 'Cookie'},
  sections: [
    {
      heading: '1. Einleitung',
      body: 'Diese Cookie-Richtlinie erläutert, wie die VINCET GmbH (nachfolgend „ZEHN", „wir" oder „uns") Cookies und ähnliche Technologien auf unserer Website verwendet.\nCookies helfen uns dabei, die Funktionalität unserer Website sicherzustellen, die Benutzererfahrung zu verbessern und unsere Marketingmaßnahmen zu optimieren.\nBeim ersten Besuch unserer Website können Sie über ein Cookie-Consent-Banner entscheiden, welche Cookies gesetzt werden dürfen.',
    },
    {
      heading: '2. Was sind Cookies?',
      body: 'Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden, wenn Sie eine Website besuchen.\nSie enthalten Informationen wie:\nIhre bevorzugten Einstellungen\nLogin-Informationen\nWarenkorb-Inhalte\nNutzungsstatistiken\nCookies können entweder temporär (Session-Cookies) oder dauerhaft (Persistent Cookies) gespeichert werden.',
    },
    {
      heading: '3. Arten von Cookies',
      body: 'Unsere Website verwendet folgende Arten von Cookies:\nTechnisch notwendige Cookies\nDiese Cookies sind erforderlich, damit unsere Website korrekt funktioniert.\nSie ermöglichen beispielsweise:\nden Betrieb des Online-Shops\ndie Speicherung des Warenkorbs\nden Login in Kundenkonten\nsichere Zahlungen\nDiese Cookies können nicht deaktiviert werden.\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. f DSGVO\n\nAnalyse-Cookies\nDiese Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen.\nSie sammeln Informationen wie:\nAnzahl der Besucher\nbesuchte Seiten\nVerweildauer\nKlickverhalten\nDiese Daten helfen uns, unsere Website zu verbessern.\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. a DSGVO (Einwilligung)\n\nMarketing- und Tracking-Cookies\nDiese Cookies werden verwendet, um personalisierte Werbung anzuzeigen.\nSie ermöglichen:\nRetargeting\nConversion-Tracking\npersonalisierte Anzeigen\nRechtsgrundlage:\nArt. 6 Abs. 1 lit. a DSGVO (Einwilligung)',
    },
    {
      heading: '4. Cookies unseres Shopify-Shops',
      body: 'Unsere Website wird über die Plattform Shopify betrieben.\nShopify verwendet Cookies zur:\nSpeicherung des Warenkorbs\nDurchführung des Checkout-Prozesses\nVerwaltung von Kundenkonten\nBetrugsprävention\nTypische Shopify-Cookies können sein:\n_shopify_y\n_shopify_s\n_shopify_sa_p\n_shopify_sa_t\ncart\ncart_sig\ncheckout_token\nWeitere Informationen:\nhttps://www.shopify.com/legal/cookies',
    },
    {
      heading: '5. Google Tag Manager',
      body: 'Wir verwenden Google Tag Manager, um Tracking-Tools zentral zu verwalten.\nAnbieter:\nGoogle Ireland Limited\nGordon House\nBarrow Street\nDublin 4\nIrland\nGoogle Tag Manager selbst speichert keine personenbezogenen Daten, kann jedoch andere Tracking-Dienste aktivieren.',
    },
    {
      heading: '6. Google Analytics',
      body: 'Diese Website verwendet Google Analytics zur Analyse der Nutzung unserer Website.\nAnbieter:\nGoogle Ireland Limited\nDublin\nIrland\nGoogle Analytics verwendet Cookies zur Analyse der Website-Nutzung.\nDie IP-Adresse wird anonymisiert.',
    },
    {
      heading: '7. Meta Pixel (Facebook / Instagram)',
      body: 'Wir verwenden das Meta Pixel, um:\ndie Effektivität unserer Werbung zu messen\nNutzerverhalten zu analysieren\nRetargeting-Kampagnen durchzuführen\nAnbieter:\nMeta Platforms Ireland Ltd.\nDublin\nIrland',
    },
    {
      heading: '8. TikTok Pixel',
      body: 'Unsere Website verwendet den TikTok Pixel.\nDieser ermöglicht:\nConversion-Tracking\nAnalyse von Marketingkampagnen\nRetargeting\nAnbieter:\nTikTok Technology Limited\nDublin\nIrland',
    },
    {
      heading: '9. Klaviyo (Newsletter und Marketing-Automation)',
      body: 'Wir verwenden Klaviyo, um Newsletter zu versenden und Marketingkampagnen zu analysieren.\nAnbieter:\nKlaviyo Inc.\nBoston\nUSA\nKlaviyo kann Cookies einsetzen, um:\nNewsletter-Performance zu analysieren\nNutzerinteraktionen zu messen',
    },
    {
      heading: '10. Speicherdauer von Cookies',
      body: 'Cookies werden unterschiedlich lange gespeichert:\nSession-Cookies: werden gelöscht, wenn Sie Ihren Browser schließen\nPersistente Cookies: bleiben für eine bestimmte Zeit gespeichert\nDie Speicherdauer hängt vom jeweiligen Cookie ab.',
    },
    {
      heading: '11. Cookie-Einstellungen ändern',
      body: 'Sie können Ihre Cookie-Einstellungen jederzeit ändern:\nüber das Cookie-Banner\nüber die Einstellungen Ihres Browsers\nSie können Cookies auch vollständig blockieren.\nBitte beachten Sie jedoch, dass dadurch Funktionen unserer Website eingeschränkt sein können.',
    },
    {
      heading: '12. Ihre Rechte',
      body: 'Sie haben gemäß DSGVO folgende Rechte:\nRecht auf Auskunft\nRecht auf Berichtigung\nRecht auf Löschung\nRecht auf Einschränkung der Verarbeitung\nRecht auf Datenübertragbarkeit\nRecht auf Widerruf Ihrer Einwilligung',
    },
    {
      heading: '13. Kontakt',
      body: 'Bei Fragen zum Datenschutz oder zu Cookies können Sie uns jederzeit kontaktieren:\nVINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland\nE-Mail: info@zehnfashion.de',
    },
  ],
};

STATIC_PAGES['impressum'] = {
  handle: 'impressum',
  title: 'Impressum',
  subtitle: 'Angaben gemäß § 5 TMG',
  seoTitle: 'Impressum – Rechtliche Angaben',
  seoDescription: 'Impressum der VINCET GmbH. Rechtliche Pflichtangaben gemäß § 5 TMG.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'flat', icon: 'Building2'},
  sections: [
    {
      heading: 'Angaben gemäß § 5 TMG',
      body: 'VINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland',
    },
    {
      heading: 'Vertreten durch',
      body: 'Geschäftsführerin: Faria Jarin',
    },
    {
      heading: 'Kontakt',
      body: 'Telefon: +49 163 4210324\nE-Mail: info@zehnfashion.de\nWebsite: https://www.zehnfashion.de',
    },
    {
      heading: 'Registereintrag',
      body: 'Eintragung im Handelsregister.\nRegistergericht: Amtsgericht Chemnitz\nRegisternummer: HRB 36403',
    },
    {
      heading: 'Umsatzsteuer-ID',
      body: 'Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\nDE343868243',
    },
    {
      heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      body: 'Faria Jarin\nVINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland',
    },
    {
      heading: 'Verbraucherstreitbeilegung',
      body: 'Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    },
  ],
};

STATIC_PAGES['widerruf'] = {
  handle: 'widerruf',
  title: 'Widerrufsbelehrung',
  subtitle: 'Ihr Recht auf Widerruf',
  seoTitle: 'Widerrufsbelehrung – Widerrufsrecht',
  seoDescription: 'Informationen zu Ihrem Widerrufsrecht bei ZEHN. Widerrufen Sie Ihre Bestellung innerhalb von 14 Tagen ohne Angabe von Gründen.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'numbered-clauses', icon: 'RefreshCw'},
  sections: [
    {
      heading: 'Widerrufsrecht',
      body: 'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.\n\nDie Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben.\n\nUm Ihr Widerrufsrecht auszuüben, müssen Sie uns\n\nVINCET GmbH\nFriedrich-Engels-Str. 23\n09337 Hohenstein-Ernstthal\nDeutschland\nTelefon: +49 163 4210324\nE-Mail: info@zehnfashion.de\n\nmittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss informieren, diesen Vertrag zu widerrufen.\n\nSie können dafür das untenstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.\n\nZur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
    },
    {
      heading: 'Folgen des Widerrufs',
      body: 'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme zusätzlicher Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.\n\nFür diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart.\n\nIn keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.\n\nWir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben.',
    },
    {
      heading: 'Rücksendung der Waren',
      body: 'Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben.\n\nDie Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.',
    },
    {
      heading: 'Kosten der Rücksendung',
      body: 'Deutschland:\nDie Rücksendung ist kostenlos.\n\nEuropäische Union:\nFür Rücksendungen aus anderen EU-Ländern berechnen wir eine Rücksendegebühr von 6,99 €, die von der Rückerstattung abgezogen wird.',
    },
    {
      heading: 'Wertersatz',
      body: 'Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.',
    },
  ],
};

// ------------------------------------------
// b) ABOUT ZEHN (Über ZEHN)
// ------------------------------------------

STATIC_PAGES['about'] = {
  handle: 'about',
  title: 'Unsere Geschichte',
  subtitle: 'Wie aus einer Idee eine Bewegung wurde',
  seoTitle: 'Über ZEHN – Unsere Geschichte',
  seoDescription: 'Erfahren Sie die Geschichte hinter ZEHN. Wie eine Vision für kompromisslose Männermode zur Realität wurde.',
  category: 'about',
  layout: {heroStyle: 'dark', sectionStyle: 'timeline', icon: 'History'},
  sections: [
    {
      heading: 'Die Vision',
      body: 'ZEHN wurde aus der Überzeugung geboren, dass Männermode mehr sein kann — mehr als Trends, mehr als Fast Fashion, mehr als Kompromisse. Wir glauben an Kleidung, die so präzise und durchdacht ist wie die Männer, die sie tragen. Jedes Stück wird mit der Sorgfalt eines Ingenieurs und dem Auge eines Designers entwickelt.',
    },
    {
      heading: 'Unsere Anfänge',
      body: 'Gegründet in Berlin, im Herzen der europäischen Design-Metropole, startete ZEHN als kleines Atelier mit einer großen Ambition: die perfekte Verbindung von Funktion, Material und Form zu schaffen. Der Name ZEHN steht für unsere Philosophie — die Suche nach der perfekten 10 in jedem Detail.',
    },
    {
      heading: 'Handwerk trifft Innovation',
      body: 'Wir arbeiten mit den besten Stoffmanufakturen Europas zusammen und verbinden traditionelle Handwerkskunst mit modernster Textiltechnologie. Jede Naht, jeder Schnitt, jedes Material wird sorgfältig ausgewählt und getestet. Das Ergebnis: Kleidung, die nicht nur gut aussieht, sondern sich auch nach Jahren wie am ersten Tag anfühlt.',
    },
    {
      heading: 'Die Zukunft',
      body: 'Unsere Reise hat gerade erst begonnen. Mit jedem neuen Stück, jeder neuen Kollektion und jeder neuen Innovation arbeiten wir daran, die Grenzen der Männermode neu zu definieren. Denn bei ZEHN ist Stillstand keine Option — nur ständige Verbesserung.',
    },
  ],
};

STATIC_PAGES['sustainability'] = {
  handle: 'sustainability',
  title: 'Nachhaltigkeit',
  subtitle: 'Verantwortung ist kein Trend — sie ist unser Standard',
  seoTitle: 'Nachhaltigkeit bei ZEHN',
  seoDescription: 'Erfahren Sie, wie ZEHN nachhaltige Mode produziert. Von zertifizierten Materialien bis zu fairen Produktionsbedingungen.',
  category: 'about',
  layout: {heroStyle: 'gradient', sectionStyle: 'alternating', icon: 'Leaf'},
  sections: [
    {
      heading: 'Unser Versprechen',
      body: 'Bei ZEHN ist Nachhaltigkeit keine Marketingstrategie — sie ist eine Grundüberzeugung. Wir gestalten jedes Produkt mit dem Ziel, die Umweltbelastung zu minimieren, ohne Kompromisse bei Qualität oder Design einzugehen. Weniger produzieren, besser produzieren, länger tragen.',
    },
    {
      heading: 'Materialien',
      body: 'Wir verwenden ausschließlich zertifizierte und nachhaltig gewonnene Materialien. Bio-Baumwolle, recyceltes Polyester, Tencel™ und verantwortungsvoll gewonnene Wolle bilden die Grundlage unserer Kollektionen. Jeder Stoff wird auf seine Umweltverträglichkeit geprüft, bevor er in unsere Produktion aufgenommen wird.',
    },
    {
      heading: 'Produktion',
      body: 'Unsere Produktionspartner werden sorgfältig ausgewählt und regelmäßig auditiert. Faire Löhne, sichere Arbeitsbedingungen und transparente Lieferketten sind für uns nicht verhandelbar. Wir produzieren in kleinen Chargen, um Überproduktion zu vermeiden.',
    },
    {
      heading: 'Verpackung & Versand',
      body: 'Unsere Verpackungen bestehen zu 100% aus recyceltem und recycelbarem Material. Wir verzichten vollständig auf Einweg-Plastik. Der Versand erfolgt CO₂-kompensiert, und wir optimieren kontinuierlich unsere Logistik, um den ökologischen Fußabdruck zu reduzieren.',
    },
    {
      heading: 'SecondHand-Programm',
      body: 'Mit unserem SecondHand-Programm geben wir getragenen ZEHN-Stücken ein zweites Leben. Denn das nachhaltigste Kleidungsstück ist das, das möglichst lange getragen wird. Erfahren Sie mehr auf unserer SecondHand-Seite.',
    },
  ],
};

STATIC_PAGES['care'] = {
  handle: 'care',
  title: 'Stoffpflege',
  subtitle: 'So bleibt Ihre ZEHN-Kleidung wie am ersten Tag',
  seoTitle: 'Stoffpflege – Pflegehinweise',
  seoDescription: 'Pflegehinweise für Ihre ZEHN-Kleidung. Tipps und Anleitungen für die optimale Pflege hochwertiger Materialien.',
  category: 'about',
  layout: {heroStyle: 'split', sectionStyle: 'cards', icon: 'Sparkles'},
  sections: [
    {
      heading: 'Allgemeine Pflegehinweise',
      body: 'Hochwertige Kleidung verdient hochwertige Pflege. Beachten Sie immer die Pflegehinweise auf dem Etikett Ihres Kleidungsstücks. Grundsätzlich empfehlen wir: Waschen Sie Ihre ZEHN-Kleidung bei niedrigen Temperaturen, verwenden Sie milde Waschmittel und vermeiden Sie den Trockner, wenn möglich.',
    },
    {
      heading: 'Baumwolle & Jersey',
      body: 'Waschen bei maximal 30°C mit einem Feinwaschmittel. Auf links drehen, um die Oberfläche zu schonen. Nicht im Trockner trocknen — stattdessen liegend auf einem Handtuch trocknen. Bei Bedarf von links bei niedriger Temperatur bügeln.',
    },
    {
      heading: 'Wolle & Strick',
      body: 'Handwäsche oder Wollwaschprogramm bei maximal 30°C. Spezielles Wollwaschmittel verwenden. Nicht wringen oder auswringen — sanft in ein Handtuch drücken und liegend trocknen. Wollkleidung muss selten gewaschen werden; oft reicht es, sie an der frischen Luft auszulüften.',
    },
    {
      heading: 'Technische Materialien',
      body: 'Funktionsstoffe und technische Materialien bei 30°C mit speziellem Sportwaschmittel waschen. Keinen Weichspüler verwenden, da er die funktionellen Eigenschaften beeinträchtigt. An der Luft trocknen oder im Trockner bei niedriger Temperatur.',
    },
    {
      heading: 'Aufbewahrung',
      body: 'Bewahren Sie Ihre Kleidung an einem kühlen, trockenen Ort auf. Strickwaren sollten gefaltet statt aufgehängt werden, um Verformungen zu vermeiden. Verwenden Sie Zedernholz oder Lavendel statt chemischer Mottenschutzmittel.',
    },
  ],
};

STATIC_PAGES['fitguide'] = {
  handle: 'fitguide',
  title: 'Fitguide',
  subtitle: 'Finden Sie Ihre perfekte Passform',
  seoTitle: 'Fitguide – Größenberatung',
  seoDescription: 'Der ZEHN Fitguide hilft Ihnen, die perfekte Größe zu finden. Maßtabellen, Passform-Tipps und individuelle Beratung.',
  category: 'about',
  layout: {heroStyle: 'dark', sectionStyle: 'steps', icon: 'Ruler'},
  sections: [
    {
      heading: 'So messen Sie richtig',
      body: 'Für die beste Passform empfehlen wir, Ihre Maße mit einem flexiblen Maßband zu nehmen. Messen Sie Brustumfang, Taillenumfang und Hüftumfang. Tragen Sie dabei nur leichte Kleidung und achten Sie darauf, das Maßband nicht zu straff zu ziehen.',
    },
    {
      heading: 'Oberteile',
      body: 'Brustumfang: Messen Sie an der breitesten Stelle der Brust, unter den Armen hindurch.\n\nS — 88–92 cm\nM — 93–97 cm\nL — 98–102 cm\nXL — 103–108 cm\nXXL — 109–114 cm\n\nUnsere Oberteile haben einen modernen, leicht taillierten Schnitt. Wenn Sie zwischen zwei Größen liegen, empfehlen wir die größere Größe.',
    },
    {
      heading: 'Hosen',
      body: 'Taillenumfang: Messen Sie an der natürlichen Taille, etwa auf Bauchnabelhöhe.\n\n28 — 71–73 cm\n30 — 76–78 cm\n32 — 81–83 cm\n34 — 86–88 cm\n36 — 91–93 cm\n\nAlle Hosen sind mit Innenbeinlänge Regular (32\") und Long (34\") erhältlich.',
    },
    {
      heading: 'Passform-Typen',
      body: 'Slim Fit: Körpernah geschnitten, moderne Silhouette. Ideal für schlanke bis durchschnittliche Figuren.\n\nRegular Fit: Klassischer, komfortabler Schnitt mit etwas mehr Bewegungsfreiheit.\n\nRelaxed Fit: Bewusst weiter geschnitten für einen lässigen, entspannten Look.',
    },
    {
      heading: 'Persönliche Beratung',
      body: 'Unsicher bei der Größenwahl? Unser Kundenservice berät Sie gerne persönlich. Schreiben Sie uns an hello@zehn.store oder nutzen Sie unsere Kontaktseite. Wir helfen Ihnen, die perfekte Passform zu finden.',
    },
  ],
};

STATIC_PAGES['zehn-club'] = {
  handle: 'zehn-club',
  title: 'ZEHN Club',
  subtitle: 'Exklusive Vorteile für Mitglieder',
  seoTitle: 'ZEHN Club – Mitgliedschaft & Vorteile',
  seoDescription: 'Werden Sie Mitglied im ZEHN Club und genießen Sie exklusive Vorteile: Early Access, Rabatte, Events und mehr.',
  category: 'about',
  layout: {heroStyle: 'gradient', sectionStyle: 'cards', icon: 'Crown'},
  sections: [
    {
      heading: 'Was ist der ZEHN Club?',
      body: 'Der ZEHN Club ist unser exklusives Treueprogramm für alle, die ZEHN lieben. Die Mitgliedschaft ist kostenlos und bietet Ihnen mit jeder Bestellung wachsende Vorteile. Je mehr Sie bei ZEHN einkaufen, desto höher steigen Sie in den Club-Stufen auf — und desto exklusiver werden Ihre Vorteile.',
    },
    {
      heading: 'Member – Ab der 1. Bestellung',
      body: 'Willkommen im Kreis! Als Member genießen Sie sofort diese Vorteile:\n\n• 10% Willkommensrabatt auf Ihre nächste Bestellung\n• Early Access: 48 Stunden vor allen anderen Zugang zu neuen Drops und Kollektionen\n• Kostenloser Standardversand bei jeder Bestellung — ohne Mindestbestellwert\n• Exklusive Member-Newsletter mit Styling-Tipps und Insider-News',
    },
    {
      heading: 'Insider – Ab 3 Bestellungen',
      body: 'Sie sind ein echter ZEHN-Kenner! Alle Member-Vorteile bleiben erhalten, plus:\n\n• Zusätzliche exklusive Insider-Rabatte auf ausgewählte Kollektionen\n• Geburtstagsüberraschung: Ein besonderes Geschenk zu Ihrem Ehrentag\n• Vorab-Informationen zu kommenden Kollektionen und limitierten Editionen\n• Einladungen zu exklusiven Online-Events und Behind-the-Scenes-Einblicken',
    },
    {
      heading: 'Icon – Ab 10 Bestellungen',
      body: 'Die höchste Stufe — für echte ZEHN-Fans. Alle Insider-Vorteile bleiben erhalten, plus:\n\n• VIP-Einladungen zu exklusiven Events und Pop-up-Stores\n• Persönliche Styling-Beratung durch unser Design-Team\n• Zugang zu limitierten Sonderanfertigungen und Capsule Collections\n• Priority-Kundenservice mit direktem Ansprechpartner',
    },
    {
      heading: 'ZEHN Blog & Exklusive Inhalte',
      body: 'Entdecken Sie unseren Blog für exklusive Einblicke, Styling-Tipps und Neuigkeiten aus der Welt von ZEHN. Als Kreis-Mitglied erhalten Sie Zugang zu exklusiven Artikeln und Behind-the-Scenes-Inhalten. Besuchen Sie unseren Blog unter /blogs für die neuesten Beiträge.',
    },
    {
      heading: 'Jetzt Mitglied werden',
      body: 'Die Mitgliedschaft im ZEHN Club ist kostenlos und unkompliziert. Registrieren Sie sich einfach mit Ihrer E-Mail-Adresse und genießen Sie ab der ersten Bestellung alle Vorteile. Kein Haken, keine versteckten Kosten — nur exklusive Vorteile für echte ZEHN-Fans. Erstellen Sie Ihr Konto unter /account und werden Sie Teil des ZEHN Club.',
    },
  ],
};

STATIC_PAGES['affiliate'] = {
  handle: 'affiliate',
  title: 'Affiliate Program',
  subtitle: 'Werden Sie Partner und verdienen Sie mit ZEHN',
  seoTitle: 'Affiliate Program – Partner werden',
  seoDescription: 'Werden Sie ZEHN Affiliate-Partner und verdienen Sie Provisionen für jeden vermittelten Verkauf. Einfach anmelden, teilen und verdienen.',
  category: 'about',
  layout: {heroStyle: 'gradient', sectionStyle: 'cards', icon: 'Handshake'},
  sections: [
    {
      heading: 'Was ist das ZEHN Affiliate Program?',
      body: 'Das ZEHN Affiliate Program ermöglicht es Ihnen, durch die Vermittlung von Kunden zu verdienen. Teilen Sie Ihre einzigartige Affiliate-Links auf Ihren Kanälen — sei es Blog, Social Media, YouTube oder andere Plattformen — und erhalten Sie für jeden erfolgreichen Verkauf eine attraktive Provision.',
    },
    {
      heading: 'Ihre Vorteile',
      body: 'Attraktive Provisionen: Verdienen Sie bis zu 10% auf jeden vermittelten Verkauf.\n\n30-Tage-Cookie: Profitieren Sie von einem langen Tracking-Zeitraum — Verkäufe innerhalb von 30 Tagen nach dem Klick werden Ihnen zugerechnet.\n\nRegelmäßige Auszahlungen: Monatliche Auszahlungen direkt auf Ihr Bankkonto oder PayPal.\n\nExklusive Ressourcen: Zugang zu professionellen Werbemitteln, Bildern und aktuellen Kampagnen.',
    },
    {
      heading: 'So funktioniert es',
      body: '1. Anmelden: Registrieren Sie sich kostenlos für unser Affiliate-Programm.\n\n2. Teilen: Posten Sie Ihre individuellen Links auf Ihren Kanälen.\n\n3. Verdienen: Für jeden über Ihren Link getätigten Verkauf erhalten Sie eine Provision.\n\n4. Auszahlen lassen: Ihre Provisionen werden monatlich ausgezahlt.',
    },
    {
      heading: 'Wer kann teilnehmen?',
      body: 'Unser Affiliate-Programm steht allen offen, die ZEHN begeistert weiterempfehlen möchten:\n\n• Blogger und Content Creator\n• Social Media Influencer\n• YouTuber und Streamer\n• Stylisten und Berater\n• Eigene Website-Betreiber\n• Jeder, der ZEHN liebt und teilen möchte',
    },
    {
      heading: 'Jetzt bewerben',
      body: 'Interesse geweckt? Bewerben Sie sich jetzt für das ZEHN Affiliate Program. Nach einer kurzen Prüfung erhalten Sie Zugang zu Ihrem persönlichen Dashboard, wo Sie Links generieren, Einnahmen tracken und Statistiken einsehen können.\n\nE-Mail: affiliate@zehnfashion.de',
    },
  ],
};

STATIC_PAGES['produkt-test'] = {
  handle: 'produkt-test',
  title: 'Produkt Test',
  subtitle: 'Werden Sie ZEHN Product Tester',
  seoTitle: 'Produkt Test – Werden Sie Product Tester',
  seoDescription: 'Testen Sie neue ZEHN Produkte vor dem offiziellen Verkauf. Werden Sie Product Tester und helfen Sie uns, die perfekte Passform und Qualität zu garantieren.',
  category: 'about',
  layout: {heroStyle: 'dark', sectionStyle: 'steps', icon: 'Beaker'},
  sections: [
    {
      heading: 'Was ist das ZEHN Product Testing?',
      body: 'Bei ZEHN glauben wir an kontinuierliche Verbesserung. Unser Product Testing Program ermöglicht es ausgewählten Kunden, neue Produkte vor dem offiziellen Launch zu testen und Feedback zu geben. Ihre Meinung hilft uns, die perfekte Passform, den besten Komfort und höchste Qualität zu gewährleisten.',
    },
    {
      heading: 'Wer kann Product Tester werden?',
      body: 'Wir suchen engagierte Tester, die:\n\n• Bereits ZEHN-Kunden sind und unsere Marke kennen\n• Verschiedene Körpertypen repräsentieren\n• Detailliertes und ehrliches Feedback geben können\n• Fotos und Bewertungen bereitstellen möchten\n• Aktiv auf Social Media oder anderen Plattformen unterwegs sind',
    },
    {
      heading: 'Ihre Aufgaben als Tester',
      body: '1. Produkt erhalten: Wir senden Ihnen das Testprodukt kostenlos zu.\n\n2. Ausgiebig testen: Tragen Sie das Produkt im Alltag und bei verschiedenen Aktivitäten.\n\n3. Feedback geben: Füllen Sie unseren detaillierten Fragebogen aus.\n\n4. Fotos machen: Dokumentieren Sie Ihre Erfahrung mit Bildern.\n\n5. Bewertung abgeben: Teilen Sie Ihre Meinung auf unserer Website oder Social Media.',
    },
    {
      heading: 'Ihre Vorteile',
      body: 'Kostenlose Produkte: Behalten Sie die getesteten Produkte.\n\nExklusiver Zugang: Testen Sie Neuheiten vor allen anderen.\n\nEinfluss nehmen: Ihr Feedback fließt direkt in die Produktentwicklung ein.\n\nBelohnungen: Erhalten Sie Gutscheine und Rabatte für zukünftige Bestellungen.\n\nCommunity: Werden Sie Teil einer exklusiven Gruppe von ZEHN Enthusiasten.',
    },
    {
      heading: 'Jetzt bewerben',
      body: 'Möchten Sie ZEHN Product Tester werden? Bewerben Sie sich jetzt mit einer kurzen E-Mail an:\n\nprodukttest@zehnfashion.de\n\nTeilen Sie uns mit, warum Sie sich besonders gut als Tester eignen, welche ZEHN-Produkte Sie bereits besitzen und welche Größen Sie tragen. Wir freuen uns auf Ihre Bewerbung!',
    },
  ],
};

// ------------------------------------------
// c) CUSTOMER SERVICE (Kundenservice)
// ------------------------------------------

STATIC_PAGES['track-order'] = {
  handle: 'track-order',
  title: 'Bestellung verfolgen',
  subtitle: 'Wo ist mein Paket?',
  seoTitle: 'Bestellung verfolgen – Sendungsverfolgung',
  seoDescription: 'Verfolgen Sie den Status Ihrer ZEHN-Bestellung. Echtzeit-Tracking für alle Lieferungen.',
  category: 'service',
  layout: {heroStyle: 'light', sectionStyle: 'steps', icon: 'Package'},
  sections: [
    {
      heading: 'Sendungsverfolgung',
      body: 'Nach dem Versand Ihrer Bestellung erhalten Sie eine Bestätigungs-E-Mail mit einem Tracking-Link. Klicken Sie auf den Link, um den aktuellen Status Ihrer Lieferung in Echtzeit zu verfolgen. Die Sendungsverfolgung wird in der Regel innerhalb von 24 Stunden nach Versand aktiviert.',
    },
    {
      heading: 'Bestellstatus prüfen',
      body: 'Loggen Sie sich in Ihr ZEHN-Konto ein, um den aktuellen Status aller Ihrer Bestellungen einzusehen. Unter „Meine Bestellungen" finden Sie eine Übersicht aller vergangenen und aktuellen Bestellungen mit detaillierten Statusinformationen.',
    },
    {
      heading: 'Lieferzeiten',
      body: 'Deutschland: 2–4 Werktage\nÖsterreich & Schweiz: 3–5 Werktage\nEU: 4–7 Werktage\nInternational: 7–14 Werktage\n\nBitte beachten Sie, dass es während Sale-Aktionen und Feiertagen zu verlängerten Lieferzeiten kommen kann.',
    },
    {
      heading: 'Probleme mit der Lieferung?',
      body: 'Sollte Ihre Bestellung nicht innerhalb der angegebenen Lieferzeit eintreffen oder beschädigt ankommen, kontaktieren Sie bitte unseren Kundenservice unter hello@zehn.store. Wir kümmern uns umgehend um Ihr Anliegen.',
    },
  ],
};

STATIC_PAGES['contact'] = {
  handle: 'contact',
  title: 'Kontakt',
  subtitle: 'Wir sind für Sie da',
  seoTitle: 'Kontakt – Kundenservice',
  seoDescription: 'Kontaktieren Sie das ZEHN-Team. Wir helfen Ihnen gerne bei Fragen zu Bestellungen, Produkten und mehr.',
  category: 'service',
  layout: {heroStyle: 'dark', sectionStyle: 'cards', icon: 'MessageCircle'},
  sections: [
    {
      heading: 'Kundenservice',
      body: 'Unser Kundenservice-Team steht Ihnen von Montag bis Freitag, 08:00–17:00 Uhr zur Verfügung.\n\nWhatsApp: +49 163 4210324\nTelefon: +49 163 4210324\nE-Mail: hello@zehn.store\nAntwortzeit: Innerhalb von 1 Werktag',
    },
    {
      heading: 'Häufige Anliegen',
      body: 'Bestellstatus: Prüfen Sie Ihren Bestellstatus direkt in Ihrem Konto unter „Meine Bestellungen".\n\nRetouren: Nutzen Sie unser einfaches Retourenportal in Ihrem Kundenkonto.\n\nGrößenberatung: Unser Fitguide hilft Ihnen, die perfekte Größe zu finden.\n\nTechnische Probleme: Bei Schwierigkeiten mit der Website oder App kontaktieren Sie uns unter support@zehn.store.',
    },
    {
      heading: 'Geschäftsanfragen',
      body: 'Für Presse, Kooperationen und geschäftliche Anfragen erreichen Sie uns unter:\n\nPresse: press@zehn.store\nKooperationen: partnerships@zehn.store\nKarriere: careers@zehn.store',
    },
    {
      heading: 'Adresse',
      body: 'ZEHN GmbH\nMusterstraße 10\n10115 Berlin\nDeutschland',
    },
  ],
};

STATIC_PAGES['shipping'] = {
  handle: 'shipping',
  title: 'Lieferung & Rückgabe',
  subtitle: 'Schnell geliefert, einfach zurückgeschickt',
  seoTitle: 'Lieferung & Rückgabe',
  seoDescription: 'Alle Informationen zu Versand, Lieferzeiten und Rückgabe bei ZEHN. Kostenloser Versand in Deutschland.',
  category: 'service',
  layout: {heroStyle: 'light', sectionStyle: 'alternating', icon: 'Truck'},
  sections: [
    {
      heading: 'Versand',
      body: 'Deutschland\nWir bieten kostenlosen Versand für alle Bestellungen innerhalb Deutschlands.\nLieferzeit:\n2–5 Werktage\n\nEuropäische Union\nFür Lieferungen innerhalb der Europäischen Union berechnen wir eine Versandpauschale von:\n6,99 € pro Bestellung\nLieferzeit:\n3–8 Werktage',
    },
    {
      heading: 'Versanddienstleister',
      body: 'Der Versand erfolgt über zuverlässige Logistikpartner wie:\nDHL\nDPD\nUPS\nHermes\nDer jeweilige Versanddienstleister wird je nach Zielregion und Verfügbarkeit ausgewählt.\nNach Versand Ihrer Bestellung erhalten Sie eine Versandbestätigung per E-Mail mit Sendungsverfolgung.',
    },
    {
      heading: 'Rückgabe & Rücksendung',
      body: 'Wir möchten, dass Sie mit Ihrem Einkauf bei ZEHN vollständig zufrieden sind.\nSollte ein Artikel nicht passen oder Ihren Erwartungen nicht entsprechen, können Sie ihn zurückgeben.\n\n30 Tage Rückgaberecht\nNeben dem gesetzlichen 14-tägigen Widerrufsrecht gewähren wir Ihnen ein freiwilliges Rückgaberecht von insgesamt 30 Tagen ab Erhalt der Ware.',
    },
    {
      heading: 'Rücksendekosten',
      body: 'Deutschland\nRücksendungen innerhalb Deutschlands sind kostenlos.\n\nEuropäische Union\nFür Rücksendungen aus anderen EU-Ländern berechnen wir eine Rücksendegebühr von 6,99 €, die von der Rückerstattung abgezogen wird.',
    },
    {
      heading: 'Bedingungen für Rücksendungen',
      body: 'Damit eine Rücksendung akzeptiert werden kann, müssen die Artikel:\nungetragen sein\nungewaschen sein\nmit originalen Etiketten versehen sein\nsich im einwandfreien Zustand befinden\nArtikel mit Gebrauchsspuren können leider nicht zurückgenommen werden.',
    },
    {
      heading: 'Rückerstattung',
      body: 'Sobald Ihre Rücksendung bei uns eingegangen und geprüft wurde, erfolgt die Rückerstattung über die ursprünglich verwendete Zahlungsmethode.\nDie Bearbeitung erfolgt in der Regel innerhalb von 5–10 Werktagen.',
    },
    {
      heading: 'Umtausch',
      body: 'Ein direkter Umtausch ist derzeit nicht möglich.\nWenn Sie eine andere Größe oder Farbe wünschen, senden Sie den Artikel bitte zurück und bestellen Sie den gewünschten Artikel erneut.',
    },
    {
      heading: 'Rückgabeprozess',
      body: 'Kontaktieren Sie unseren Kundenservice oder nutzen Sie unser Rückgabeportal.\nSie erhalten ein Rücksendeetikett.\nVerpacken Sie den Artikel sicher.\nGeben Sie das Paket beim Versanddienstleister ab.',
    },
    {
      heading: 'Kontakt',
      body: 'Bei Fragen zu Lieferung oder Rücksendungen kontaktieren Sie bitte unseren Kundenservice:\nZEHN Kundenservice\nE-Mail: info@zehnfashion.de\nTelefon: +49 163 4210324',
    },
  ],
};

STATIC_PAGES['payment'] = {
  handle: 'payment',
  title: 'Zahlungsmethoden & Sicherheit',
  subtitle: 'Sicher und flexibel bezahlen',
  seoTitle: 'Zahlungsmethoden & Sicherheit',
  seoDescription: 'Alle akzeptierten Zahlungsmethoden bei ZEHN: Kreditkarte, PayPal, Klarna, Apple Pay, Google Pay und mehr. Ihre Zahlung ist jederzeit sicher.',
  category: 'service',
  layout: {heroStyle: 'light', sectionStyle: 'cards', icon: 'CreditCard'},
  sections: [
    {
      heading: 'Zahlungsmethoden & Sicherheit',
      body: 'In unserem Online-Shop bieten wir Ihnen verschiedene sichere und bequeme Zahlungsmethoden an. Die verfügbaren Zahlungsarten können je nach Land und Bestellung variieren.',
    },
    {
      heading: 'A. Sofortige Zahlungsarten',
      body: 'Bei diesen Zahlungsarten wird die Zahlung sofort während des Bestellvorgangs abgeschlossen. Ihre Bestellung wird anschließend direkt bearbeitet.',
    },
    {
      heading: 'eWallets',
      body: 'Sie können bequem über folgende digitale Wallets bezahlen:\n\n• PayPal\n• Apple Pay\n• Google Pay\n• Amazon Pay\n\nDiese Zahlungsarten ermöglichen eine schnelle und sichere Zahlung über Ihr jeweiliges Konto.',
    },
    {
      heading: 'Kreditkarten',
      body: 'Wir akzeptieren folgende Kreditkarten:\n\n• Visa\n• Mastercard\n• American Express\n\nDie Belastung Ihrer Kreditkarte erfolgt unmittelbar nach Abschluss der Bestellung.',
    },
    {
      heading: 'Direktüberweisung',
      body: 'Sie können auch direkt über Ihr Online-Banking bezahlen:\n\n• Sofortüberweisung (Klarna)\n• Giropay\n\nDie Zahlung wird unmittelbar bestätigt und Ihre Bestellung wird anschließend weiterbearbeitet.',
    },
    {
      heading: 'B. Bankbasierte Zahlungsarten',
      body: 'Vorkasse (Banküberweisung):\nBei der Zahlungsart Vorkasse überweisen Sie den Rechnungsbetrag nach Abschluss Ihrer Bestellung auf unser Bankkonto. Der Versand der Ware erfolgt nach Eingang der Zahlung. Bitte geben Sie bei der Überweisung Ihre Bestellnummer als Verwendungszweck an.\n\nSEPA-Lastschrift:\nBei der Zahlung per SEPA-Lastschrift wird der Rechnungsbetrag nach Abschluss der Bestellung von Ihrem Bankkonto eingezogen.',
    },
    {
      heading: 'C. Zahlung nach Lieferung',
      body: 'Kauf auf Rechnung (Direkt):\nBeim Kauf auf Rechnung bezahlen Sie erst nach Erhalt der Ware. Sie überweisen den Rechnungsbetrag innerhalb von 14 Tagen nach Erhalt der Ware auf das in der Rechnung angegebene Bankkonto der VINCET GmbH. Wir behalten uns vor, diese Zahlungsart nur nach erfolgreicher Bonitätsprüfung anzubieten.\n\nKlarna Rechnung / Ratenkauf:\nIn Zusammenarbeit mit Klarna Bank AB bieten wir folgende Zahlungsarten an:\n• Kauf auf Rechnung\n• Ratenkauf\n\nDie Zahlung erfolgt direkt an Klarna gemäß den jeweiligen Klarna-Bedingungen. Auch hier kann eine Bonitätsprüfung durchgeführt werden.',
    },
    {
      heading: 'Sicherheit & Käuferschutz',
      body: 'Ihre Zahlung bei ZEHN ist jederzeit sicher.\n\nAlle Zahlungen werden über verschlüsselte SSL/TLS-Verbindungen verarbeitet, sodass Ihre persönlichen Daten und Zahlungsinformationen geschützt sind. Zusätzlich profitieren Sie je nach Zahlungsart von verschiedenen Käuferschutz-Programmen.',
    },
    {
      heading: 'PayPal Käuferschutz',
      body: 'Wenn Sie mit PayPal bezahlen, profitieren Sie vom PayPal-Käuferschutz. Sollte ein Artikel nicht ankommen oder erheblich von der Beschreibung abweichen, kann PayPal unter bestimmten Voraussetzungen den Kaufpreis erstatten. Weitere Informationen finden Sie auf der Website von PayPal.',
    },
    {
      heading: 'Kreditkarten-Schutz',
      body: 'Zahlungen mit Visa, Mastercard oder American Express sind durch die Sicherheitsmechanismen Ihrer Bank geschützt, z. B.:\n\n• 3D Secure\n• Chargeback-Verfahren\n• Zusätzliche Sicherheitsprüfungen',
    },
    {
      heading: 'Klarna Käuferschutz',
      body: 'Wenn Sie Klarna Rechnung oder Ratenkauf wählen, bezahlen Sie erst nach Erhalt der Ware. Dadurch haben Sie die Möglichkeit, Ihre Bestellung in Ruhe zu prüfen, bevor Sie bezahlen.',
    },
    {
      heading: 'SSL-Verschlüsselung',
      body: 'Unsere Website verwendet moderne SSL/TLS-Verschlüsselung, um:\n\n• Ihre persönlichen Daten\n• Zahlungsinformationen\n• Bestelldaten\n\nsicher zu übertragen. Sie erkennen eine sichere Verbindung am Schloss-Symbol in der Browserleiste.',
    },
    {
      heading: 'Weitere Vorteile beim Einkauf bei ZEHN',
      body: '✔ Sichere Zahlungsmethoden\n✔ Kostenloser Versand in Deutschland\n✔ 30 Tage Rückgaberecht\n✔ Kostenloser Rückversand innerhalb Deutschlands',
    },
    {
      heading: 'Verfügbarkeit der Zahlungsarten',
      body: 'Bitte beachten Sie, dass nicht alle Zahlungsarten in jedem Land verfügbar sind. Die für Ihre Bestellung verfügbaren Zahlungsmethoden werden Ihnen im Checkout-Prozess angezeigt.',
    },
    {
      heading: 'Kontakt',
      body: 'Bei Fragen zu unseren Zahlungsmethoden können Sie sich jederzeit an unseren Kundenservice wenden:\n\nZEHN Kundenservice\nE-Mail: info@zehnfashion.de\nTelefon: +49 163 4210324',
    },
  ],
};

STATIC_PAGES['secondhand'] = {
  handle: 'secondhand',
  title: 'SecondHand',
  subtitle: 'Preloved Fashion — ZEHN-Qualität, zweites Leben',
  seoTitle: 'SecondHand – Preloved ZEHN Fashion',
  seoDescription: 'Entdecken Sie gebrauchte ZEHN-Stücke oder verkaufen Sie Ihre eigenen. Nachhaltigkeit trifft Premium-Qualität.',
  category: 'service',
  layout: {heroStyle: 'gradient', sectionStyle: 'steps', icon: 'RefreshCw'},
  sections: [
    {
      heading: 'Die Idee',
      body: 'ZEHN-Kleidung ist für die Ewigkeit gemacht. Deshalb haben wir unser SecondHand-Programm ins Leben gerufen: Geben Sie Ihren getragenen ZEHN-Stücken ein zweites Leben und ermöglichen Sie anderen, Premium-Qualität zu einem reduzierten Preis zu erleben.',
    },
    {
      heading: 'So funktioniert es',
      body: 'Verkaufen: Senden Sie Ihre getragenen ZEHN-Stücke ein. Wir prüfen den Zustand, reinigen und bereiten sie professionell auf. Sie erhalten einen ZEHN-Gutschein im Wert des Ankaufspreises.\n\nKaufen: Stöbern Sie durch unsere kuratierten SecondHand-Stücke. Jedes Teil wurde von uns geprüft und ist in einwandfreiem Zustand — mit ZEHN-Qualitätsgarantie.',
    },
    {
      heading: 'Zustandskategorien',
      body: 'Wie neu: Kaum getragene Stücke ohne sichtbare Gebrauchsspuren.\n\nSehr gut: Leichte Gebrauchsspuren, die den Gesamteindruck nicht beeinträchtigen.\n\nGut: Sichtbare, aber gepflegte Gebrauchsspuren. Vollständig funktionsfähig und tragbar.',
    },
    {
      heading: 'Nachhaltigkeit',
      body: 'Mit jedem SecondHand-Kauf verlängern Sie den Lebenszyklus eines hochwertigen Kleidungsstücks und reduzieren aktiv den ökologischen Fußabdruck der Modeindustrie. Das ist Mode mit Verantwortung — typisch ZEHN.',
    },
  ],
};

STATIC_PAGES['faq'] = {
  handle: 'faq',
  title: 'Häufig gestellte Fragen',
  subtitle: 'Antworten auf die wichtigsten Fragen',
  seoTitle: 'FAQ – Häufig gestellte Fragen',
  seoDescription: 'Finden Sie Antworten auf häufig gestellte Fragen zu Bestellungen, Versand, Retouren und mehr bei ZEHN.',
  category: 'legal',
  layout: {heroStyle: 'dark', sectionStyle: 'accordion', icon: 'HelpCircle'},
  sections: [
    {
      heading: 'Bestellung & Zahlung',
      body: 'Wie kann ich bestellen?\nWählen Sie Ihre gewünschten Artikel aus, legen Sie sie in den Warenkorb und folgen Sie dem Bestellprozess. Sie können als Gast oder mit einem ZEHN-Konto bestellen.\n\nWelche Zahlungsmethoden gibt es?\nWir akzeptieren Visa, Mastercard, American Express, PayPal, Klarna, Apple Pay, Google Pay und SEPA-Lastschrift.\n\nKann ich meine Bestellung ändern oder stornieren?\nSolange Ihre Bestellung noch nicht versandt wurde, können Sie sie über Ihr Kundenkonto stornieren oder unseren Kundenservice kontaktieren.',
    },
    {
      heading: 'Versand & Lieferung',
      body: 'Wie lange dauert die Lieferung?\nStandardversand innerhalb Deutschlands dauert 2–4 Werktage. Expressversand ist in 1–2 Werktagen möglich.\n\nWie hoch sind die Versandkosten?\nStandardversand kostet 4,95€ und ist ab einem Bestellwert von 50€ kostenlos. ZEHN Club-Mitglieder erhalten immer kostenlosen Versand.\n\nLiefert ZEHN auch ins Ausland?\nJa, wir liefern in über 20 Länder. Die Versandkosten variieren je nach Zielland.',
    },
    {
      heading: 'Retouren & Umtausch',
      body: 'Wie kann ich einen Artikel zurücksenden?\nNutzen Sie das beigelegte Retourenlabel oder erstellen Sie ein neues Label in Ihrem Kundenkonto. Die Rücksendung ist innerhalb von 30 Tagen kostenlos.\n\nWann erhalte ich meine Rückerstattung?\nNach Eingang und Prüfung Ihrer Retoure erstatten wir den Betrag innerhalb von 5–7 Werktagen zurück.\n\nKann ich einen Artikel umtauschen?\nEin direkter Umtausch ist derzeit nicht möglich. Bitte senden Sie den Artikel zurück und bestellen Sie die gewünschte Größe oder Farbe neu.',
    },
    {
      heading: 'Produkte & Pflege',
      body: 'Wie finde ich die richtige Größe?\nNutzen Sie unseren Fitguide für detaillierte Maßtabellen und Passform-Empfehlungen.\n\nWie pflege ich meine ZEHN-Kleidung?\nDetaillierte Pflegehinweise finden Sie auf unserer Stoffpflege-Seite und auf dem Etikett jedes Kleidungsstücks.\n\nSind die Materialien nachhaltig?\nJa, wir verwenden ausschließlich zertifizierte und nachhaltig gewonnene Materialien. Erfahren Sie mehr auf unserer Nachhaltigkeitsseite.',
    },
    {
      heading: 'ZEHN Club & Rabatte',
      body: 'Was ist der ZEHN Club?\nUnser kostenloses Mitgliedschaftsprogramm mit exklusiven Vorteilen wie Early Access, Rabatten und kostenlosen Versand.\n\nGibt es Studentenrabatte?\nJa, über unseren Partner UNiDAYS erhalten Studierende exklusive Vergünstigungen.\n\nKann ich mehrere Gutscheine kombinieren?\nPro Bestellung kann in der Regel ein Gutscheincode eingelöst werden, sofern nicht anders angegeben.',
    },
  ],
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Look up static placeholder page content by handle.
 * Returns undefined if no static page exists for the given handle.
 */
export function getStaticPage(handle: string): StaticPageData | undefined {
  return STATIC_PAGES[handle];
}

/**
 * Check if a static placeholder page exists for the given handle.
 */
export function hasStaticPage(handle: string): boolean {
  return handle in STATIC_PAGES;
}

/**
 * Get all static page handles (useful for sitemap generation).
 */
export function getAllStaticPageHandles(): string[] {
  return Object.keys(STATIC_PAGES);
}
