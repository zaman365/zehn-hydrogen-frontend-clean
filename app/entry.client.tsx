import {HydratedRouter} from 'react-router/dom';
import {startTransition} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    /* Use script.nonce IDL — getAttribute('nonce') is empty in browsers for CSP nonces. */
    const existingNonce =
      [...document.querySelectorAll<HTMLScriptElement>('script[nonce]')]
        .map((script) => script.nonce)
        .find((value) => Boolean(value)) ?? undefined;

    hydrateRoot(
      document,
      <NonceProvider value={existingNonce}>
        <HydratedRouter />
      </NonceProvider>,
    );
  });
}
