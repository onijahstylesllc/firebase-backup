'use client'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden ml-auto">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="grid gap-6 text-lg font-medium mt-8">
          <Link href="/" className="flex items-center gap-2"><Logo className="h-6 w-6 text-primary" /><span className="font-bold">DocuMind AI</span></Link>
          <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="#solutions" className="text-muted-foreground hover:text-foreground">Solutions</Link>
          <Link href="#testimonials" className="text-muted-foreground hover:text-foreground">Testimonials</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <div className="border-t pt-6 flex flex-col gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
            <Button asChild><Link href="/dashboard">Get Started</Link></Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
