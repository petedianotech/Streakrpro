
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyChallenge } from "@/lib/daily-challenges";
import { CheckCircle2, Gift } from "lucide-react";

type DailyChallengeCardProps = {
    challenge: DailyChallenge;
    isCompleted: boolean;
};

export function DailyChallengeCard({ challenge, isCompleted }: DailyChallengeCardProps) {

    return (
        <Card className={`relative overflow-hidden ${isCompleted ? 'bg-muted/50 border-dashed' : 'bg-accent/10 border-accent'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                     <Gift className={`w-6 h-6 ${isCompleted ? 'text-muted-foreground' : 'text-accent'}`} />
                    Today's Challenge
                </CardTitle>
                <CardDescription className={isCompleted ? 'text-muted-foreground' : ''}>
                    {challenge.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="font-semibold">Completed! You earned {challenge.reward} points.</p>
                    </div>
                ) : (
                    <p className="font-semibold text-accent">{`Reward: ${challenge.reward} Bonus Points`}</p>
                )}
            </CardContent>
        </Card>
    );
}
