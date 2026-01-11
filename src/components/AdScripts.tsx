
'use client';

import Script from "next/script";

export function AdScripts() {
    return (
        <>
            <Script id="monetag-vignette" strategy="afterInteractive">
                {`
                    (function(s){
                    s.dataset.zone='10405020';
                    s.src='https://gizokraijaw.net/vignette.min.js';
                    })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
                `}
            </Script>
            <Script
                src="https://tg.adsgram.app/js/adsgram.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if ((window as any).Adsgram) {
                        (window as any).Adsgram.init({ blockId: '477' });
                    }
                }}
            />
        </>
    );
}
