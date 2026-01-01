import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Flame } from "lucide-react";

type WelcomeScreenProps = {
  onStart: () => void;
  dailyStreak: number;
  bestStreak: number;
};

export function WelcomeScreen({ onStart, dailyStreak, bestStreak }: WelcomeScreenProps) {
  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        <div className="flex justify-center items-center gap-6 mb-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{dailyStreak}</p>
              <p className="text-xs">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" />
             <div>
              <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
              <p className="text-xs">Best Streak</p>
            </div>
          </div>
        </div>
        <CardTitle className="text-4xl font-bold font-headline pt-4">Streakrpro</CardTitle>
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
