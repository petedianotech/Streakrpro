import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Flame, User as UserIcon } from "lucide-react";
import Link from 'next/link';
import { User } from "firebase/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Difficulty } from "@/app/page";
import { Label } from "../ui/label";

type WelcomeScreenProps = {
  onStart: () => void;
  dailyStreak: number;
  bestStreak: number;
  user: User | null;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
};

export function WelcomeScreen({ onStart, dailyStreak, bestStreak, user, difficulty, onDifficultyChange }: WelcomeScreenProps) {
  return (
    <Card className="text-center animate-in fade-in zoom-in-95 duration-500">
      <CardHeader>
        {user && !user.isAnonymous ? (
            <div className="flex justify-center items-center gap-2 text-muted-foreground mb-4">
                <UserIcon className="w-5 h-5"/>
                <p className="text-sm font-medium text-foreground">{user.displayName || user.email}</p>
            </div>
        ) : null}
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="difficulty-tabs">Choose your difficulty:</Label>
            <Tabs id="difficulty-tabs" value={difficulty} onValueChange={(value) => onDifficultyChange(value as Difficulty)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="easy">Easy</TabsTrigger>
                    <TabsTrigger value="medium">Medium</TabsTrigger>
                    <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <Button onClick={onStart} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}
