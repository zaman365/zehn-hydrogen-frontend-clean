import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

// WhatsApp SVG Icon Component
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function ContactBar() {
  const navigate = useNavigate();

  const handleEmailClick = () => {
    // Dispatch custom event to open email section in AI widget
    window.dispatchEvent(new CustomEvent('openEmailWidget'));
  };

  const handleChatClick = () => {
    // Dispatch custom event to open chat widget
    window.dispatchEvent(new CustomEvent('openChatWidget'));
  };

  return (
    <section className="w-full bg-[#E8E8EA] text-foreground py-3">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-6">
          {/* Left Side - Title */}
          <div className="text-left flex-shrink-0 xl:w-auto w-full">
            <h2 className="font-sans text-xl sm:text-2xl font-bold mb-0.5">
              NOCH FRAGEN?
            </h2>
            <p className="font-sans text-[10px] sm:text-xs text-foreground/60 whitespace-nowrap">
              Telefonisch erreichbar: Montag bis Freitag, 09:00 – 19:00 Uhr.
            </p>
          </div>

          {/* Right Side - Contact Options */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-row items-start sm:items-center gap-3 sm:gap-4 xl:gap-5 w-full xl:w-auto">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('openWhatsAppWidget'))}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/20 transition-colors flex-shrink-0">
                <WhatsAppIcon />
              </div>
              <div className="text-left xl:whitespace-nowrap">
                <div className="font-sans text-xs xl:text-sm font-semibold leading-none">WhatsApp</div>
                <div className="font-sans text-[9px] xl:text-[10px] text-foreground/60 leading-none mt-0.5">Antwort innerhalb von 1 Stunde</div>
              </div>
            </button>

            {/* Call */}
            <a
              href="tel:+491634210324"
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/20 transition-colors flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left xl:whitespace-nowrap">
                <div className="font-sans text-xs xl:text-sm font-semibold leading-none">Anruf</div>
                <div className="font-sans text-[9px] xl:text-[10px] text-foreground/60 leading-none mt-0.5">Sofortige Rückmeldung</div>
              </div>
            </a>

            {/* Email */}
            <button
              type="button"
              onClick={handleEmailClick}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/20 transition-colors flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left xl:whitespace-nowrap">
                <div className="font-sans text-xs xl:text-sm font-semibold leading-none">E-Mail</div>
                <div className="font-sans text-[9px] xl:text-[10px] text-foreground/60 leading-none mt-0.5">Antwort innerhalb von 1 Werktag</div>
              </div>
            </button>

            {/* Chat */}
            <button
              type="button"
              onClick={handleChatClick}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-foreground/20 transition-colors flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left xl:whitespace-nowrap">
                <div className="font-sans text-xs xl:text-sm font-semibold leading-none">Chat</div>
                <div className="font-sans text-[9px] xl:text-[10px] text-foreground/60 leading-none mt-0.5">Antwort innerhalb von 2 Minuten</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
