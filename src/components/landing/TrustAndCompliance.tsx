
'use client'

import { ShieldCheck, Lock, FileLock, Server } from 'lucide-react'

type TrustBadge = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const trustBadges: TrustBadge[] = [
  { icon: ShieldCheck, title: 'SOC 2 Type II', description: 'Enterprise-grade security and compliance.' },
  { icon: Lock, title: 'GDPR Compliant', description: 'Your data privacy is our priority.' },
  { icon: FileLock, title: 'End-to-End Encryption', description: 'All your documents are encrypted at rest and in transit.' },
  { icon: Server, title: '99.9% Uptime', description: 'Reliable access to your documents when you need them.' },
];

export const TrustAndCompliance = () => {
  return (
    <section className="py-12 md:py-20 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Security</div>
          <h2 className="text-3xl font-bold font-headline sm:text-5xl">Trust & Compliance</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl">Your data is safe with us. We are compliant with the latest security standards.</p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <badge.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-headline">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
