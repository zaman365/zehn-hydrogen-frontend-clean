/**
 * ZehnMediaFrame — fixed-aspect image container (Phase 2 media primitive).
 *
 * Provides:
 *  - A `position: relative` box that enforces the chosen aspect ratio
 *  - `overflow-hidden` so child images/skeletons stay inside the frame
 *  - `bg-white` base so skeleton doesn't bleed on transparent backgrounds
 *
 * Use with ZehnShopifyImage or ZehnStaticImage as children.
 * Do NOT put card chrome (badges, actions) directly inside; wrap those outside this frame.
 */
import {cn} from '~/lib/utils';
import {ZEHN_MEDIA_ASPECT, type ZehnMediaAspectKey} from '~/lib/zehn-media-styles';

export type ZehnMediaFrameProps = {
  /** Aspect ratio key from ZEHN_MEDIA_ASPECT — e.g. 'product' → aspect-[7/10]. */
  aspect: ZehnMediaAspectKey;
  /** Extra Tailwind classes applied to the frame element (e.g. 'rounded-sm'). */
  className?: string;
  children: React.ReactNode;
};

export function ZehnMediaFrame({aspect, className, children}: ZehnMediaFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white',
        ZEHN_MEDIA_ASPECT[aspect],
        className,
      )}
    >
      {children}
    </div>
  );
}
