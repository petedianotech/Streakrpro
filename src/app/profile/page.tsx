'use client';
import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, getDoc, writeBatch, deleteDoc } from 'firebase/firestore';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [password, setPassword] = useState('');
  
  const providerId = user?.providerData[0]?.providerId;

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

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;

    setIsDeleting(true);

    try {
      // Step 1: Re-authenticate user
      if (providerId === 'password' && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerId === 'google.com') {
         if (deleteConfirmation !== 'delete') {
            toast({ variant: 'destructive', title: 'Confirmation failed', description: 'Please type "delete" to confirm.' });
            setIsDeleting(false);
            return;
        }
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
      }
      
      // Step 2: Delete Firestore data
      const batch = writeBatch(firestore);
      const userRef = doc(firestore, "users", user.uid);
      if (userData?.username) {
        const usernameRef = doc(firestore, "usernames", userData.username.toLowerCase());
        batch.delete(usernameRef);
      }
      batch.delete(userRef);
      await batch.commit();

      // Step 3: Delete user from Auth
      await deleteUser(user);

      toast({ title: 'Account Deleted', description: 'Your account has been successfully deleted.' });
      router.push('/'); // Redirect to home page
    
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
      <div className="w-full max-w-md space-y-6">
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

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              This action is irreversible. All your data, including your leaderboard scores, will be permanently deleted.
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
                    This action cannot be undone. To confirm, please
                    {providerId === 'password' ? ' enter your password.' : ' type "delete" below.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  {providerId === 'password' ? (
                    <div className="space-y-2">
                      <Label htmlFor="password-confirm">Password</Label>
                      <Input
                        id="password-confirm"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
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
