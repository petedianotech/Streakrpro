'use client';
import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ username: string }>(userDocRef);

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
    if (!user || !username) {
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
        
        // Release old username if it exists
        if (userData?.username) {
            const oldUsernameLower = userData.username.toLowerCase();
            const oldUsernameRef = doc(firestore, 'usernames', oldUsernameLower);
            batch.delete(oldUsernameRef);
        }

        // Reserve new username
        batch.set(newUsernameRef, { userId: user.uid });

        // Update user document
        const userRef = doc(firestore, 'users', user.uid);
        batch.set(userRef, { username: username }, { merge: true });

        // Update auth profile
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

  if (isUserLoading || isUserDataLoading || !user) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleUpdateProfile}>
            <Card>
            <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            </Card>
        </form>
      </div>
    </main>
  );
}
