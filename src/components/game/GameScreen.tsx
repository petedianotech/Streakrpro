import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type GameScreenProps = {
  question: string;
  answers: { text: string; correct: boolean }[];
  score: number;
  streak: number;
  dailyStreak: number;
  timerProgress: number;
  onAnswer: (isCorrect: boolean) => void;
};

export function GameScreen({
  question,
  answers,
  score,
  streak,
  dailyStreak,
  timerProgress,
  onAnswer,
}: GameScreenProps) {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 text-center">
        <div className="flex flex-col items-center justify-center gap-1 px-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-widest">SCORE</span>
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-muted-foreground" />
            <span className="text-xl font-bold">{score}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2 relative">
          <Separator orientation="vertical" className="absolute left-0 h-1/2" />
          <span className="text-xs font-semibold text-muted-foreground tracking-widest">STREAK</span>
           <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-accent" />
            <span className="text-xl font-bold">{streak}</span>
          </div>
          <Separator orientation="vertical" className="absolute right-0 h-1/2" />
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-widest">DAILY</span>
           <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">{dailyStreak}</span>
          </div>
        </div>
      </div>
      
      <Card className="text-center p-0 overflow-hidden shadow-2xl">
        <Progress value={timerProgress} className="h-2 rounded-none [&>div]:bg-accent" />
        <div className="p-4 sm:p-6">
          <CardHeader>
            <p className="text-5xl md:text-6xl font-bold tracking-wider font-headline">{question}</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 mt-6">
            {answers.map((answer, index) => (
              <Button
                key={index}
                variant="secondary"
                className="h-28 text-4xl font-bold border-2 border-border hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                onClick={() => onAnswer(answer.correct)}
              >
                {answer.text}
              </Button>
            ))}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
