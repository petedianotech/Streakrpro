import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type GameOverScreenProps = {
  finalScore: number;
  finalStreak: number;
  onPlayAgain: () => void;
};

export function GameOverScreen({ finalScore, finalStreak, onPlayAgain }: GameOverScreenProps) {
  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-4xl font-bold font-headline">Game Over</CardTitle>
        <CardDescription>Well played!</CardDescription>
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
        
        <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
            <p className="text-muted-foreground">Interstitial Ad Placeholder</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onPlayAgain} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Play Again
        </Button>
      </CardFooter>
    </Card>
  );
}
