'use client';

import { useEffect } from 'react';

export function AdScripts() {
  useEffect(() => {
    const SCRIPT_ID = 'adsterra-social-bar-script';
    
    // Prevent adding the script multiple times, e.g., during development hot-reloads.
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://pl28718540.effectivegatecpm.com/c7/ca/99/c7ca9937192574a17f0b24d4c96e0220.js';
    script.async = true;

    document.body.appendChild(script);

  }, []); // The empty dependency array ensures this effect runs only once when the app loads.

  return null; // This component does not render any visible UI itself.
}
