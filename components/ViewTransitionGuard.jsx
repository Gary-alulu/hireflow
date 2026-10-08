'use client';

import { useEffect } from 'react';

const BENIGN_VIEW_TRANSITION = /transition was aborted because of invalid state|view transition was skipped because document visibility state|skipping view transition because document visibility state|skipping view transition because viewport size changed/i;

export default function ViewTransitionGuard() {
  useEffect(() => {
    const isBenign = (source) => {
      const message =
        source?.message ??
        source?.error?.message ??
        source?.reason?.message ??
        source?.reason ??
        '';
      return typeof message === 'string' && BENIGN_VIEW_TRANSITION.test(message);
    };

    const onError = (event) => {
      if (isBenign(event)) event.preventDefault();
    };

    const onRejection = (event) => {
      if (isBenign(event)) event.preventDefault();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}