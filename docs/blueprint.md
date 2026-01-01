# **App Name**: Streakrpro

## Core Features:

- Math Question Generation: Generate random math questions based on addition of 2 numbers from 1–10.
- Multiple-Choice Answer Display: Display four multiple-choice answers with one correct answer.
- Score and Streak Tracking: Increase score by 10 and streak by 1 for correct answers. Reset streak on wrong answers or timer expiry.
- Timer Countdown: Implement a 5-second timer per question with a visual progress bar. Reset timer on each question.
- Rewarded Ad Integration: Show 'Save Your Streak?' screen on failure with options to watch an ad or end the game. Simulate rewarded ad completion to continue.
- Game Over Flow: Display final score, final streak, and an interstitial ad placeholder after the game ends. Include a 'Play Again' button.
- Daily Streak System: Track consecutive days played using localStorage. Increase daily streak if player returns the next day; reset if a day is missed. Display daily streak prominently.

## Style Guidelines:

- Primary color: Dark, professional blue (#293B73) to evoke focus and intensity.
- Background color: Very dark desaturated blue (#1A1F33) for a dark, focused theme.
- Accent color: A vivid orange (#E07A37) to contrast against the background and call attention to important elements like answer buttons and CTAs.
- Body and headline font: 'Inter' (sans-serif) for a modern, neutral, and readable appearance. Note: currently only Google Fonts are supported.
- Minimalist layout optimized for mobile screens with large, touch-friendly buttons and safe zones for ad placements.
- Smooth transitions between questions and screens to enhance the user experience.
- Use clear and simple icons for the daily streak display and other UI elements.