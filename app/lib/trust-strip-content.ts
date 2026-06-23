/**
 * Homepage trust strip — icon + two-line copy (REQ-0007 / ART-0038).
 * Pairs with announcement bar themes: Versand, Rechnung, brand story.
 */
import {
  Leaf,
  RefreshCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export type TrustStripItemId =
  | 'versand'
  | 'rueckgabe'
  | 'zahlung'
  | 'nachhaltig';

export type TrustStripItem = {
  id: TrustStripItemId;
  line1: string;
  line2: string;
  icon: LucideIcon;
};

/** Four trust pillars below hero fold — descriptive two-line German copy. */
export const TRUST_STRIP_ITEMS: readonly TrustStripItem[] = [
  {
    id: 'versand',
    line1: 'Kostenloser Versand',
    line2: 'deutschlandweit',
    icon: Truck,
  },
  {
    id: 'rueckgabe',
    line1: 'Einfache Rückgabe',
    line2: '30 Tage Rückgaberecht',
    icon: RefreshCcw,
  },
  {
    id: 'zahlung',
    line1: 'Sichere Zahlung',
    line2: 'Kauf auf Rechnung',
    icon: ShieldCheck,
  },
  {
    id: 'nachhaltig',
    line1: 'Nachhaltig gefertigt',
    line2: 'mit Sorgfalt & Qualität',
    icon: Leaf,
  },
] as const;
