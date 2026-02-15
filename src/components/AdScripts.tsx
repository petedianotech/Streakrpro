'use client';

import Script from "next/script";

export function AdScripts() {
    return (
        <>
            {/* Adsterra Popunder Script */}
            <Script
                id="adsterra-popunder"
                src="https://pl28718482.effectivegatecpm.com/ec/cf/0e/eccf0e48270d001e737be98cdeddc68f.js"
                strategy="afterInteractive"
            />
        </>
    );
}
