'use client';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';


export default function LeaderboardPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
            <div className="w-full max-w-2xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold font-headline">Leaderboard</h1>
                    <Button asChild variant="outline">
                        <Link href="/"><Home className="mr-2" /> Back to Game</Link>
                    </Button>
                </div>
                <Leaderboard />
            </div>
        </main>
    );
}
