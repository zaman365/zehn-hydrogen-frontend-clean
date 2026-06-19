import {redirect, Form, Link} from 'react-router';
import type {Route} from './+types/account.login';

export async function loader({context}: Route.LoaderArgs) {
  if (await context.customerAccount.isLoggedIn()) {
    return redirect('/account');
  }
  return {};
}

export async function action({context}: Route.ActionArgs) {
  return context.customerAccount.login();
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — editorial image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-[#0F1426] items-end"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{backgroundImage: 'url(/banner-slider-1.jpg)'}}
        />
        <div className="relative z-10 p-12 pb-16">
          <p className="font-sans text-white/70 text-sm uppercase tracking-widest mb-3">
            ZEHN Fashion
          </p>
          <p className="font-sans text-white text-2xl font-light leading-relaxed max-w-xs">
            Zeitlose Qualität.<br />Modernes Design.
          </p>
        </div>
      </div>

      {/* Right panel — login */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-10">
            <Link to="/">
              <img
                src="/Dark_Blue_Horizontal.png"
                alt="ZEHN"
                className="h-10 w-auto rounded-none"
                style={{border: 'none'}}
              />
            </Link>
          </div>

          {/* Headline */}
          <h1 className="font-sans text-2xl font-semibold text-foreground tracking-tight mb-2">
            Willkommen zurück
          </h1>
          <p className="font-sans text-sm text-foreground/60 mb-10">
            Melde dich an, um deine Bestellungen einzusehen und dein Konto zu verwalten.
          </p>

          {/* Login CTA */}
          <Form method="post">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-sans font-medium py-4 rounded-full hover:bg-primary/90 transition-colors text-sm tracking-wide"
            >
              Anmelden
            </button>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/40" />
            <span className="font-sans text-xs text-foreground/40 uppercase tracking-widest">
              oder
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Continue as guest */}
          <Link
            to="/collections/all"
            className="block w-full text-center border border-foreground/20 text-foreground font-sans font-medium py-4 rounded-full hover:border-foreground/40 hover:bg-foreground/5 transition-colors text-sm tracking-wide"
          >
            Als Gast einkaufen
          </Link>

          {/* Benefits */}
          <ul className="mt-10 space-y-3">
            {[
              'Bestellungen & Lieferstatus verfolgen',
              'Schneller zur Kasse mit gespeicherten Daten',
              'Exklusive Angebote & Neuheiten zuerst',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="font-sans text-xs text-foreground/60">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
