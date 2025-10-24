
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from '@/components/icons/google';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type AuthStep = 'login' | 'signup' | 'verify' | 'forgot-password' | 'update-password';

const AuthLayout = ({ image, children }: { image: React.ReactNode, children: React.ReactNode }) => (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        <div className="flex items-center justify-center py-12">
            {children}
        </div>
        <div className="hidden bg-primary lg:flex items-center justify-center p-8 text-primary-foreground">
            {image}
        </div>
    </div>
);

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'update-password') {
        setAuthStep('update-password');
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthStep('update-password');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSendOtp = async (email: string) => {
    setIsProcessing(true);
    setEmail(email);
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

  const handleLogin = async (email: string, password: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Redirect will be handled by Supabase auth listener in a different component
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

  const handleVerifyOtpAndSignUp = async (otp: string, password: string) => {
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
      // Redirect will be handled by Supabase auth listener
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
      setIsGoogleProcessing(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
      if (error) throw error;
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a link to reset your password.'
      });
      setAuthStep('login');
    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        toast({
            variant: 'destructive',
            title: 'Failed to Send Reset Link',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleUpdatePassword = async (password: string) => {
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
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast({
            title: 'Password Updated',
            description: 'Your password has been successfully updated.',
        });
        setAuthStep('login');
    } catch (error: any) {
        console.error('Update Password Error:', error);
        toast({
            variant: 'destructive',
            title: 'Failed to Update Password',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const isAnyProcessRunning = isProcessing || isGoogleProcessing;

  const renderForm = () => {
    switch (authStep) {
        case 'login':
            return (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={isAnyProcessRunning} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Button variant="link" className="ml-auto inline-block text-sm p-0 h-auto" onClick={() => setAuthStep('forgot-password')}>Forgot your password?</Button>
                        </div>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' disabled={isAnyProcessRunning} />
                    </div>
                    <Button onClick={() => handleLogin(email, password)} className="w-full" disabled={isAnyProcessRunning}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Login'}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isAnyProcessRunning}>
                        {isGoogleProcessing ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-4 w-4" /> Google</>}
                    </Button>
                </div>
            );
        case 'signup':
            return (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={isAnyProcessRunning} />
                    </div>
                    <Button onClick={() => handleSendOtp(email)} className="w-full" disabled={isAnyProcessRunning}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Continue'}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with</span></div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isAnyProcessRunning}>
                        {isGoogleProcessing ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-4 w-4" /> Google</>}
                    </Button>
                </div>
            );
        case 'verify':
            return (
                <div className="grid gap-4">
                    <div className="grid gap-2 text-center">
                        <Label htmlFor="otp">Verification Code</Label>
                        <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isProcessing}>
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
                    <div className="grid gap-2">
                        <Label htmlFor="password">Set Your Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='new-password' disabled={isProcessing} />
                    </div>
                    <Button onClick={() => handleVerifyOtpAndSignUp(otp, password)} className="w-full" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </Button>
                </div>
            );
        case 'forgot-password':
            return (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={isProcessing} />
                    </div>
                    <Button onClick={() => handleForgotPassword(email)} className="w-full" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                    </Button>
                </div>
            );
        case 'update-password':
                return (
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='new-password' disabled={isProcessing} />
                        </div>
                        <Button onClick={() => handleUpdatePassword(password)} className="w-full" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Update Password'}
                        </Button>
                    </div>
                );
    }
  };
  
  const getPageContent = () => {
    switch (authStep) {
      case 'signup':
        return {
          title: 'Create an Account',
          description: 'Enter your email to get started with DocuMind.',
          backLink: (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setAuthStep('login')}
            >
              Already have an account? Login
            </Button>
          )
        };
      case 'verify':
        return {
          title: 'Verify Your Email',
          description: `Enter the code sent to ${email} and set your password.`,
          backLink: (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setAuthStep('signup')}
            >
              Use a different email
            </Button>
          )
        };
      case 'forgot-password':
        return {
          title: 'Forgot Password',
          description: 'Enter your email to receive a password reset link.',
          backLink: (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setAuthStep('login')}
            >
              Back to Login
            </Button>
          )
        };
        case 'update-password':
            return {
              title: 'Update Password',
              description: 'Enter your new password.',
              backLink: (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setAuthStep('login')}
                >
                  Back to Login
                </Button>
              )
            };
      default: // login
        return {
          title: 'Welcome Back',
          description: 'Enter your credentials to access your account.',
          backLink: (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setAuthStep('signup')}
            >
              Don't have an account? Sign up
            </Button>
          )
        };
    }
  };

  const { title, description, backLink } = getPageContent();
  
  const Testimonial = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const testimonials = [
        {
            quote: "“This platform has saved me countless hours of work and helped me deliver results faster than ever before.”",
            author: "Jane Doe",
            title: "CEO, Innovate Inc."
        },
        {
            quote: "“The intuitive interface and powerful features make managing my documents a breeze. I can't imagine working without it.”",
            author: "John Smith",
            title: "Project Manager, Tech Solutions"
        },
        {
            quote: "“DocuMind has revolutionized our workflow. The AI-powered insights are a game-changer for our team.”",
            author: "Emily White",
            title: "Lead Analyst, Data Insights Co."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
                setIsFading(false);
            }, 1000); // Fade-out duration
        }, 7000); // Time each testimonial is displayed

        return () => clearInterval(timer);
    }, []);

    const { quote, author, title } = testimonials[currentIndex];

    return (
        <div className="flex flex-col justify-between h-full">
            <Link href="/" className="inline-block mb-4">
                <Logo className="h-10 w-auto text-primary-foreground" />
            </Link>
            <div className={`text-lg transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <blockquote className="text-2xl font-semibold leading-snug">
                    {quote}
                </blockquote>
                <footer className="mt-4">
                    <p className="font-semibold">{author}</p>
                    <p className="text-sm">{title}</p>
                </footer>
            </div>
        </div>
    )
  }

  return (
    <AuthLayout image={<Testimonial />}>
        <Card className="w-full max-w-sm shadow-none border-none">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {renderForm()}
                <div className="mt-4 text-center text-sm">
                    {backLink}
                </div>
            </CardContent>
        </Card>
    </AuthLayout>
  );
}
