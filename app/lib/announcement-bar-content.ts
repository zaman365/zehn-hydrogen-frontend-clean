/**
 * Announcement bar slides — text, brand bg, semantic Lucide icons (REQ-0004).
 * Heights frozen in AnnouncementBar + site-header-stack.ts; icons stay compact.
 */
import {Receipt, Sparkles, Truck, type LucideIcon} from 'lucide-react';

export type AnnouncementSlideId = 'shipping' | 'invoice' | 'new-collection';

export type AnnouncementSlide = {
  id: AnnouncementSlideId;
  text: string;
  bgColor: string;
  icon: LucideIcon;
};

/** Rotating top-bar messages — icon left, text right (inline row). */
export const ANNOUNCEMENT_SLIDES: readonly AnnouncementSlide[] = [
  {
    id: 'shipping',
    text: 'Kostenloser Versand & Rücksendung',
    bgColor: 'bg-[#FF6B35]',
    icon: Truck,
  },
  {
    id: 'invoice',
    text: 'Kauf auf Rechnung',
    bgColor: 'bg-[#0F1426]',
    icon: Receipt,
  },
  {
    id: 'new-collection',
    text: 'Neue Kollektion verfügbar | Entdecke jetzt!',
    bgColor: 'bg-[#FF6B35]',
    icon: Sparkles,
  },
] as const;

/** Icon size — fits h-[26px] sm:h-[29px] bar without stack change. */
export const ANNOUNCEMENT_ICON =
  'w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-95';

/** Centered label row — icon + text animate together on slide change. */
export const ANNOUNCEMENT_LABEL_ROW =
  'inline-flex items-center justify-center gap-1.5 sm:gap-2';
