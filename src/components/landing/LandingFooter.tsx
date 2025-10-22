
'use client'

import Link from 'next/link'

export const LandingFooter = () => {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t bg-muted/40 px-4 py-6 sm:flex-row md:px-6">
      <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} DocuMind AI. All rights reserved.</p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
      </nav>
    </footer>
  )
}
