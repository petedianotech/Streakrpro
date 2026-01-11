
'use client';
import { useState, useEffect } from 'react';
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
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';
import { Home } from 'lucide-react';
import Link from 'next/link';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 55.5l-67.8 67.8C314.6 94.6 282.4 80 248 80c-82.6 0-150 67.4-150 150s67.4 150 150 150c94.2 0 135.3-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);


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
  
  const findAvailableUsername = async (baseUsername: string): Promise<string> => {
    let username = baseUsername;
    let isAvailable = false;
    let attempts = 0;
    while (!isAvailable && attempts < 10) {
      const usernameRef = doc(firestore, 'usernames', username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);
      if (!usernameDoc.exists()) {
        isAvailable = true;
      } else {
        username = `${baseUsername}${Math.floor(Math.random() * 100)}`;
      }
      attempts++;
    }
     if (!isAvailable) {
      return `${baseUsername}${Date.now().toString().slice(-5)}`;
    }
    return username;
  };

  const handleUserCreation = async (user: User, username: string | null) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      let finalUsername = username;
      if (!finalUsername) {
        finalUsername = user.displayName?.split(' ')[0] || `user${Date.now().toString().slice(-5)}`;
      }
      
      const availableUsername = await findAvailableUsername(finalUsername);
      await updateProfile(user, { displayName: availableUsername });
      
      const batch = writeBatch(firestore);
      batch.set(userRef, { id: user.uid, username: availableUsername });
      const usernameRef = doc(firestore, 'usernames', availableUsername.toLowerCase());
      batch.set(usernameRef, { userId: user.uid });
      await batch.commit();
    }
  }


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signUpUsername) {
      toast({ variant: 'destructive', title: 'Username is required.' });
      setIsLoading(false);
      return;
    }
    
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
      await handleUserCreation(userCredential.user, signUpUsername);
      
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
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await handleUserCreation(result.user, result.user.displayName);
        toast({ title: 'Signed in with Google!', description: 'Welcome to Streakrpro!' });
        router.push('/');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
        }
    } finally {
        setIsLoading(false);
    }
  };

  
  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
        <div className="absolute top-4 right-4">
            <Button asChild variant="outline">
                <Link href="/"><Home className="mr-2" /> Back to Home</Link>
            </Button>
        </div>
      <div className="w-full max-w-sm space-y-6">
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? 'Signing in...' : <><GoogleIcon /> Sign in with Google</>}
        </Button>
        
        <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-sm text-muted-foreground">OR</span>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login with Email</TabsTrigger>
            <TabsTrigger value="signup">Sign Up with Email</TabsTrigger>
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
      </div>
    </main>
  );
}
