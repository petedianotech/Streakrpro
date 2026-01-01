import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Award, Share2, Target, Timer } from "lucide-react";

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
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `I scored ${finalScore} with a ${finalStreak} streak in Streakrpro! Can you beat me?`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Streakrpro Challenge!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error: any) {
        // Silently ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      try {
        await navigator.clipboard.writeText(`${shareText} Play here: ${shareUrl}`);
        toast({
          title: "Copied to clipboard!",
          description: "Your score has been copied. Share it with your friends!",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          variant: "destructive",
          title: "Oops!",
          description: "Could not copy score to clipboard.",
        });
      }
    }
  };

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
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button onClick={onPlayAgain} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Play Again
        </Button>
        <Button onClick={handleShare} size="lg" variant="outline" className="w-full sm:w-auto">
          <Share2 className="mr-2" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
