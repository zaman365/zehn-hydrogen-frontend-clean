/**
 * GET /api/cache-version — client catalog invalidation signal (Phase 7D).
 *
 * Returns monotonic version bumped by webhooks; clients compare on focus to revalidate.
 */
import {data} from 'react-router';
import type {Route} from './+types/api.cache-version';
import {readCatalogCacheVersion} from '~/lib/catalog-cache-version';

export async function loader(_args: Route.LoaderArgs) {
  const version = await readCatalogCacheVersion();
  return data(
    {version},
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
