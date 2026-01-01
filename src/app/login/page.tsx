'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signUpUsername) {
      toast({ variant: 'destructive', title: 'Username is required.' });
      setIsLoading(false);
      return;
    }
    
    // Check for username uniqueness
    const usernameRef = doc(firestore, 'usernames', signUpUsername.toLowerCase());
    const usernameDoc = await getDoc(usernameRef);

    if (usernameDoc.exists()) {
        toast({
            variant: 'destructive',
            title: 'Username taken',
            description: 'This username is already in use. Please choose another one.',
        });
        setIsLoading(false);
        return;
    }


    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );
      await updateProfile(userCredential.user, { displayName: signUpUsername });
      
      // Create user document and reserve username
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, { id: userCredential.user.uid, username: signUpUsername });
      await setDoc(usernameRef, { userId: userCredential.user.uid });
      
      toast({ title: 'Sign up successful!', description: "You're now logged in." });
      router.push('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast({ variant: 'destructive', title: 'Sign up failed', description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast({ title: 'Login successful!', description: "Welcome back!"});
      router.push('/');
    } catch (error) {
       if (error instanceof FirebaseError) {
        toast({ variant: 'destructive', title: 'Login failed', description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (user && !user.isAnonymous) router.push('/');


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Access your account to see your saved scores and streaks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}/>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to save your scores and compete on the leaderboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input id="signup-username" type="text" placeholder="Your Name" required value={signUpUsername} onChange={e => setSignUpUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="m@example.com" required value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" required value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create Account'}</Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </main>
  );
}
