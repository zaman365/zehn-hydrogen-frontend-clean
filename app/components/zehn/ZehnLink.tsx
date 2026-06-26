/**
 * ZehnLink — React Router Link with touch-aware prefetch defaults (Phase 7.1).
 *
 * Touch/coarse pointer → prefetch="viewport" (data loads before tap).
 * Desktop hover + fine pointer → prefetch="intent" (loads on hover).
 */
import {Link, type LinkProps} from 'react-router';
import {resolveLinkPrefetch, type ZehnPrefetchTier} from '~/lib/link-prefetch';

export type ZehnLinkProps = LinkProps & {
  /** Prefetch tier — defaults to nav; override prefetch prop to disable or force a mode. */
  tier?: ZehnPrefetchTier;
};

export function ZehnLink({tier = 'nav', prefetch, ...props}: ZehnLinkProps) {
  return (
    <Link
      prefetch={prefetch ?? resolveLinkPrefetch(tier)}
      {...props}
    />
  );
}
