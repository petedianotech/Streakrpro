import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, Target, Timer } from "lucide-react";

type GameOverScreenProps = {
  finalScore: number;
  finalStreak: number;
  onPlayAgain: () => void;
  showAd: boolean;
  bestStreak: number;
  accuracy: number;
  avgResponseTime: number;
};

export function GameOverScreen({ 
  finalScore, 
  finalStreak, 
  onPlayAgain, 
  showAd,
  bestStreak,
  accuracy,
  avgResponseTime 
}: GameOverScreenProps) {
  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-4xl font-bold font-headline">Game Over</CardTitle>
        <CardDescription>Well played! Here are your stats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center divide-x divide-border">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-muted-foreground tracking-widest">FINAL SCORE</p>
                <p className="text-4xl font-bold">{finalScore}</p>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-muted-foreground tracking-widest">FINAL STREAK</p>
                <p className="text-4xl font-bold">{finalStreak}</p>
            </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <Award className="w-6 h-6 text-muted-foreground" />
            <p className="text-2xl font-bold">{bestStreak}</p>
            <p className="text-xs text-muted-foreground">BEST STREAK</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Target className="w-6 h-6 text-muted-foreground" />
            <p className="text-2xl font-bold">{accuracy.toFixed(0)}<span className="text-sm">%</span></p>
            <p className="text-xs text-muted-foreground">ACCURACY</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Timer className="w-6 h-6 text-muted-foreground" />
            <p className="text-2xl font-bold">{avgResponseTime.toFixed(2)}<span className="text-sm">s</span></p>
            <p className="text-xs text-muted-foreground">AVG TIME</p>
          </div>
        </div>
        
        {showAd && (
          <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
              <p className="text-muted-foreground">Interstitial Ad Placeholder</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onPlayAgain} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Play Again
        </Button>
      </CardFooter>
    </Card>
  );
}
