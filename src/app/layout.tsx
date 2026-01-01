import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Link from 'next/link';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Streakrpro',
  description: 'Test your math skills and build your streak!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="monetag" content="8fad60ab5ab81a0debb799071280256d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
        </FirebaseClientProvider>
        <Toaster />
        <footer className="w-full bg-background border-t border-border mt-auto">
          <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm text-muted-foreground flex-wrap">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors mx-2">Privacy Policy</Link>
            <span className="mx-2 hidden sm:inline">|</span>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors mx-2">Terms of Service</Link>
             <span className="mx-2 hidden sm:inline">|</span>
            <Link href="/about-developer" className="hover:text-foreground transition-colors mx-2">About Developer</Link>
          </div>
        </footer>
        <Script id="monetag-in-page-push" strategy="afterInteractive">
          {`
            (function(s){
              s.dataset.zone='10404923';
              s.src='https://nap5k.com/tag.min.js';
            })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
          `}
        </Script>
        <Script id="monetag-vignette" strategy="afterInteractive">
          {`
            (function(s){
              s.dataset.zone='10405020';
              s.src='https://gizokraijaw.net/vignette.min.js';
            })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
          `}
        </Script>
      </body>
    </html>
  );
}
