
'use client';
import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, getDoc, writeBatch, deleteDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, deleteUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Flame, Star, Target, BarChart, Trophy, History } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart as BarChartComponent, CartesianGrid, XAxis } from 'recharts';

type UserData = {
    username: string;
    dailyChallengeCompletions?: string[];
    stats?: {
        totalScore: number;
        gamesPlayed: number;
        bestStreak: number;
        averageScore: number;
    }
}

type GameHistoryEntry = {
    score: number;
    timestamp: { seconds: number };
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const gameHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'gameHistory'), orderBy('timestamp', 'desc'), limit(10));
  }, [user, firestore]);
  const { data: gameHistory, isLoading: isHistoryLoading } = useCollection<GameHistoryEntry>(gameHistoryQuery);


  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [password, setPassword] = useState('');
  
  const providerId = user?.providerData[0]?.providerId;

  const chartData = useMemoFirebase(() => {
    if (!gameHistory) return [];
    return [...gameHistory].reverse().map((game, index) => ({
        game: `Game ${index + 1}`,
        score: game.score,
    }));
  }, [gameHistory]);

  useEffect(() => {
    if (userData?.username) {
      setUsername(userData.username);
    } else if (user?.displayName) {
      setUsername(user.displayName);
    }
  }, [userData, user]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Username cannot be empty.' });
        return;
    }
    
    if (username === (userData?.username || user.displayName)) {
        toast({ title: 'No changes', description: 'Your username is already set to that.' });
        return;
    }

    setIsLoading(true);
    
    const newUsernameLower = username.toLowerCase();
    const newUsernameRef = doc(firestore, 'usernames', newUsernameLower);
    
    try {
        const usernameDoc = await getDoc(newUsernameRef);
        if (usernameDoc.exists()) {
            toast({ variant: 'destructive', title: 'Username taken', description: 'Please choose another username.' });
            setIsLoading(false);
            return;
        }

        const batch = writeBatch(firestore);
        
        const oldUsername = userData?.username || user?.displayName;
        if (oldUsername) {
            const oldUsernameLower = oldUsername.toLowerCase();
            const oldUsernameRef = doc(firestore, 'usernames', oldUsernameLower);
            batch.delete(oldUsernameRef);
        }

        batch.set(newUsernameRef, { userId: user.uid });

        const userRef = doc(firestore, 'users', user.uid);
        batch.set(userRef, { username: username }, { merge: true });

        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: username });
        }
        
        await batch.commit();

        toast({ title: 'Profile updated!', description: 'Your username has been changed.' });

    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: 'destructive', title: 'Update failed', description: 'Could not update your profile. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;

    setIsDeleting(true);

    try {
        if (providerId === 'password' && password) {
            const credential = EmailAuthProvider.credential(user.email!, password);
            await reauthenticateWithCredential(user, credential);
        } else if (deleteConfirmation.toLowerCase() !== 'delete') {
             toast({ variant: 'destructive', title: 'Confirmation failed', description: 'Please type "delete" to confirm.' });
             setIsDeleting(false);
             return;
        }

      if (providerId === 'google.com' && deleteConfirmation.toLowerCase() === 'delete') {
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
      }
      
      const batch = writeBatch(firestore);
      const userRef = doc(firestore, "users", user.uid);
      const currentUsername = userData?.username || user.displayName;
      if (currentUsername) {
        const usernameRef = doc(firestore, "usernames", currentUsername.toLowerCase());
        batch.delete(usernameRef);
      }
      batch.delete(userRef);
      await batch.commit();

      await deleteUser(user);

      toast({ title: 'Account Deleted', description: 'Your account has been successfully deleted.' });
      router.push('/');
    
    } catch (error: any) {
        console.error("Error deleting account:", error);
        let description = 'An error occurred. Please try again.';
        if (error.code === 'auth/wrong-password') {
            description = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/requires-recent-login') {
            description = 'For security, please sign in again before deleting your account.';
        }
        toast({ variant: 'destructive', title: 'Deletion Failed', description });
    } finally {
        setIsDeleting(false);
    }
  };

  const StatCard = ({ icon, label, value, unit, isLoading }: { icon: React.ReactNode, label: string, value: string | number, unit?: string, isLoading: boolean }) => (
      <Card className="flex-1 text-center p-4">
        {isLoading ? <Skeleton className="h-10 w-20 mx-auto" /> : (
            <>
                <div className="flex justify-center items-center gap-2 text-muted-foreground">{icon}<span>{label}</span></div>
                <p className="text-3xl font-bold">{value}{unit && <span className="text-base font-normal">{unit}</span>}</p>
            </>
        )}
      </Card>
  );

  if (isUserLoading || isUserDataLoading || !user) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </main>
    )
  }

  const stats = userData?.stats;
  const isStatsLoading = isUserDataLoading || !stats;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold font-headline">Your Profile & Stats</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={<Star />} label="Total Score" value={stats?.totalScore?.toLocaleString() ?? 0} isLoading={isStatsLoading} />
            <StatCard icon={<Trophy />} label="Best Streak" value={stats?.bestStreak ?? 0} isLoading={isStatsLoading} />
            <StatCard icon={<Target />} label="Avg. Score" value={stats?.averageScore?.toFixed(0) ?? 0} isLoading={isStatsLoading} />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Recent Games</CardTitle>
                <CardDescription>Your scores from the last 10 games played.</CardDescription>
            </CardHeader>
            <CardContent>
                {isHistoryLoading ? <Skeleton className="h-48 w-full" /> : gameHistory && gameHistory.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                        <BarChartComponent accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="game" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                        </BarChartComponent>
                    </ChartContainer>
                ) : <p className="text-muted-foreground text-center py-8">Play some games to see your history!</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your display name and other settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email || 'Not provided'} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your display name"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              This action is irreversible. All your data will be permanently deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete My Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    To confirm, please 
                    {providerId === 'password' ? ' enter your password OR type "delete" below.' : ' type "delete" below.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  {providerId === 'password' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password-confirm">Password (if remembered)</Label>
                        <Input
                          id="password-confirm"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OR</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirm">Type "delete" to confirm</Label>
                        <Input
                          id="delete-confirm"
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="delete"
                        />
                      </div>
                    </>
                  ) : (
                     <div className="space-y-2">
                      <Label htmlFor="delete-confirm">Type "delete" to confirm</Label>
                      <Input
                        id="delete-confirm"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="delete"
                      />
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

    