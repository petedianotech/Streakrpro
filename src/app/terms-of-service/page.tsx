import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';


export default function TermsOfServicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Terms of Service</h1>
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2" /> Back to Home</Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>By accessing and using Streakrpro (the "Application"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Application's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
            <p><strong>If you do not agree to abide by these terms, please do not use this Application.</strong></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. User Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
             <ul className="list-disc list-inside space-y-2">
                <li>You agree not to use the Application in any way that is unlawful, or harms the Application, its service providers, its suppliers, or any other user.</li>
                <li>You agree not to use any automated process to access or use the service or any process, whether automated or manual, to capture data or content from any service for any reason.</li>
                <li>You agree not to use any service or any process to damage, disable, impair, or otherwise attack our services or the networks connected to the services.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>3. User-Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You are solely responsible for the username you submit to the leaderboard. You agree not to post, or link to, any content that is defamatory, abusive, hateful, threatening, spam or spam-like, likely to offend, contains adult or objectionable content, contains personal information of others, risks copyright infringement, encourages unlawful activity, or otherwise violates any laws.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>4. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The Application is provided "as is." We make no warranty, express or implied, regarding the Application, and hereby disclaim all warranties of any kind, including but not limited to any warranty of merchantability, fitness for a particular purpose, or non-infringement.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>In no event shall we be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses, resulting from the use or the inability to use the service.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page. You are advised to review these Terms of Service periodically for any changes.</p>
          </alises>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
