import {ContactHero} from './ContactHero';
import {ContactEmailForm} from './ContactEmailForm';
import {ContactPhone} from './ContactPhone';
import {ContactFAQ} from './ContactFAQ';

// ============================================
// MAIN EXPORT
// ============================================

export function StaticPageContact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Quick-Jump Cards */}
      <ContactHero />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Email & Phone — Side by Side on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16 sm:mb-20">
          <ContactEmailForm />
          <ContactPhone />
        </div>

        {/* Divider */}
        <div className="border-t border-border/10 mb-16 sm:mb-20" />

        {/* FAQ Section — Full Width */}
        <ContactFAQ />
      </div>
    </div>
  );
}
