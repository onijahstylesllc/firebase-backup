
'use client'

import { Button } from '@/components/ui/button'
import { UploadCloud, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import TextType from '@/components/TextType';

export const LandingHero = () => {
  return (
    <section className="py-20 md:py-32 lg:py-40 relative">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-7xl/none">
              <TextType 
                text={["Text typing effect", "for your websites", "Happy coding!"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
                className="text-primary"
              />
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
              DocuMind AI is the world's first intelligent document workspace. Go beyond editing and leverage AI to analyze, create, and collaborate.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button size="lg" asChild><Link href="/dashboard">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Link href="/dashboard" className="w-full max-w-xl">
              <div className="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/40 hover:border-primary/80 transition-all duration-300 flex flex-col items-center justify-center text-center p-8 group">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 mb-4">
                  <UploadCloud className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Upload Document</h3>
                <p className="text-muted-foreground mt-2">
                  Drag & drop or click to upload your PDF, DOCX, or image file.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
