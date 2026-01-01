'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Star, Flame } from 'lucide-react';
import { Card } from '../ui/card';

type LeaderboardEntry = {
  id: string;
  username: string;
  score: number;
  streak: number;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
};

export function Leaderboard() {
  const firestore = useFirestore();
  
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(20)
    );
  }, [firestore]);

  const { data: leaderboard, isLoading, error } = useCollection<LeaderboardEntry>(leaderboardQuery);

  const renderRank = (rank: number) => {
    if (rank < 3) {
      const colors = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];
      return <Award className={`w-6 h-6 ${colors[rank]}`} />;
    }
    return <span className="font-bold">{rank + 1}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">Error: Could not load leaderboard. Please try again later.</p>;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <p className="text-muted-foreground text-center">No scores yet. Be the first!</p>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Streak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry, index) => (
            <TableRow key={entry.id}>
              <TableCell className="text-center">{renderRank(index)}</TableCell>
              <TableCell className="font-medium">{entry.username}</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                <Star className="w-4 h-4 text-primary" />
                {entry.score}
              </TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                <Flame className="w-4 h-4 text-accent" />
                {entry.streak}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
