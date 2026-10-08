import { ViewTransition } from 'react';

export default function PageTransition({ children }) {
  return (
    <ViewTransition
      enter={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'page',
      }}
      exit={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'page',
      }}
    >
      {children}
    </ViewTransition>
  );
}
