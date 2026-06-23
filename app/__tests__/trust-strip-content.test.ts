import {describe, expect, it} from 'vitest';
import {ShieldCheck} from 'lucide-react';
import {TRUST_STRIP_ITEMS} from '~/lib/trust-strip-content';

describe('trust-strip-content', () => {
  it('defines four homepage trust items with two-line German copy', () => {
    expect(TRUST_STRIP_ITEMS).toHaveLength(4);
    expect(TRUST_STRIP_ITEMS.map((item) => item.id)).toEqual([
      'versand',
      'rueckgabe',
      'zahlung',
      'nachhaltig',
    ]);
    expect(TRUST_STRIP_ITEMS.map((item) => [item.line1, item.line2])).toEqual([
      ['Kostenloser Versand', 'deutschlandweit'],
      ['Einfache Rückgabe', '30 Tage Rückgaberecht'],
      ['Sichere Zahlung', 'Kauf auf Rechnung'],
      ['Nachhaltig gefertigt', 'mit Sorgfalt & Qualität'],
    ]);
  });

  it('each item has an icon component', () => {
    for (const item of TRUST_STRIP_ITEMS) {
      expect(item.icon).toBeTruthy();
      expect(item.line1.length).toBeGreaterThan(0);
      expect(item.line2.length).toBeGreaterThan(0);
    }
  });

  it('uses shield icon for sichere Zahlung', () => {
    const zahlung = TRUST_STRIP_ITEMS.find((item) => item.id === 'zahlung');
    expect(zahlung?.icon).toBe(ShieldCheck);
  });
});
