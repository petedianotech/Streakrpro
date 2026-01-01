"use client";

import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { SaveStreakScreen } from '@/components/game/SaveStreakScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Skeleton } from '@/components/ui/skeleton';

type GameState = 'welcome' | 'playing' | 'save-streak' | 'game-over';

type Question = {
  text: string;
  answers: { text: string; correct: boolean }[];
};

const TIMER_SECONDS = 5;

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
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

  const generateQuestion = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;

    const answers = [{ text: String(correctAnswer), correct: true }];

    while (answers.length < 4) {
      const incorrectOffset = Math.floor(Math.random() * 9) - 4; // -4 to +4
      if (incorrectOffset === 0 && correctAnswer !== 0) continue;
      
      let incorrectAnswer = correctAnswer + incorrectOffset;
      if (incorrectAnswer < 0) incorrectAnswer = Math.abs(incorrectAnswer) + 1; // Ensure positive

      if (!answers.some(a => a.text === String(incorrectAnswer))) {
        answers.push({ text: String(incorrectAnswer), correct: false });
      }
    }

    setQuestion({
      text: `${num1} + ${num2}`,
      answers: shuffleArray(answers),
    });
    setTimer(TIMER_SECONDS);
  }, []);

  const handleTimeout = useCallback(() => {
    setGameState('save-streak');
  }, []);
  
  useEffect(() => {
    setIsClient(true);
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
    generateQuestion();
    setGameState('playing');
  }, [generateQuestion, isClient]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      generateQuestion();
    } else {
      setGameState('save-streak');
    }
  };
  
  const handleSaveStreak = () => {
    // In a real app, integrate an ad SDK and wait for the reward.
    generateQuestion();
    setGameState('playing');
  };

  const handleEndGame = () => {
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
        return (
          <GameOverScreen
            finalScore={score}
            finalStreak={streak}
            onPlayAgain={startGame}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onStart={startGame}
            dailyStreak={dailyStreak}
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
