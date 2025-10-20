'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import {
  ArrowRight,
  Check,
  Menu,
  Zap,
  LineChart,
  BrainCircuit,
  MessageSquare,
  BookCopy,
  Scale,
  Briefcase,
  Target,
  GraduationCap,
  User,
  Star,
  Gavel,
  Calculator,
  Edit,
  Signature,
  FileCog,
  Combine,
  Split,
  Minimize,
  ScanText,
  Sparkles,
  FileEdit,
  Languages,
  Landmark,
  Home,
  Building,
  FileCheck,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestimonialCarouselSkeleton } from '@/components/landing/testimonial-carousel-skeleton'

const TestimonialCarousel = dynamic(
  () => import('@/components/landing/testimonial-carousel').then(mod => mod.TestimonialCarousel),
  {
    ssr: false,
    loading: () => <TestimonialCarouselSkeleton />,
  }
)

const mainTools = [
  { icon: Edit, title: 'Edit PDF', description: 'Edit text, rearrange, or replace content.', href: '/documents' },
  { icon: Signature, title: 'Sign PDF', description: 'Draw or upload your signature.', href: '/documents' },
  { icon: FileCog, title: 'Convert PDF', description: 'To/from DOCX, JPG, PNG, etc.', href: '/convert' },
  { icon: Combine, title: 'Merge PDFs', description: 'Combine multiple files into one.', href: '/merge' },
  { icon: Split, title: 'Split PDF', description: 'Extract pages from a document.', href: '/split' },
  { icon: Minimize, title: 'Compress PDF', description: 'Reduce file size for easy sharing.', href: '/compress' },
  { icon: ScanText, title: 'OCR & Scan Text', description: 'Convert scans into editable text.', href: '/analyze' },
  { icon: Sparkles, title: 'AI Summarize', description: 'Generate instant summaries.', href: '/analyze' },
  { icon: MessageSquare, title: 'Ask-the-PDF', description: 'Chat with your document.', href: '/documents' },
  { icon: Gavel, title: 'Legal Checker', description: 'Analyze contracts for risks.', href: '/legal' },
  { icon: FileEdit, title: 'Rewrite Text', description: 'Improve tone, clarity, and style.', href: '/rewrite' },
  { icon: Languages, title: 'Translate Text', description: 'Into any language, instantly.', href: '/translate' },
]

const features = [
  { icon: MessageSquare, title: 'AI-Powered Chat', description: 'Find information, get answers, and understand complex data in seconds.' },
  { icon: Sparkles, title: 'Intelligent Summaries', description: 'Turn dense reports into concise, actionable summaries.' },
  { icon: Users, title: 'Team Collaboration', description: 'Work together in real-time with AI assistance.' },
  { icon: BrainCircuit, title: 'Automated Compliance', description: 'Check documents against policies automatically.' },
  { icon: BookCopy, title: 'Custom Templates', description: 'Create and save reusable templates.' },
  { icon: Zap, title: 'Advanced Security', description: 'Enterprise-grade security and encryption.' },
]

const teamFeatures = [
  { icon: Edit, title: 'Real-Time Co-Editing', description: 'Work on the same document simultaneously.' },
  { icon: MessageSquare, title: 'AI-Powered Comments', description: 'Get AI suggestions for task assignment.' },
  { icon: FileCheck, title: 'Secure Sharing', description: 'Control permissions for viewers and editors.' },
  { icon: BookCopy, title: 'Shared Templates', description: 'Maintain brand consistency with templates.' },
]

const useCases = [
  { icon: Scale, title: 'Legal Professionals', benefits: ['Analyze contracts for risks', 'Summarize case law quickly', 'Automate compliance checks', 'Find clauses instantly'] },
  { icon: Target, title: 'Marketing Teams', benefits: ['Ensure brand consistency', 'Generate campaign ideas', 'Summarize market research', 'Rewrite copy instantly'] },
  { icon: GraduationCap, title: 'Students & Academics', benefits: ['Accelerate literature reviews', 'AI essay assistance', 'Check formatting guidelines', 'Create study guides'] },
  { icon: User, title: 'Freelancers', benefits: ['Review client contracts', 'Organize documents', 'Draft professional emails', 'Extract invoice details'] },
  { icon: Star, title: 'Creatives', benefits: ['Analyze scripts', 'Review contracts', 'Manage press kits', 'Brainstorm content'] },
  { icon: Briefcase, title: 'Business', benefits: ['Create proposals', 'Generate meeting summaries', 'Analyze financial reports', 'Streamline onboarding'] },
]

const solutions = {
  industries: [
    { icon: Landmark, title: 'Financial Services', description: 'Enhance compliance and accelerate onboarding.' },
    { icon: FileCheck, title: 'Insurance', description: 'Streamline claims processing.' },
    { icon: Home, title: 'Real Estate', description: 'Manage contracts and leases.' },
    { icon: Building, title: 'Government', description: 'Improve records management.' },
  ],
  businessSizes: [
    { icon: Building, title: 'Enterprise', description: 'Scalable AI solutions for complex workflows.' },
    { icon: Briefcase, title: 'SMB', description: 'Powerful, affordable AI tools.' },
    { icon: User, title: 'Individuals', description: 'Organize personal documents.' },
  ],
}

