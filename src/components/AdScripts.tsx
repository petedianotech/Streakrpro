'use client';

import Script from "next/script";

export function AdScripts() {
    return (
        <>
            {/* Adsterra Social Bar Script */}
            <Script
                id="adsterra-social-bar"
                src="https://pl28718540.effectivegatecpm.com/c7/ca/99/c7ca9937192574a17f0b24d4c96e0220.js"
                strategy="afterInteractive"
            />
        </>
    );
}
