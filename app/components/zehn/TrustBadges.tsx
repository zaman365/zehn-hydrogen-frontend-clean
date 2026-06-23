/**
 * Homepage trust strip — transparent rows, hero-synced reveal below fold (REQ-0007).
 */
import {TrustStripItemCard} from '~/components/zehn/TrustStripItem';
import {TRUST_STRIP_ITEMS} from '~/lib/trust-strip-content';
import {
  TRUST_STRIP_CONTAINER,
  TRUST_STRIP_GRID_LAYOUT,
  TRUST_STRIP_SECTION_SHELL,
} from '~/lib/trust-strip-styles';

export function TrustBadges() {
  return (
    <section
      data-homepage-trust-strip
      className={TRUST_STRIP_SECTION_SHELL}
      aria-label="Unsere Vorteile"
    >
      <div className={TRUST_STRIP_CONTAINER}>
        <div className={TRUST_STRIP_GRID_LAYOUT}>
          {TRUST_STRIP_ITEMS.map((item, index) => (
            <TrustStripItemCard
              key={item.id}
              item={item}
              revealIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
