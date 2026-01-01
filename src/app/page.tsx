"use client";

import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { SaveStreakScreen } from '@/components/game/SaveStreakScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type GameState = 'welcome' | 'playing' | 'save-streak' | 'game-over';

type Question = {
  text: string;
  answers: { text: string; correct: boolean }[];
};

type Operator = '+' | 'x';

const TIMER_SECONDS = 10;
const PERFECT_STREAK_BONUS = 100;
const COMBO_MULTIPLIER_THRESHOLD = 5;
const COMBO_MULTIPLIER = 1.5;
const INTERSTITIAL_AD_FREQUENCY = 2; // Show ad every 2 game overs

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [isClient, setIsClient] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [gameOverCount, setGameOverCount] = useState(0);
  const { toast } = useToast();

  // Session Stats
  const [bestStreak, setBestStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);


  const getDifficulty = useCallback(() => {
    if (streak >= 20) return { range: 100, operator: 'x' as Operator, level: 4 };
    if (streak >= 15) return { range: 50, operator: '+' as Operator, level: 3 };
    if (streak >= 10) return { range: 20, operator: '+' as Operator, level: 2 };
    return { range: 10, operator: '+' as Operator, level: 1 };
  }, [streak]);

  const generateQuestion = useCallback(() => {
    const { range, operator } = getDifficulty();
    
    let num1, num2;
    // Use a while loop to ensure we get a non-trivial question
    let correctAnswer;
    do {
      if (operator === 'x') {
        num1 = Math.floor(Math.random() * 10) + 1; // Keep multiplication manageable
        num2 = Math.floor(Math.random() * 10) + 1;
      } else {
        num1 = Math.floor(Math.random() * range) + 1;
        num2 = Math.floor(Math.random() * range) + 1;
      }
      correctAnswer = operator === '+' ? num1 + num2 : num1 * num2;
    } while (correctAnswer === 0);


    const answers = [{ text: String(correctAnswer), correct: true }];

    while (answers.length < 4) {
      const incorrectOffset = Math.floor(Math.random() * 10) - 5;
      if (incorrectOffset === 0) continue;
      
      let incorrectAnswer = correctAnswer + incorrectOffset;
      if (incorrectAnswer <= 0) incorrectAnswer = correctAnswer + Math.abs(incorrectOffset) + 1;
      
      incorrectAnswer = Math.round(incorrectAnswer);

      if (incorrectAnswer !== correctAnswer && !answers.some(a => a.text === String(incorrectAnswer))) {
        answers.push({ text: String(incorrectAnswer), correct: false });
      }
    }

    setQuestion({
      text: `${num1} ${operator} ${num2}`,
      answers: shuffleArray(answers),
    });
    setTimer(TIMER_SECONDS);
  }, [getDifficulty]);

  const handleTimeout = useCallback(() => {
    setScoreMultiplier(1);
    setGameState('save-streak');
  }, []);
  
  useEffect(() => {
    setIsClient(true);
    setBestStreak(Number(localStorage.getItem('bestStreak') || '0'));
    setGameOverCount(Number(localStorage.getItem('gameOverCount') || '0'));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !isClient) return;

    if (timer <= 0) {
      handleTimeout();
      return;
    }

    const intervalId = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState, timer, handleTimeout, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    let currentDailyStreak = Number(localStorage.getItem('dailyStreak') || '0');

    if (!lastPlayed) {
      currentDailyStreak = 0; // Will be 1 when they start a game
    } else {
      const lastPlayedDate = new Date(lastPlayed);
      if (lastPlayedDate.toDateString() !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastPlayedDate.toDateString() !== yesterday.toDateString()) {
          currentDailyStreak = 0; // Reset if they missed a day
        }
      }
    }
    
    setDailyStreak(currentDailyStreak);
    setBestStreak(Number(localStorage.getItem('bestStreak') || '0'));
  }, [isClient]);

  const startGame = useCallback(() => {
    if (!isClient) return;

    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    let currentDailyStreak = Number(localStorage.getItem('dailyStreak') || '0');

    if (!lastPlayed) {
      currentDailyStreak = 1;
    } else {
        const lastPlayedDate = new Date(lastPlayed);
        if (lastPlayedDate.toDateString() !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastPlayedDate.toDateString() === yesterday.toDateString()) {
                currentDailyStreak += 1;
            } else {
                currentDailyStreak = 1; // Reset if missed a day
            }
        }
    }
    
    setDailyStreak(currentDailyStreak);
    localStorage.setItem('dailyStreak', String(currentDailyStreak));
    localStorage.setItem('lastPlayedDate', today);

    setScore(0);
    setStreak(0);
    setScoreMultiplier(1);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setTotalResponseTime(0);
    generateQuestion();
    setGameState('playing');
  }, [generateQuestion, isClient]);

  const handleAnswer = (isCorrect: boolean) => {
    setTotalQuestions(prev => prev + 1);
    const responseTime = TIMER_SECONDS - timer;
    setTotalResponseTime(prev => prev + responseTime);

    if (isCorrect) {
      const newStreak = streak + 1;
      // Bonus points for faster answers
      const timeBonus = Math.max(0, (TIMER_SECONDS - responseTime) / 2); 
      const points = Math.round((10 + timeBonus) * scoreMultiplier);
      let newScore = score + points;

      setStreak(newStreak);
      setCorrectAnswers(prev => prev + 1);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('bestStreak', String(newStreak));
      }

      if (newStreak % 10 === 0 && newStreak > 0) {
        newScore += PERFECT_STREAK_BONUS;
        toast({
          title: "Perfect Streak!",
          description: `+${PERFECT_STREAK_BONUS} bonus points!`,
        });
      }
      
      if (newStreak > 0 && newStreak % COMBO_MULTIPLIER_THRESHOLD === 0) {
        const newMultiplier = scoreMultiplier + 0.5;
        setScoreMultiplier(newMultiplier);
        toast({
          title: "Combo x" + newMultiplier.toFixed(1) + "!",
          description: "Your score is multiplied!",
        });
      }

      setScore(newScore);
      generateQuestion();
    } else {
      setScoreMultiplier(1);
      setGameState('save-streak');
    }
  };
  
  const handleSaveStreak = () => {
    // In a real app, integrate an ad SDK and wait for the reward.
    generateQuestion();
    setGameState('playing');
  };

  const handleEndGame = () => {
    const newGameOverCount = gameOverCount + 1;
    setGameOverCount(newGameOverCount);
    localStorage.setItem('gameOverCount', String(newGameOverCount));
    setGameState('game-over');
  };

  const renderContent = () => {
    if (!isClient) {
      return <Skeleton className="w-full h-[400px]" />;
    }
    switch (gameState) {
      case 'playing':
        return question && (
          <GameScreen
            question={question.text}
            answers={question.answers}
            score={score}
            streak={streak}
            dailyStreak={dailyStreak}
            timerProgress={(timer / TIMER_SECONDS) * 100}
            onAnswer={handleAnswer}
            scoreMultiplier={scoreMultiplier}
          />
        );
      case 'save-streak':
        return (
          <SaveStreakScreen
            streak={streak}
            onSave={handleSaveStreak}
            onEnd={handleEndGame}
          />
        );
      case 'game-over':
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const avgResponseTime = correctAnswers > 0 ? totalResponseTime / correctAnswers : 0;
        return (
          <GameOverScreen
            finalScore={score}
            finalStreak={streak}
            onPlayAgain={startGame}
            showAd={(gameOverCount-1) % INTERSTITIAL_AD_FREQUENCY === 0 && gameOverCount > 1}
            bestStreak={bestStreak}
            accuracy={accuracy}
            avgResponseTime={avgResponseTime}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onStart={startGame}
            dailyStreak={dailyStreak}
            bestStreak={bestStreak}
          />
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}
