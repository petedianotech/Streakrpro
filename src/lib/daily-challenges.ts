
import { collection, getDocs, query, where, limit, Firestore } from "firebase/firestore";

export type DailyChallenge = {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    reward: number;
    type: 'streak' | 'score';
    target: number;
}

// These are example challenges. In a real app, you'd have a system to generate these.
const challenges: Omit<DailyChallenge, 'id' | 'date'>[] = [
    { description: "Achieve a streak of 10", reward: 100, type: 'streak', target: 10 },
    { description: "Score 500 points in one game", reward: 150, type: 'score', target: 500 },
    { description: "Achieve a streak of 15", reward: 200, type: 'streak', target: 15 },
    { description: "Score 1000 points in one game", reward: 250, type: 'score', target: 1000 },
    { description: "Achieve a streak of 20", reward: 300, type: 'streak', target: 20 },
    { description: "Score 1500 points in one game", reward: 350, type: 'score', target: 1500 },
    { description: "Achieve a streak of 25", reward: 400, type: 'streak', target: 25 },
];

/**
 * Gets a pseudo-random challenge for a given date.
 * This is deterministic: the same date will always return the same challenge.
 */
export function getChallengeForDate(date: Date): Omit<DailyChallenge, 'id' | 'date'> {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % challenges.length;
    return challenges[index];
}

/**
 * Fetches today's challenge from Firestore.
 * If it doesn't exist, it creates it.
 */
export async function getTodayChallenge(db: Firestore): Promise<DailyChallenge | null> {
    if (!db) return null;
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const challengesCol = collection(db, 'daily_challenges');
    const q = query(challengesCol, where('date', '==', dateString), limit(1));

    try {
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as DailyChallenge;
        } else {
            // No challenge for today, let's create one (if we were an admin client)
            // For now, we'll just log this. In a real app, a backend function
            // would populate these daily. For this project, you may need to add one
            // manually to your Firestore console for today's date.
            console.log(`No daily challenge found for ${dateString}. Please create one in Firestore.`);
            console.log('Example Document in /daily_challenges:');
            const newChallengeData = getChallengeForDate(today);
            console.log({
                date: dateString,
                description: newChallengeData.description,
                reward: newChallengeData.reward,
                type: newChallengeData.type,
                target: newChallengeData.target,
            });

            return null;
        }
    } catch (error) {
        console.error("Error getting daily challenge:", error);
        return null;
    }
}
