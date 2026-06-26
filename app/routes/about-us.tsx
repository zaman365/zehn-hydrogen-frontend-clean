import {Link, data as routeData} from 'react-router';
import type {Route} from './+types/about-us';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';
import {staticShouldRevalidate} from '~/lib/route-revalidation';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Über Uns | ZEHN'},
    {name: 'description', content: 'ZEHN ist kein Modelabel. ZEHN ist eine engineered attitude. Substanz statt Hype.'},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: 'Über Uns | ZEHN'},
    {property: 'og:description', content: 'ZEHN ist kein Modelabel. ZEHN ist eine engineered attitude. Substanz statt Hype.'},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary'},
  ];
};

export const shouldRevalidate = staticShouldRevalidate;

/** Static marketing page — Oxygen FPC via empty loader + static cache headers. */
export async function loader() {
  return routeData({}, {headers: getOxygenPageCacheHeaders('static')});
}

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/[0.03]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="text-[120px] sm:text-[180px] lg:text-[220px] font-bold leading-none opacity-5 absolute -top-8 left-0 pointer-events-none select-none">10</div>
              <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-primary-foreground/60 mb-4">Über Uns</div>
              <h1 className="font-sans text-[48px] sm:text-[64px] lg:text-[80px] leading-[0.95] text-primary-foreground mb-6 uppercase font-bold">
                Substanz<br />
                <span className="text-primary-foreground">statt</span><br />
                Hype.
              </h1>
              <div className="w-16 h-[2px] bg-primary-foreground/20 mb-6"></div>
              <p className="font-body text-lg sm:text-xl text-primary-foreground/80 leading-relaxed">
                Präzisions-Engineering.<br />
                Deutsches Erbe. Urbanes Leben.<br />
                Sei authentisch. Sei du selbst.
              </p>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/10 p-6 rounded-lg border border-primary-foreground/10">
                  <div className="font-sans text-4xl font-bold text-accent mb-2">DE</div>
                  <div className="font-body text-sm text-primary-foreground/60">Ursprung & Ethos</div>
                </div>
                <div className="bg-card/10 p-6 rounded-lg border border-primary-foreground/10">
                  <div className="font-sans text-4xl font-bold text-accent mb-2">10</div>
                  <div className="font-body text-sm text-primary-foreground/60">Das Versprechen</div>
                </div>
                <div className="bg-card/10 p-6 rounded-lg border border-primary-foreground/10">
                  <div className="font-sans text-4xl font-bold text-accent mb-2">0</div>
                  <div className="font-body text-sm text-primary-foreground/60">Kompromisse</div>
                </div>
                <div className="bg-card/10 p-6 rounded-lg border border-primary-foreground/10">
                  <div className="font-sans text-4xl font-bold text-accent mb-2">∞</div>
                  <div className="font-body text-sm text-primary-foreground/60">Authentisches Du</div>
                </div>
              </div>
              <p className="font-body text-base text-primary-foreground/70 leading-relaxed">
                ZEHN ist kein Modelabel.<br />
                ZEHN ist eine <strong className="text-primary-foreground">konstruierte Haltung.</strong><br /><br />
                Für Menschen, die <strong className="text-primary-foreground">Handwerk über Trend</strong> stellen. Die wissen, wer sie sind — und keine Erlaubnis brauchen, es zu zeigen. Du bist eine <span className="text-primary-foreground">perfekte ZEHN</span> — wenn du du selbst bist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-foreground py-4 overflow-hidden relative">
        <div className="flex animate-ticker-scroll">
          <div className="flex items-center gap-8 px-4 whitespace-nowrap">
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Substanz Statt Hype</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Handwerk über Trend</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Sei Authentisch</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Sei Du Selbst</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Du bist eine Zehn</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Präzision im Zweck</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Erbe neu gedacht</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Deutsche Engineering-Denkweise</span>
            <span className="text-primary-foreground">•</span>
          </div>
          <div className="flex items-center gap-8 px-4 whitespace-nowrap">
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Substanz Statt Hype</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Handwerk über Trend</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Sei Authentisch</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Sei Du Selbst</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Du bist eine Zehn</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Präzision im Zweck</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Erbe neu gedacht</span>
            <span className="text-primary-foreground">•</span>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-primary-foreground">Deutsche Engineering-Denkweise</span>
            <span className="text-primary-foreground">•</span>
          </div>
        </div>
      </div>

      {/* "PERFECT TEN" CORE STATEMENT */}
      <div className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-foreground/60 mb-6">Das Manifest</div>
          <h2 className="font-sans text-[40px] sm:text-[56px] lg:text-[72px] leading-[0.95] text-foreground mb-8">
            Du bist eine<br />
            <span className="text-accent">perfekte ZEHN.</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-8">
            In einer Welt, die dir sagt, wer du sein sollst — sagen wir dir etwas anderes.<br /><br />
            Du bist kein Entwurf. Keine Kopie. Kein Trend-Konsument.<br />
            Du bist <strong className="text-foreground">komplett</strong> — genau so, wie du bist.<br /><br />
            ZEHN wurde für Menschen gebaut, die das wissen. Die nicht kopieren, sondern originieren. Die Mode nicht als Status tragen, sondern als <strong className="text-foreground">stille Erklärung ihrer selbst.</strong><br /><br />
            Sei authentisch. Sei du selbst. Du bist genug.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-foreground/10 border border-foreground/20 font-sans text-sm text-foreground">Substanz Statt Hype</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Handwerk über Trend</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Sei Authentisch</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Sei Du Selbst</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Du bist eine Zehn</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Präzision im Zweck</span>
            <span className="px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 font-sans text-sm text-foreground">Erbe neu gedacht</span>
          </div>
        </div>
      </div>

      {/* BRAND VALUES */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-foreground/60 mb-4">Markenwerte</div>
          <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-12">Was ZEHN ausmacht.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="text-[120px] font-bold leading-none opacity-5 absolute -top-8 -left-4 pointer-events-none select-none text-foreground">01</div>
              <div className="w-12 h-[2px] bg-foreground/20 mb-6 relative z-10"></div>
              <div className="font-sans text-xl sm:text-2xl font-medium text-foreground mb-4 relative z-10">Präzision im Zweck</div>
              <p className="font-body text-base text-foreground/70 leading-relaxed relative z-10">Jede Naht. Jede Linie. Jede Materialwahl — bewusst und berechnet. Kein überflüssiges Detail. Nur strukturierte Intentionalität. Deutsche Engineering-Denkweise: klare Linien, leistungsbewusst, für die Ewigkeit gemacht.</p>
            </div>
            <div className="relative">
              <div className="text-[120px] font-bold leading-none opacity-5 absolute -top-8 -left-4 pointer-events-none select-none text-foreground">02</div>
              <div className="w-12 h-[2px] bg-foreground/20 mb-6 relative z-10"></div>
              <div className="font-sans text-xl sm:text-2xl font-medium text-foreground mb-4 relative z-10">Erbe neu gedacht</div>
              <p className="font-body text-base text-foreground/70 leading-relaxed relative z-10">Deutsches Handwerk — neu kodiert für urbanes Leben. Wir tragen das Erbe nicht als Last, sondern als Fundament. Robust trifft Raffiniert. Geschichte trifft Straße. Tradition trifft morgen.</p>
            </div>
            <div className="relative">
              <div className="text-[120px] font-bold leading-none opacity-5 absolute -top-8 -left-4 pointer-events-none select-none text-foreground">03</div>
              <div className="w-12 h-[2px] bg-foreground/20 mb-6 relative z-10"></div>
              <div className="font-sans text-xl sm:text-2xl font-medium text-foreground mb-4 relative z-10">Gestärkte Individualität</div>
              <p className="font-body text-base text-foreground/70 leading-relaxed relative z-10">Keine lauten Logos. Keine leeren Versprechen. Nur du — ausgedrückt durch das, was du trägst. Eine stille Erklärung für Menschen, die keine Erlaubnis brauchen, um sie selbst zu sein.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY — DARK SPLIT */}
      <div className="bg-[#F4F4F5] text-foreground py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-foreground/60 mb-6">Unser Standpunkt</div>
              <div className="font-sans text-[40px] sm:text-[56px] leading-[0.95] text-foreground mb-8">
                Handwerk<br />über<br /><span className="text-foreground">Trend.</span>
              </div>
              <p className="font-body text-base text-foreground/70 leading-relaxed mb-6">Der Markt ist laut. Schnelle Mode. Greenwashing. Kollektionen ohne Seele und Drops ohne Geschichte. Überall Hype-Zyklen — nirgendwo echte Substanz.</p>
              <p className="font-body text-base text-foreground/70 leading-relaxed mb-6">ZEHN wurde für das Gegenteil gebaut. Für alle, die den Unterschied zwischen gut gemacht und billig produziert spüren. Die wissen: echte Qualität braucht keine Werbetrommel.</p>
              <p className="font-body text-base text-foreground/70 leading-relaxed">Wir bauen jeden Drop wie Ingenieure: <strong className="text-foreground">berechnet, beabsichtigt, kompromisslos.</strong> Substanz statt Hype — immer.</p>
            </div>
            <div>
              <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-foreground/60 mb-6">Die vier Prinzipien</div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="font-sans text-2xl font-bold text-foreground flex-shrink-0">I</div>
                  <div>
                    <div className="font-sans text-lg font-medium text-foreground mb-2">Qualität ist nicht verhandelbar</div>
                    <p className="font-body text-sm text-foreground/60 leading-relaxed">Materialien, die halten. Kein Greenwashing. Kein Kompromiss am Produkt. Wenn es nicht gut genug ist — bauen wir es neu.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="font-sans text-2xl font-bold text-foreground flex-shrink-0">II</div>
                  <div>
                    <div className="font-sans text-lg font-medium text-foreground mb-2">Story vor Logo</div>
                    <p className="font-body text-sm text-foreground/60 leading-relaxed">Jedes Stück trägt eine Geschichte — über Material, Herkunft, Prozess. Wir verkaufen keine Marke. Wir vermitteln eine Überzeugung.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="font-sans text-2xl font-bold text-foreground flex-shrink-0">III</div>
                  <div>
                    <div className="font-sans text-lg font-medium text-foreground mb-2">Gemeinschaft zuerst</div>
                    <p className="font-body text-sm text-foreground/60 leading-relaxed">ZEHN ist eine Bewegung. Frühe Unterstützer sind keine Kunden — sie sind Mitgründer einer Idee. Insider. Die Ersten. Die Wesentlichen.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="font-sans text-2xl font-bold text-foreground flex-shrink-0">IV</div>
                  <div>
                    <div className="font-sans text-lg font-medium text-foreground mb-2">Sei Du Selbst</div>
                    <p className="font-body text-sm text-foreground/60 leading-relaxed">Kopiere nicht. Originiere. Du bist eine perfekte ZEHN, wenn du du selbst bist — nicht wenn du jemand anderen imitierst. Das ist der ZEHN Weg.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUTHENTIC MANIFESTO BAND */}
      <div className="bg-[#E5E4E2] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="font-sans text-[40px] sm:text-[56px] lg:text-[72px] leading-[0.95] text-foreground">
              &ldquo;Sei<br />Authentisch,<br />Sei Du<br />Selbst.&rdquo;
            </div>
            <div>
              <p className="font-body text-base sm:text-lg text-foreground/90 leading-relaxed">
                Das ist nicht nur ein Slogan.<br />Das ist unser Versprechen — und unsere Herausforderung an dich.<br /><br />
                <strong className="text-foreground">Die Welt kopiert. Trends werden recycelt. Hypes kommen und gehen.</strong><br /><br />
                Aber Menschen, die wissen wer sie sind — die brauchen keinen Trend. Sie setzen ihn. Sie tragen nicht, was alle tragen. Sie tragen, was zu ihnen passt. Was ihrer Geschichte entspricht. Was ihrer Haltung entspricht.<br /><br />
                ZEHN baut für diese Menschen. Für dich.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ORIGIN STORY */}
      <section className="bg-background py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-foreground/60 mb-4">Ursprung</div>
          <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-12">Wie ZEHN entstand.</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="space-y-6">
              <p className="font-body text-base text-foreground/70 leading-relaxed">ZEHN bedeutet zehn. Im Deutschen. Eine einfache Zahl — und ein hohes Versprechen. Das Versprechen, dass alles was wir bauen zehnmal besser durchdacht ist als der Durchschnitt. Zehnmal ehrlicher. Zehnmal dauerhafter.</p>
              <p className="font-body text-base text-foreground/70 leading-relaxed">Gegründet aus Frustration über eine Industrie, die Geschwindigkeit über Substanz stellt. Entwickelt von Menschen, die in Architektur, Industriedesign und urbaner Kultur zu Hause sind — und die Sprache des Engineerings auf Mode übertrugen: klare Linien, strukturierte Entscheidungen, Performance-Bewusstsein.</p>
              <p className="font-body text-base text-foreground/70 leading-relaxed">Aber ZEHN ist mehr als ein Produkt. Es ist eine Einladung. Eine Einladung, sich nicht anzupassen — sondern sich zu zeigen. <strong className="text-foreground">Du bist eine perfekte ZEHN, wenn du du selbst bist.</strong> Diese Überzeugung steckt in allem was wir tun.</p>
            </div>
            <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-6 sm:p-8 space-y-4">
              <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
                <div className="font-body text-sm text-foreground/60">Name & Bedeutung</div>
                <div className="font-sans text-sm text-foreground font-medium text-right">ZEHN — Das Versprechen</div>
              </div>
              <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
                <div className="font-body text-sm text-foreground/60">Herkunft</div>
                <div className="font-sans text-sm text-foreground text-right">Deutsch / Urban Global</div>
              </div>
              <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
                <div className="font-body text-sm text-foreground/60">Segment</div>
                <div className="font-sans text-sm text-foreground text-right">Premium Robuste Streetwear</div>
              </div>
              <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
                <div className="font-body text-sm text-foreground/60">Inspiration</div>
                <div className="font-sans text-sm text-foreground text-right">Luftfahrt · Architektur · Industrie</div>
              </div>
              <div className="flex justify-between items-start border-b border-foreground/10 pb-3">
                <div className="font-body text-sm text-foreground/60">Zielgruppe</div>
                <div className="font-sans text-sm text-foreground text-right">Urbane Kreative, 19–45</div>
              </div>
              <div className="flex justify-between items-start">
                <div className="font-body text-sm text-foreground/60">Slogan</div>
                <div className="font-sans text-sm text-foreground font-medium text-right">Sei Authentisch, Sei Du Selbst</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E5E4E2] text-foreground py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-sans text-[40px] sm:text-[56px] lg:text-[72px] leading-[0.95] text-foreground mb-8">
            Sei Teil der<br />
            <span className="text-foreground">Bewegung.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/pages/zehn-club" className="w-full sm:w-auto px-8 py-4 bg-accent text-primary-foreground font-sans text-base font-medium rounded-full hover:bg-accent/90 transition-colors duration-300 text-center">Frühen Zugang sichern</Link>
            <Link to="/collections/all" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-foreground text-foreground font-sans text-base font-medium rounded-full hover:bg-foreground hover:text-background transition-colors duration-300 text-center">Kollektion entdecken</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