const pricingTiers = [
  { name: 'Free', price: '$0', description: 'For individuals and personal use.', features: ['Up to 3 documents', 'Basic AI tools', 'Standard collaboration'], cta: 'Start for Free' },
  { name: 'Pro', price: '$15', priceDetail: '/ user / month', description: 'For professionals and small teams.', features: ['Unlimited documents', 'Advanced AI tools', 'Team collaboration', 'Priority support'], cta: 'Upgrade to Pro', isFeatured: true },
  { name: 'Enterprise', price: 'Custom', description: 'For large organizations.', features: ['Custom AI models', 'Dedicated infrastructure', 'Advanced security', '24/7 support'], cta: 'Contact Sales' },
]

const howItWorksSteps = [
  { step: 1, title: 'Upload Any Document', description: 'Drag and drop any PDF, DOCX, or image. AI instantly structures the content.' },
  { step: 2, title: 'AI Analysis Begins', description: 'Scans for key entities, clauses, and risks in seconds.' },
  { step: 3, title: 'Command Your Document', description: 'Ask for summaries, translations, or compliance checks.' },
]

const aiToolkit = [
  { icon: LineChart, title: 'Analyze Anything', description: 'Get instant summaries and sentiment analysis.' },
  { icon: Gavel, title: 'Legal Guardian', description: 'Check for risks and compliance.' },
  { icon: Users, title: 'Meeting Genius', description: 'Turn transcripts into action items.' },
  { icon: Calculator, title: 'Math Whiz', description: 'Solve equations with explanations.' },
]

const companyLogos = ['QuantumLeap', 'ApexSphere', 'NexusCore', 'StellarForge', 'Vertex Inc.', 'NovaGen', 'BlueHorizon', 'Zenith Corp', 'Momentum AI', 'Innovate IO', 'Synergy Labs', 'TerraFirm']

// Typing animation hook
const useTypingAnimation = () => {
  const words = ['intelligently', 'instantly', 'effortlessly', 'powerfully']
  const [currentWord, setCurrentWord] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIndex]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setCurrentWord(word.substring(0, currentWord.length + 1))
          if (currentWord === word) {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          setCurrentWord(word.substring(0, currentWord.length - 1))
          if (currentWord === '') {
            setIsDeleting(false)
            setWordIndex((wordIndex + 1) % words.length)
          }
        }
      },
      isDeleting ? 50 : 100
    )
    return () => clearTimeout(timeout)
  }, [currentWord, isDeleting, wordIndex, words])

  return currentWord
}

export default function Home() {
  const typedWord = useTypingAnimation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-7xl/none">
                  Work with PDFs, <span className="text-primary">{typedWord}</span>
                  <span className="animate-blink">|</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                  DocuMind AI is the world's first intelligent document workspace. Go beyond editing and leverage AI to analyze, create, and collaborate.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button size="lg" asChild><Link href="/dashboard">Start for Free <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  <Button size="lg" variant="outline" asChild><Link href="#features">See The Magic</Link></Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-xl aspect-[4/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-24 w-24 text-primary animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Tools Grid */}
        <section className="py-12 md:py-20 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {mainTools.map((tool, index) => (
                <Link key={tool.title} href={tool.href} className="group" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="text-center p-4 md:p-6 rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 hidden xl:block">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <p className="text-center text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-6">Trusted by the brands you trust</p>
            <div className="relative flex h-10 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
              <div className="flex animate-marquee items-center">
                {[...companyLogos, ...companyLogos].map((logo, index) => (
                  <p key={index} className="mx-8 flex-shrink-0 text-lg font-bold text-muted-foreground/60">{logo}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Features</div>
              <h2 className="text-3xl font-bold font-headline sm:text-5xl">Your Documents, Upgraded.</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">Powerful AI tools for seamless workflow.</p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={feature.title} className="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="w-full py-20 md:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Pricing</div>
              <h2 className="text-3xl font-bold font-headline sm:text-5xl">Find the Perfect Plan</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">Start free, scale as you grow.</p>
            </div>
            <div className="mx-auto grid max-w-md gap-8 sm:max-w-lg lg:max-w-none lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={`flex flex-col ${tier.isFeatured ? 'border-primary ring-2 ring-primary shadow-2xl scale-105' : ''}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-headline">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-6">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.priceDetail && <span className="text-sm text-muted-foreground">{tier.priceDetail}</span>}
                      </div>
                      <ul className="space-y-3">
                        {tier.features.map(feature => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button asChild className="mt-8 w-full" variant={tier.isFeatured ? 'default' : 'outline'}>
                      <Link href="/login">{tier.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t bg-muted/40 px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} DocuMind AI. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
        </nav>
      </footer>
    </div>
  )
}
