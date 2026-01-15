'use client';

import Script from "next/script";
import { useEffect } from "react";

export function AdScripts() {

    useEffect(() => {
        const initAdsgram = () => {
            if ((window as any).Adsgram && (window as any).Adsgram.init) {
                console.log('Adsgram SDK loaded, initializing...');
                (window as any).Adsgram.init({ blockId: '477' });
            } else {
                console.log('Adsgram SDK not found yet, will retry...');
            }
        };

        // Check if Adsgram is already loaded
        if ((window as any).Adsgram) {
            initAdsgram();
        }
        
        // If not, set up a listener for when the script loads
        const script = document.querySelector('script[src="https://tg.adsgram.app/js/adsgram.js"]');
        if (script) {
            script.addEventListener('load', initAdsgram);
        }

        return () => {
            if (script) {
                script.removeEventListener('load', initAdsgram);
            }
        };
    }, []);

    return (
        <>
            {/* Monetag Vignette Banner for ads between page loads */}
            <Script id="monetag-vignette" strategy="afterInteractive">
                {`
                    (function(s){
                    s.dataset.zone='10405020';
                    s.src='https://gizokraijaw.net/vignette.min.js';
                    })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
                `}
            </Script>

            {/* Adsgram script for Rewarded Video Ads - onLoad is removed */}
            <Script
                id="adsgram-sdk"
                src="https://tg.adsgram.app/js/adsgram.js"
                strategy="afterInteractive"
            />
        </>
    );
}
