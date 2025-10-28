
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MessageSquare, Sparkles, Users, BrainCircuit, BookCopy, Zap } from 'lucide-react'
import { useParallax } from 'react-scroll-parallax'
import type { RefObject } from 'react'

const features = [
  { icon: MessageSquare, title: 'AI-Powered Chat', description: 'Find information, get answers, and understand complex data in seconds.' },
  { icon: Sparkles, title: 'Intelligent Summaries', description: 'Turn dense reports into concise, actionable summaries.' },
  { icon: Users, title: 'Team Collaboration', description: 'Work together in real-time with AI assistance.' },
  { icon: BrainCircuit, title: 'Automated Compliance', description: 'Check documents against policies automatically.' },
  { icon: BookCopy, title: 'Custom Templates', description: 'Create and save reusable templates.' },
  { icon: Zap, title: 'Advanced Security', description: 'Enterprise-grade security and encryption.' },
]

export const LandingFeatures = () => {
  const featuresParallax = useParallax<HTMLElement>({
    speed: 10,
    rootMargin: { top: 0, right: 0, bottom: -500, left: 0 },
  });

  return (
    <section id="features" ref={featuresParallax.ref as RefObject<HTMLElement>} className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Features</div>
          <h2 className="text-3xl font-bold font-headline sm:text-5xl">Your Documents, Upgraded.</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">Powerful AI tools for seamless workflow.</p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={feature.title} className="text-center group card-hover-effect">
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
  )
}
