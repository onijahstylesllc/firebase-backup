
'use client';

import React, { useRef, useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import { type UseEmblaCarouselType } from 'embla-carousel-react';
import { TestimonialCarouselSkeleton } from './testimonial-carousel-skeleton';

type EmblaCarouselType = UseEmblaCarouselType[1];
type EmblaPluginType = any;

const testimonials = [
    {
        name: 'Sarah Chen, Project Manager',
        avatarId: 'testimonial-avatar-1',
        text: '"DocuMind AI has transformed how our team collaborates on proposals. The AI summarization is a lifesaver and saves us hours every week."',
    },
    {
        name: 'Michael Ramirez, Attorney',
        avatarId: 'testimonial-avatar-2',
        text: '"The legal checker is an indispensable first-pass tool for reviewing contracts. It helps me spot potential issues in seconds, not hours."',
    },
    {
        name: 'Emily Carter, Marketing Lead',
        avatarId: 'testimonial-avatar-3',
        text: '"Being able to check copy against our brand guidelines instantly is a game-changer. It ensures consistency across all our marketing materials."',
    },
    {
        name: 'David Lee, Tech Lead',
        avatarId: 'testimonial-avatar-4',
        text: '"The AI-powered code analysis in technical documents is surprisingly accurate. It helps our junior developers get up to speed much faster."',
    },
    {
        name: 'Jessica Taylor, Financial Analyst',
        avatarId: 'testimonial-avatar-5',
        text: '"Extracting data from hundreds of pages of financial reports used to take days. With DocuMind, I can do it in minutes. It\'s an absolute must-have."',
    },
    {
        name: 'Dr. Alistair Finch, Research Scientist',
        avatarId: 'testimonial-avatar-6',
        text: '"This tool has revolutionized my academic workflow. Compiling literature reviews and cross-referencing papers is now almost instantaneous."',
    },
    {
        name: 'Maria Garcia, Nonprofit Director',
        avatarId: 'testimonial-avatar-7',
        text: '"As a small nonprofit, efficiency is key. DocuMind AI helps us draft grant proposals and reports in a fraction of the time, letting us focus on our mission."',
    },
    {
        name: 'Kenji Tanaka, Architect',
        avatarId: 'testimonial-avatar-8',
        text: '"Reviewing building codes and client specifications across dozens of blueprints is tedious. DocuMind flags inconsistencies automatically, preventing costly errors."',
    },
    {
        name: 'Olivia Davis, Startup CEO',
        avatarId: 'testimonial-avatar-9',
        text: '"From investor updates to business plans, I handle countless documents. DocuMind is my second brain, ensuring everything is coherent, professional, and on-point."',
    },
    {
        name: 'Ben Carter, UX Designer',
        avatarId: 'testimonial-avatar-10',
        text: '"I use DocuMind to analyze user feedback forms. The sentiment analysis and key point extraction are fantastic for quickly identifying user pain points."',
    },
    {
        name: 'Dr. Isabelle Moreau, Medical Researcher',
        avatarId: 'testimonial-avatar-11',
        text: '"Analyzing clinical trial data and patient-reported outcomes is faster and more accurate. The platform’s ability to handle complex medical terminology is impressive."',
    },
    {
        name: 'Samuel Jones, University Professor',
        avatarId: 'testimonial-avatar-12',
        text: '"Grading essays and providing feedback has been streamlined. I can quickly check for plagiarism and get AI suggestions for improving student writing."',
    },
    {
        name: 'Chloe Kim, Fashion Designer',
        avatarId: 'testimonial-avatar-13',
        text: '"I use it to manage supply chain contracts and material spec sheets. The ability to translate and summarize documents from international suppliers is invaluable."',
    },
    {
        name: 'Liam O\'Connell, Construction Manager',
        avatarId: 'testimonial-avatar-14',
        text: '"Safety reports, daily logs, and permit applications are a huge part of my job. DocuMind helps me keep everything organized and compliant."',
    },
    {
        name: 'Fatima Al-Jamil, Government Official',
        avatarId: 'testimonial-avatar-15',
        text: '"Drafting and reviewing policy documents requires immense attention to detail. The AI Policy Checker is an incredible tool for ensuring consistency and adherence to legal frameworks."',
    },
    {
        name: 'Tom H., Logistics Coordinator',
        avatarId: 'testimonial-avatar-16',
        text: '"Cross-referencing shipping manifests with customs declarations is now a breeze. It has significantly reduced errors and delays in our shipments."',
    },
    {
        name: 'Rachel L., Event Planner',
        avatarId: 'testimonial-avatar-17',
        text: '"Managing vendor contracts, venue agreements, and client requests is so much easier. I love being able to ask questions in plain English and get answers instantly."',
    },
    {
        name: 'Carlos S., Head Chef',
        avatarId: 'testimonial-avatar-18',
        text: '"I use DocuMind to manage my recipes, inventory sheets, and health code compliance documents. It keeps my entire kitchen operation documented and efficient."',
    },
    {
        name: 'Priya N., QA Engineer',
        avatarId: 'testimonial-avatar-19',
        text: '"Analyzing bug reports and technical specification documents is my day-to-day. The AI helps me spot correlations and duplicate issues much faster than before."',
    },
    {
        name: 'James P., Management Consultant',
        avatarId: 'testimonial-avatar-20',
        text: '"The ability to quickly digest and summarize client reports, market research, and internal memos is a massive competitive advantage. It\'s my secret weapon for client presentations."',
    },
];


export function TestimonialCarousel() {
  const [api, setApi] = useState<EmblaCarouselType | undefined>()
  const [autoplayPlugin, setAutoplayPlugin] = useState<EmblaPluginType | null>(null);

  useEffect(() => {
    // Initialize plugin only on the client side
    setAutoplayPlugin(Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }));
  }, []);
  
  useEffect(() => {
    if (!api) {
      return
    }
 
    api.on('select', () => {
      // Do something on select.
    })
  }, [api])


  if (!autoplayPlugin) {
    // Render a skeleton or a static version while the plugin is loading
    return <TestimonialCarouselSkeleton />;
  }

  return (
    <Carousel
        setApi={setApi}
        opts={{
            align: "start",
            loop: true,
        }}
        plugins={[autoplayPlugin]}
        className="w-full"
        >
        <CarouselContent>
            {testimonials.map((testimonial) => {
                const avatarImage = placeholderImages.placeholderImages.find(p => p.id === testimonial.avatarId);
                return (
                    <CarouselItem key={testimonial.name} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-4 h-full">
                            <Card className="h-full flex flex-col text-center shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
                                    {avatarImage && (
                                        <Avatar className="w-20 h-20 mb-4 ring-2 ring-primary/10 ring-offset-4 ring-offset-background">
                                            <AvatarImage src={avatarImage.imageUrl} alt={testimonial.name} data-ai-hint={avatarImage.imageHint}/>
                                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <p className="flex-1 text-muted-foreground text-base italic mb-4">"{testimonial.text}"</p>
                                    <div className="mt-auto">
                                        <p className="font-semibold text-lg">{testimonial.name.split(',')[0]}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.name.split(', ')[1]}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                )
            })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
    </Carousel>
  )
}
