import {useEffect, useLayoutEffect} from 'react';

/**
 * Runs synchronously before paint on client (useLayoutEffect).
 * Falls back to useEffect on server — avoids the SSR "useLayoutEffect does nothing" warning.
 */
export const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? useLayoutEffect : useEffect;
