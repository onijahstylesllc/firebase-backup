'use client';

import ContentLoader from 'react-content-loader';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export function TestimonialCarouselSkeleton() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const backgroundColor = isDarkMode ? '#333' : '#f0f0f0';
  const foregroundColor = isDarkMode ? '#555' : '#e0e0e0';

  return (
    <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-8 text-center flex flex-col items-center">
            <ContentLoader 
              speed={1.5}
              width={400} 
              height={220}
              viewBox="0 0 400 220" 
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Avatar */}
              <circle cx="200" cy="60" r="40" />

              {/* Testimonial text lines */}
              <rect x="50" y="120" rx="4" ry="4" width="300" height="10" />
              <rect x="75" y="140" rx="4" ry="4" width="250" height="10" />
              <rect x="100" y="160" rx="4" ry="4" width="200" height="10" />

              {/* Author info */}
              <rect x="150" y="190" rx="3" ry="3" width="100" height="8" />
              <rect x="165" y="205" rx="3" ry="3" width="70" height="6" />
            </ContentLoader>
        </CardContent>
    </Card>
  );
}
