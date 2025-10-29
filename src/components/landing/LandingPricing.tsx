
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

const pricingTiers = [
  { name: 'Free', price: '$0', description: 'For individuals and personal use.', features: ['Up to 3 documents', 'Basic AI tools', 'Standard collaboration'], cta: 'Start for Free' },
  { name: 'Pro', price: '$15', priceDetail: '/ user / month', description: 'For professionals and small teams.', features: ['Unlimited documents', 'Advanced AI tools', 'Team collaboration', 'Priority support'], cta: 'Upgrade to Pro', isFeatured: true },
  { name: 'Enterprise', price: 'Custom', description: 'For large organizations.', features: ['Custom AI models', 'Dedicated infrastructure', 'Advanced security', '24/7 support'], cta: 'Contact Sales' },
]

export const LandingPricing = () => {
  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Pricing</div>
          <h2 className="text-3xl font-bold font-headline sm:text-5xl">Find the Perfect Plan</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">Start free, scale as you grow.</p>
        </div>
        <div className="mx-auto grid max-w-md gap-8 sm:max-w-lg lg:max-w-none lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col card-hover-effect ${tier.isFeatured ? 'border-primary ring-2 ring-primary shadow-2xl scale-105' : ''}`}>
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
  )
}
