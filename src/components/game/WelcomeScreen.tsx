import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

type WelcomeScreenProps = {
  onStart: () => void;
  dailyStreak: number;
};

export function WelcomeScreen({ onStart, dailyStreak }: WelcomeScreenProps) {
  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        <div className="flex justify-center items-center gap-2 mb-4">
          <Flame className="w-8 h-8 text-accent" />
          <p className="text-2xl font-bold">{dailyStreak}</p>
          <p className="text-muted-foreground">Day Streak</p>
        </div>
        <CardTitle className="text-4xl font-bold font-headline">Streakrpro</CardTitle>
        <CardDescription>How long can you keep the streak going?</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onStart} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}
