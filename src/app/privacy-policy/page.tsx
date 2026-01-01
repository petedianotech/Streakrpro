import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Privacy Policy</h1>
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2" /> Back to Home</Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Welcome to Streakrpro. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
            <p><strong>Please review this Privacy Policy carefully. If you do not agree with the terms, please do not access the application.</strong></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection of Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Anonymous User Data:</strong> To enable core application functionality, we use Firebase Authentication to create an anonymous user ID for you. This ID is not linked to your personal identity but is used to save your scores to the leaderboard.</li>
              <li><strong>User-Supplied Data:</strong> We collect the username you voluntarily provide when saving your score on the leaderboard.</li>
              <li><strong>Derivative Data:</strong> Our servers automatically collect standard log data, such as your IP address, browser type, and access times. This information is used for system administration and to maintain and improve the service.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Use of Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
             <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your anonymous account.</li>
                <li>Display your username and score on the global leaderboard.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                <li>Ensure the security and operational functionality of our services.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Disclosure of Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We do not sell, trade, or otherwise transfer your information to outside parties. Your username and score are publicly visible on the leaderboard within the application.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security of Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email]</p>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
