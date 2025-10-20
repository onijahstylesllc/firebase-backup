
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useFirebase, useUser } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google';

export default function LoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAuthAction = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication service not ready.",
            description: "Please wait a moment and try again.",
        });
        return;
    }

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both your email and password.',
      });
      return;
    }

    setIsProcessing(true);
    try {
        if (isSigningUp) {
          await initiateEmailSignUp(auth, email, password);
          toast({
            title: "Check your email",
            description: "A verification link has been sent to your email address.",
          });
          // Don't redirect on signup, let them verify first.
        } else {
          await initiateEmailSignIn(auth, email, password);
          // Redirect will be handled by the useEffect hook
        }
    } catch (error: any) {
        console.error('Email/Password Auth Error:', error);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsGoogleProcessing(true);
    try {
      await initiateGoogleSignIn(auth);
      // Redirect will be handled by the useEffect hook
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'Could not sign in with Google.',
      });
    } finally {
      setIsGoogleProcessing(false);
    }
  };
  
  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    )
  }

  const isAnyProcessRunning = isProcessing || isGoogleProcessing;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl animate-fade-slide-up">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-10 w-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-headline">
            {isSigningUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSigningUp
              ? 'Enter your details to get started with DocuMind.'
              : 'Enter your credentials to access your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isAnyProcessRunning}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSigningUp ? "new-password" : "current-password"}
                    disabled={isAnyProcessRunning}
                />
            </div>
            <Button onClick={handleAuthAction} className="w-full" disabled={isAnyProcessRunning}>
              {isProcessing ? <Loader2 className="animate-spin" /> : (isSigningUp ? 'Sign Up' : 'Login')}
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isAnyProcessRunning}>
              {isGoogleProcessing ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-4 w-4" /> Google</>}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSigningUp(!isSigningUp)}
              disabled={isAnyProcessRunning}
            >
              {isSigningUp ? 'Login' : 'Sign up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
