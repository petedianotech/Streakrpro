'use client';

import { useEffect } from 'react';

export function AdScripts() {
  useEffect(() => {
    // Add Social Bar Script
    const socialBarScriptId = 'adsterra-social-bar-script';
    if (!document.getElementById(socialBarScriptId)) {
      const socialBarScript = document.createElement('script');
      socialBarScript.id = socialBarScriptId;
      socialBarScript.src = 'https://pl28718540.effectivegatecpm.com/c7/ca/99/c7ca9937192574a17f0b24d4c96e0220.js';
      socialBarScript.async = true;
      document.body.appendChild(socialBarScript);
    }

    // Add Popunder Script
    const popunderScriptId = 'adsterra-popunder-script';
    if (!document.getElementById(popunderScriptId)) {
        const popunderScript = document.createElement('script');
        popunderScript.id = popunderScriptId;
        popunderScript.src = 'https://pl28718482.effectivegatecpm.com/ec/cf/0e/eccf0e48270d001e737be98cdeddc68f.js';
        popunderScript.async = true;
        document.body.appendChild(popunderScript);
    }

  }, []); // The empty dependency array ensures this effect runs only once when the app loads.

  return null; // This component does not render any visible UI itself.
}
