import {useCallback, useState} from 'react';

/** Homepage mobile filter stack — default expanded (ART-0045). */
export function useHomepageFilterStackOpen(initialOpen = true) {
  const [open, setOpen] = useState(initialOpen);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {open, setOpen, toggle};
}
