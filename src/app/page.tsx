
"use client";

import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { SaveStreakScreen } from '@/components/game/SaveStreakScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';

type GameState = 'welcome' | 'playing' | 'save-streak' | 'game-over';

type Question = {
  text: string;
  answers: { text: string; correct: boolean }[];
};

type Operator = '+' | 'x';

const TIMER_SECONDS = 10;
const PERFECT_STREAK_BONUS = 100;
const COMBO_MULTIPLIER_THRESHOLD = 5;
const INTERSTITIAL_AD_FREQUENCY = 2; // Show ad every 2 game overs
const INITIAL_TIME_POWER_UPS = 3;
const QUESTIONS_PER_LEVEL = 10;
const SAVE_STREAK_MINIMUM = 5;


// Function to trigger the ad manually and safely
const triggerOnClickAd = () => {
    try {
        if (window.onclick && typeof window.onclick === 'function') {
            window.onclick();
        } else {
            console.log("OnClick ad function not found on window object.");
        }
    } catch (e) {
        console.error("Failed to trigger OnClick ad:", e);
    }
};

declare global {
    interface Window {
        onclick?: () => void;
    }
}


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
  const [gameOverCount, setGameOverCount] = useState(0);
  const [timePowerUps, setTimePowerUps] = useState(INITIAL_TIME_POWER_UPS);
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();


  // Session Stats
  const [bestStreak, setBestStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  useEffect(() => {
    // Load the PropellerAds script once when the component mounts
    const script = document.createElement('script');
    script.dataset.zone = '10404875';
    script.src = 'https://al5sm.com/tag.min.js';
    script.async = true;

    // We only want to add it once
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.body.appendChild(script);
    }

    return () => {
      // Optional: Cleanup script on component unmount
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);


  const getDifficulty = useCallback(() => {
    const level = Math.max(1, Math.floor(streak / QUESTIONS_PER_LEVEL) + 1);

    if (level <= 20) { // Addition levels
        let range;
        if (level <= 5) range = 10;
        else if (level <= 10) range = 25;
        else if (level <= 15) range = 50;
        else range = 100;
        return { range, operator: '+' as Operator, level: Math.min(level, 40) };
    } else { // Multiplication levels
        let range;
        const mulLevel = level - 20;
        if (mulLevel <= 5) range = 10;       // e.g., 8x9
        else if (mulLevel <= 10) range = 12; // e.g., 11x12
        else if (mulLevel <= 15) range = 15; // e.g., 13x14
        else range = 20;                     // e.g., 18x19
        return { range, operator: 'x' as Operator, level: Math.min(level, 40) };
    }
  }, [streak]);

  const generateQuestion = useCallback(() => {
    const { range, operator } = getDifficulty();
    
    let num1, num2;
    // Use a while loop to ensure we get a non-trivial question
    let correctAnswer;
    do {
      if (operator === 'x') {
        num1 = Math.floor(Math.random() * (range - 1)) + 2; // Avoid 0 and 1 for multiplication
        num2 = Math.floor(Math.random() * (range - 1)) + 2;
      } else {
        num1 = Math.floor(Math.random() * range) + 1;
        num2 = Math.floor(Math.random() * range) + 1;
      }
      correctAnswer = operator === '+' ? num1 + num2 : num1 * num2;
    } while (correctAnswer <= 1 || (num1 === 1 && num2 === 1));


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
  }, [getDifficulty]);

  const handleTimeout = useCallback(() => {
    setScoreMultiplier(1);
    if (streak >= SAVE_STREAK_MINIMUM) {
      setGameState('save-streak');
    } else {
      handleEndGame();
    }
  }, [streak]);

  const handleEndGame = () => {
    triggerOnClickAd(); // Trigger the ad when the game officially ends.
    const newGameOverCount = gameOverCount + 1;
    setGameOverCount(newGameOverCount);
    localStorage.setItem('gameOverCount', String(newGameOverCount));
    setGameState('game-over');
  };
  
  useEffect(() => {
    // This runs only once on mount, making the app client-side ready.
    setIsClient(true);
    
    // Load initial values from localStorage.
    setBestStreak(Number(localStorage.getItem('bestStreak') || '0'));
    setGameOverCount(Number(localStorage.getItem('gameOverCount') || '0'));
    
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

  const triggerHapticFeedback = (pattern: number | number[] = 100) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // This can happen if the user has vibration disabled in their device settings.
        console.warn('Haptic feedback failed.', e);
      }
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const responseTime = TIMER_SECONDS - timer;
    setTotalQuestions(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

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
      setScoreMultiplier(1);
      if (streak >= SAVE_STREAK_MINIMUM) {
        setGameState('save-streak');
      } else {
        handleEndGame();
      }
    }
  };
  
  const handleSaveStreak = () => {
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
  
  const handleSaveScore = (username: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be signed in to save your score.',
      });
      return;
    }
    if (!username) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please enter a username.',
        });
        return;
      }
  
    const leaderboardRef = collection(firestore, 'leaderboard');
    addDocumentNonBlocking(leaderboardRef, {
      userId: user.uid,
      username: username,
      score: score,
      streak: streak,
      timestamp: new Date(),
    });
    
    // also update the user's display name
    const userRef = doc(firestore, 'users', user.uid);
    setDoc(userRef, { id: user.uid, username }, { merge: true });

    toast({
      title: 'Score Saved!',
      description: 'Your score has been added to the leaderboard.',
    });
  };

  const renderContent = () => {
    if (!isClient || isUserLoading) {
      return (
        <div className="w-full max-w-md mx-auto">
          <Skeleton className="h-[96px] w-full mb-6" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )
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
            difficultyLevel={getDifficulty().level}
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
            bestStreak={bestStreak}
            accuracy={accuracy}
            avgResponseTime={avgResponseTime}
            onSaveScore={handleSaveScore}
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
