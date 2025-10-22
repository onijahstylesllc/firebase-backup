
'use client'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="hidden font-bold font-headline text-lg sm:inline-block">DocuMind AI</span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</Link>
          <Link href="#solutions" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Solutions</Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Testimonials</Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
        </nav>
        <div className="hidden items-center space-x-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
          <Button asChild><Link href="/dashboard">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
        <MobileNav />
      </div>
    </header>
  )
}
