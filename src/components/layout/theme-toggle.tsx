'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <div className="h-8 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-16 items-center rounded-full bg-gray-200 p-1 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-700 transform-gpu active:scale-95"
      aria-label="Toggle theme"
    >
      <div
        className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out dark:bg-gray-800"
        style={{ transform: theme === 'dark' ? 'translateX(2rem)' : 'translateX(0)' }}
      />
      <div className="relative flex w-full justify-between px-1">
        <Sun
          className={`h-4 w-4 text-yellow-500 transition-all duration-300 ease-in-out ${
            theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
          }`}
        />
        <Moon
          className={`h-4 w-4 text-blue-400 transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
          }`}
        />
      </div>
    </button>
  );
}
