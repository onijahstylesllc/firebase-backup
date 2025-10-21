
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google';
import { supabase } from '@/lib/supabaseClient';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type AuthStep = 'email' | 'verify' | 'login';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const { toast } = useToast();

  const handleInitialAction = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address.',
      });
      return;
    }

    if (authStep === 'login') {
      handleLogin();
    } else {
      handleSendOtp();
    }
  };

  const handleSendOtp = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      toast({
        title: 'Code Sent',
        description: 'A verification code has been sent to your email.',
      });
      setAuthStep('verify');
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send Code',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Password Required',
        description: 'Please enter your password.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Login Error:', error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtpAndSignUp = async () => {
    if (!otp || otp.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code.',
      });
      return;
    }
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password Too Short',
        description: 'Your password must be at least 8 characters long.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      
      if (data.user) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      }

    } catch (error: any) {
      console.error('Verification/Sign-Up Error:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
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
  
  const isAnyProcessRunning = isProcessing || isGoogleProcessing;
  
  const getPageContent = () => {
    if (authStep === 'verify') {
      return {
        title: 'Verify Your Email',
        description: 'Enter the code sent to your email address and set your password.',
        buttonText: 'Create Account',
        action: handleVerifyOtpAndSignUp,
        backLink: (
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => setAuthStep('email')}
            disabled={isAnyProcessRunning}
          >
            Use a different email
          </Button>
        )
      };
    }

    if (authStep === 'email') {
      return {
        title: 'Create an Account',
        description: 'Enter your email to get started with DocuMind.',
        buttonText: 'Send Code',
        action: handleSendOtp,
        backLink: (
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => setAuthStep('login')}
            disabled={isAnyProcessRunning}
          >
            Already have an account? Login
          </Button>
        )
      };
    }

    return {
      title: 'Welcome Back',
      description: 'Enter your credentials to access your account.',
      buttonText: 'Login',
      action: handleLogin,
      backLink: (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => setAuthStep('email')}
          disabled={isAnyProcessRunning}
        >
          Don't have an account? Sign up
        </Button>
      )
    };
  };

  const { title, description, buttonText, action, backLink } = getPageContent();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl animate-fade-slide-up">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo className="h-10 w-auto text-primary" />
          </Link>
          <CardTitle className="text-2xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {authStep !== 'verify' && (
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
            )}
            
            {(authStep === 'login' || authStep === 'verify') && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authStep === 'login' ? 'current-password' : 'new-password'}
                  disabled={isAnyProcessRunning}
                />
              </div>
            )}
            
            {authStep === 'verify' && (
              <div className="grid gap-2 text-center">
                <Label htmlFor="otp">Verification Code</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isAnyProcessRunning}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}

            <Button onClick={authStep === 'login' ? handleLogin : (authStep === 'email' ? handleSendOtp : handleVerifyOtpAndSignUp)} className="w-full" disabled={isAnyProcessRunning}>
              {isProcessing ? <Loader2 className="animate-spin" /> : buttonText}
            </Button>
            
            {authStep !== 'verify' && (
              <>
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
              </>
            )}
          </div>
          <div className="mt-4 text-center text-sm">
            {backLink}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
