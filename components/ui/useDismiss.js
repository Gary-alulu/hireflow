'use client';

import { useEffect } from 'react';

/**
 * Closes a floating element on outside pointer interaction or Escape.
 * Pass the ref of the element that should stay open for clicks inside it.
 */
export default function useDismiss(ref, enabled, onDismiss) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerDown = (event) => {
      if (ref.current?.contains(event.target)) return;
      onDismiss();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, enabled, onDismiss]);
}
