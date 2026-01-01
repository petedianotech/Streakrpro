
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Award, Share2, Target, Timer, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoc } from "@/firebase";
import { doc, DocumentReference } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { User } from "firebase/auth";
import Link from "next/link";


type GameOverScreenProps = {
  finalScore: number;
  finalStreak: number;
  onPlayAgain: () => void;
  bestStreak: number;
  accuracy: number;
  avgResponseTime: number;
  onSaveScore: (username: string) => void;
  user: User | null;
};

export function GameOverScreen({ 
  finalScore, 
  finalStreak, 
  onPlayAgain, 
  bestStreak,
  accuracy,
  avgResponseTime,
  onSaveScore,
  user
}: GameOverScreenProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const firestore = useFirestore();
  const userDocRef = user ? doc(firestore, 'users', user.uid) as DocumentReference<{username: string}> : null;
  const { data: userData } = useDoc(userDocRef);
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    if (userData) {
      setUsername(userData.username);
    }
  }, [userData]);


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
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Silently ignore abort errors from the user dismissing the share sheet.
        } else {
          console.error("Share failed:", error);
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

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScore(username);
    setScoreSaved(true);
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

        <Separator />
        
        <form onSubmit={handleSaveScore} className="space-y-4">
            <Label htmlFor="username" className="text-left block text-sm font-medium text-muted-foreground">Enter your name for the leaderboard:</Label>
            <div className="flex gap-2">
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your Name"
                    disabled={scoreSaved}
                />
                <Button type="submit" disabled={scoreSaved || !username}>
                    {scoreSaved ? 'Saved!' : 'Save Score'}
                </Button>
            </div>
        </form>

      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button onClick={onPlayAgain} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Play Again
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/leaderboard"><Trophy className="mr-2" /> Leaderboard</Link>
        </Button>
        <Button onClick={handleShare} size="lg" variant="outline" className="w-full sm:w-auto">
          <Share2 className="mr-2" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
