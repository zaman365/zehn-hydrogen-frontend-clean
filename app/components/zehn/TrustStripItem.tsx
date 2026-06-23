/**
 * Single trust strip row — icon left, two-line copy, hero-reveal stagger (REQ-0007 / ART-0044).
 * Base delay 0ms — parallel with hero title; per-item +180ms via trust-strip-motion.ts.
 */
import type {TrustStripItem} from '~/lib/trust-strip-content';
import {getTrustStripRevealDelayMs} from '~/lib/trust-strip-motion';
import {
  TRUST_STRIP_ICON,
  TRUST_STRIP_ITEM,
  TRUST_STRIP_ITEM_ROW,
  TRUST_STRIP_LINE_PRIMARY,
  TRUST_STRIP_LINE_SECONDARY,
  TRUST_STRIP_REVEAL,
  TRUST_STRIP_TEXT,
} from '~/lib/trust-strip-styles';

export type TrustStripItemProps = {
  item: TrustStripItem;
  revealIndex: number;
};

export function TrustStripItemCard({item, revealIndex}: TrustStripItemProps) {
  const Icon = item.icon;

  return (
    <div className={TRUST_STRIP_ITEM}>
      <div
        className={`${TRUST_STRIP_ITEM_ROW} ${TRUST_STRIP_REVEAL}`}
        style={{
          animationDelay: `${getTrustStripRevealDelayMs(revealIndex)}ms`,
        }}
      >
        <Icon className={TRUST_STRIP_ICON} strokeWidth={1.5} aria-hidden />
        <div className={TRUST_STRIP_TEXT}>
          <span className={TRUST_STRIP_LINE_PRIMARY}>{item.line1}</span>
          <span className={TRUST_STRIP_LINE_SECONDARY}>{item.line2}</span>
        </div>
      </div>
    </div>
  );
}
