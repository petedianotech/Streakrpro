import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Zap, Clock, ChevronsUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type GameScreenProps = {
  question: string;
  answers: { text: string; correct: boolean }[];
  score: number;
  streak: number;
  dailyStreak: number;
  timerProgress: number;
  onAnswer: (isCorrect: boolean) => void;
  scoreMultiplier: number;
  timePowerUps: number;
  onUseTimePowerUp: () => void;
  difficultyLevel: number;
};

export function GameScreen({
  question,
  answers,
  score,
  streak,
  dailyStreak,
  timerProgress,
  onAnswer,
  scoreMultiplier,
  timePowerUps,
  onUseTimePowerUp,
  difficultyLevel,
}: GameScreenProps) {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-4 text-center">
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
        <div className="flex flex-col items-center justify-center gap-1 px-2 relative">
           <span className="text-xs font-semibold text-muted-foreground tracking-widest">LEVEL</span>
           <div className="flex items-center gap-1.5">
            <ChevronsUp className={`w-5 h-5 text-primary`} />
            <span className="text-xl font-bold">{difficultyLevel}</span>
          </div>
          <Separator orientation="vertical" className="absolute right-0 h-1/2" />
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-widest">COMBO</span>
           <div className="flex items-center gap-1.5">
            <Zap className={`w-5 h-5 ${scoreMultiplier > 1 ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xl font-bold">x{scoreMultiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <Card className="text-center p-0 overflow-hidden shadow-2xl relative">
        <Progress value={timerProgress} className="h-2 rounded-none [&>div]:bg-accent" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4"
          onClick={onUseTimePowerUp}
          disabled={timePowerUps <= 0}
        >
          <Clock className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {timePowerUps}
          </span>
        </Button>
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
                onClick={(e) => {
                  onAnswer(answer.correct);
                  e.currentTarget.blur();
                }}
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
