
"use client";

import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { SaveStreakScreen } from '@/components/game/SaveStreakScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { User } from 'firebase/auth';
import { doc, writeBatch, getDoc, collection, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { LoadingScreen } from '@/components/game/LoadingScreen';
import { AuthScreen } from '@/components/game/AuthScreen';

type GameState = 'welcome' | 'playing' | 'save-streak' | 'game-over';
export type Difficulty = 'easy' | 'medium' | 'dynamic';

type Question = {
  text: string;
  answers: { text: string; correct: boolean }[];
};

type Operator = '+' | 'x';

const TIMER_SECONDS = 10;
const PERFECT_STREAK_BONUS = 100;
const COMBO_MULTIPLIER_THRESHOLD = 5;
const INITIAL_TIME_POWER_UPS = 3;
const QUESTIONS_PER_LEVEL = 10;
const SAVE_STREAK_MINIMUM = 5;


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
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [timePowerUps, setTimePowerUps] = useState(INITIAL_TIME_POWER_UPS);
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [difficulty, setDifficulty] = useState<Difficulty>('dynamic');


  // Session Stats
  const [bestStreak, setBestStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  const handleGuestSignIn = () => {
    initiateAnonymousSignIn(auth);
  };
  

  const getDifficultySettings = useCallback(() => {
    switch (difficulty) {
        case 'easy':
            // Simple, single-digit addition.
            return { range: 9, operator: '+' as Operator, level: 1 };
        case 'medium':
            // Mix of double-digit addition and simple multiplication.
            if (streak > 0 && streak % 3 === 0) { // Every 3rd question is multiplication
                 return { range: 12, operator: 'x' as Operator, level: 15 };
            }
            return { range: 75, operator: '+' as Operator, level: 10 };
        case 'dynamic':
        default:
            const level = Math.max(1, Math.floor(streak / 2) + 1); // Progress faster
            if (level <= 15) { // Addition levels (ramps up quickly)
                let range;
                if (level <= 3) range = 10;   // 1-digit
                else if (level <= 7) range = 50;  // 2-digit
                else range = 150; // 2-3 digit
                return { range, operator: '+' as Operator, level };
            } else { // Multiplication levels (starts earlier)
                let range;
                const mulLevel = level - 15;
                if (mulLevel <= 5) range = 12; // up to 12x12
                else if (mulLevel <= 10) range = 15; // up to 15x15
                else if (mulLevel <= 15) range = 20; // up to 20x20
                else range = 25; // up to 25x25
                return { range, operator: 'x' as Operator, level };
            }
    }
  }, [streak, difficulty]);

  const generateQuestion = useCallback(() => {
    const { range, operator } = getDifficultySettings();
    
    let num1, num2;
    let correctAnswer;
    
    if (operator === 'x') {
      num1 = Math.floor(Math.random() * (range - 2)) + 2; // Avoid 0, 1 for multiplication
      num2 = Math.floor(Math.random() * (range - 2)) + 2;
    } else {
      num1 = Math.floor(Math.random() * range) + 1;
      num2 = Math.floor(Math.random() * range) + 1;
    }
    correctAnswer = operator === '+' ? num1 + num2 : num1 * num2;


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
    setQuestionStartTime(Date.now());
  }, [getDifficultySettings]);
  
  const handleSaveScore = useCallback(async () => {
    if (user && !user.isAnonymous && user.displayName && score > 0) {
      addDocumentNonBlocking(collection(firestore, 'leaderboard'), {
        userId: user.uid,
        username: user.displayName,
        score: score,
        streak: streak,
        timestamp: new Date(),
      });
      toast({
        title: 'Score Saved!',
        description: 'Your new score has been added to the leaderboard.',
      });
    }
  }, [user, firestore, score, streak, toast]);


  const handleEndGame = useCallback(() => {
    handleSaveScore();
    setGameState('game-over');
  }, [handleSaveScore]);

  const handleTimeout = useCallback(() => {
    setScoreMultiplier(1);
    if (streak >= SAVE_STREAK_MINIMUM && difficulty === 'dynamic') { // Only offer to save on dynamic mode
      setGameState('save-streak');
    } else {
      handleEndGame();
    }
  }, [streak, difficulty, handleEndGame]);

  
  useEffect(() => {
    // This runs only once on mount, making the app client-side ready.
    setIsClient(true);
    
    // Load initial values from localStorage.
    setBestStreak(Number(localStorage.getItem('bestStreak') || '0'));
    
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    let currentDailyStreak = Number(localStorage.getItem('dailyStreak') || '0');

    if (lastPlayed) {
      const lastPlayedDate = new Date(lastPlayed);
      if (lastPlayedDate.toDateString() !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastPlayedDate.toDateString() !== yesterday.toDateString()) {
          currentDailyStreak = 0; // Reset if they missed a day
        }
      }
    } else {
        currentDailyStreak = 0;
    }
    setDailyStreak(currentDailyStreak);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !isClient) return;

    let animationFrameId: number;

    const updateTimer = () => {
        const elapsedTime = (Date.now() - questionStartTime) / 1000;
        const newTime = TIMER_SECONDS - elapsedTime;

        if (newTime <= 0) {
            setTimer(0);
            handleTimeout();
        } else {
            setTimer(newTime);
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
}, [gameState, isClient, questionStartTime, handleTimeout]);


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
    setTimePowerUps(INITIAL_TIME_POWER_UPS);
    generateQuestion();
    setGameState('playing');
  }, [generateQuestion, isClient]);

  const triggerHapticFeedback = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // This can happen if the user has vibration disabled in their device settings.
        console.warn('Haptic feedback failed.', e);
      }
    }
  };

  const handleAnswer = (isCorrect: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    const responseTime = TIMER_SECONDS - timer;
    setTotalQuestions(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);
     
    event.currentTarget.blur();

    if (isCorrect) {
      triggerHapticFeedback();
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
      triggerHapticFeedback([20, 20, 20]);
      setScoreMultiplier(1);
      if (streak >= SAVE_STREAK_MINIMUM && difficulty === 'dynamic') { // Only offer to save on dynamic mode
        setGameState('save-streak');
      } else {
        handleEndGame();
      }
    }
  };
  
  const handleContinueFromSave = () => {
    // In a real app, integrate an ad SDK and wait for the reward.
    generateQuestion();
    setGameState('playing');
  };
  
  const handleUseTimePowerUp = () => {
    if (timePowerUps > 0) {
      setQuestionStartTime(prev => prev + 5000);
      setTimePowerUps(prev => prev - 1);
      toast({
        title: "+5 Seconds!",
        description: "Time added to the clock.",
      });
    }
  };
  

  const renderContent = () => {
    if (!isClient) {
      return <LoadingScreen />;
    }
    if (isUserLoading) {
      return <LoadingScreen />;
    }
    if (!user) {
      return <AuthScreen onGuestSignIn={handleGuestSignIn} />;
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
            timePowerUps={timePowerUps}
            onUseTimePowerUp={handleUseTimePowerUp}
            difficultyLevel={getDifficultySettings().level}
          />
        );
      case 'save-streak':
        return (
          <SaveStreakScreen
            streak={streak}
            onSave={handleContinueFromSave}
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
            bestStreak={bestStreak}
            accuracy={accuracy}
            avgResponseTime={avgResponseTime}
            user={user}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onStart={startGame}
            dailyStreak={dailyStreak}
            bestStreak={bestStreak}
            user={user}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <div className="w-full max-w-md mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}
