import {X} from 'lucide-react';
import {ContactEmailForm} from './contact/ContactEmailForm';

interface ContactEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactEmailModal({isOpen, onClose}: ContactEmailModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className="bg-background rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 flex flex-col max-h-[98vh] sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-background border-b border-border/50 px-4 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0">
            <h2 className="font-sans text-base sm:text-lg font-bold text-foreground">
              Contact us
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content - Balanced padding */}
          <div className="px-4 sm:px-6 overflow-y-auto flex-1 contact-email-modal flex items-center justify-center">
            <div className="w-full">
              <ContactEmailForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
