import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Mail, Code, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function AboutDeveloperPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold font-headline">About the Developer</h1>
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2" /> Back to Home</Link>
            </Button>
        </div>

        <Card className="overflow-hidden">
            <div className="bg-muted/30 p-6 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-background">
                    <AvatarImage src="https://picsum.photos/seed/peter/200/200" data-ai-hint="developer portrait" alt="Peter Damiano" />
                    <AvatarFallback>PD</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold font-headline">Peter Damiano</h2>
                    <p className="text-lg text-muted-foreground">Game Developer & Web Creator</p>
                </div>
            </div>
          <CardContent className="p-6 space-y-4 text-muted-foreground">
            <p className="text-lg">Peter is a passionate and skilled developer with a knack for building engaging digital experiences. From fun, challenging games like <strong>Streakrpro</strong> to modern, responsive websites and applications, he loves bringing ideas to life with code.</p>
            <p>His goal is to create products that are not only functional and efficient but also enjoyable and intuitive for the end-user. This project is a testament to his dedication to crafting high-quality applications.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code />Let's Collaborate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Are you a developer, designer, or creator with an exciting project in mind? Peter is always open to new ideas and partnerships. If you're interested in collaborating, don't hesitate to get in touch!</p>
            <div className="flex flex-wrap gap-4 pt-2">
                <a href="mailto:petedianotech@gmail.com" className="inline-flex items-center gap-2">
                    <Button variant="outline">
                        <Mail /> Email
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </a>
                <a href="https://wa.me/265987066051" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                     <Button variant="outline">
                        <WhatsAppIcon /> WhatsApp
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
