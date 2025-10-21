'use client'

import { useEffect, useRef } from 'react'

export const useScrollAnimation = () => {
  const animatedElementsRef = useRef<Map<Element, boolean>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const animated = animatedElementsRef.current.get(entry.target);
          if (entry.isIntersecting && !animated) {
            entry.target.classList.add('animate-fade-slide-up');
            animatedElementsRef.current.set(entry.target, true);
          } else if (!entry.isIntersecting && animated) {
            entry.target.classList.remove('animate-fade-slide-up');
            animatedElementsRef.current.set(entry.target, false);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-anim');
    elements.forEach((el) => {
      animatedElementsRef.current.set(el, false);
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);
};
