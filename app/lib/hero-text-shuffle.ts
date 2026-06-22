/**
 * useTextCycle — cycles through phrases with a smooth ease-out / ease-in crossfade.
 *
 * Returns null until client mounts (prevents SSR/hydration mismatch).
 * Server renders nothing; client fills in phrases[0] on first useEffect, then cycles.
 * Callers gate rendering with `{displayed !== null && <p>{displayed}</p>}`.
 *
 * Transition: old phrase eases out (opacity 0 + slight translateY up) over FADE_OUT_MS,
 * then new phrase swaps in and eases in (opacity 1 + translateY 0) via CSS transition.
 * No RAF/scramble — clean CSS-driven crossfade.
 *
 * @param phrases - readonly array of strings to cycle through
 * @param cycleMs - ms each phrase is fully visible (default 4500)
 * @returns {displayed, fading} — displayed: current phrase text; fading: true during ease-out
 */
import {useEffect, useRef, useState} from 'react';

/** Duration the outgoing phrase fades out before the next one swaps in (ms). */
const FADE_OUT_MS = 420;

export function useTextCycle(
  phrases: readonly string[],
  cycleMs = 4500,
): {displayed: string | null; fading: boolean} {
  // null on server — prevents SSR text content mismatch
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed(phrases[0]);

    if (phrases.length <= 1) return;

    const advance = () => {
      // Start ease-out on current phrase
      setFading(true);
      fadeTimerRef.current = setTimeout(() => {
        // After ease-out completes, swap phrase and ease in
        idxRef.current = (idxRef.current + 1) % phrases.length;
        setDisplayed(phrases[idxRef.current]);
        setFading(false);
      }, FADE_OUT_MS);
    };

    timerRef.current = setInterval(advance, cycleMs);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      if (fadeTimerRef.current !== null) clearTimeout(fadeTimerRef.current);
    };
  }, [phrases, cycleMs]);

  return {displayed, fading};
}
