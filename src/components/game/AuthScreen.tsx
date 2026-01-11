
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame } from "lucide-react";
import Link from "next/link";
import { initiateAnonymousSignIn, useAuth } from "@/firebase";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 55.5l-67.8 67.8C314.6 94.6 282.4 80 248 80c-82.6 0-150 67.4-150 150s67.4 150 150 150c94.2 0 135.3-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

type AuthScreenProps = {
    onGuestSignIn: () => void;
};

export function AuthScreen({ onGuestSignIn }: AuthScreenProps) {

    return (
        <Card className="text-center animate-in fade-in zoom-in-95 duration-500 w-full max-w-sm">
            <CardHeader>
                <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit mb-4">
                    <Flame className="w-12 h-12 text-accent" />
                </div>
                <CardTitle className="text-4xl font-bold font-headline">Welcome to Streakrpro</CardTitle>
                <CardDescription>Sign in to save your progress or play as a guest.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button asChild className="w-full">
                    <Link href="/login">
                        <GoogleIcon /> Sign in with Google
                    </Link>
                </Button>
                 <Button asChild className="w-full" variant="secondary">
                     <Link href="/login">
                        Sign in with Email
                    </Link>
                </Button>

                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-sm text-muted-foreground">OR</span>
                </div>
                
                <Button onClick={onGuestSignIn} variant="outline" className="w-full">
                    Play as a Guest
                </Button>

            </CardContent>
        </Card>
    );
}
