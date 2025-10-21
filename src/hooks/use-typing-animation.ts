
'use client';

import { useState, useEffect } from 'react';

/**
 * A React hook for creating a typing animation effect over a list of words.
 * @param words An array of strings to cycle through for the typing animation.
 * @returns The currently animated string.
 */
export const useTypingAnimation = (words: readonly string[]) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing the word
        setCurrentWord(word.substring(0, currentWord.length + 1));
        if (currentWord === word) {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting the word
        setCurrentWord(word.substring(0, currentWord.length - 1));
        if (currentWord === '') {
          // Finished deleting, move to the next word
          setIsDeleting(false);
          setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentWord, isDeleting, wordIndex, words]);

  return currentWord;
};
