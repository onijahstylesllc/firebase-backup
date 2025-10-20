import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>DocuMind AI Logo</title>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="hsl(var(--primary) / 0.1)"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      
      {/* Central brain/node icon */}
      <circle cx="12" cy="14" r="2" stroke="hsl(var(--primary))" strokeWidth="1.5"></circle>

      {/* Connection lines radiating from the center */}
      <path d="M12 12V10" stroke="hsl(var(--primary))"></path>
      <path d="M12 16v2" stroke="hsl(var(--primary))"></path>
      <path d="M14 14h2" stroke="hsl(var(--primary))"></path>
      <path d="M8 14H10" stroke="hsl(var(--primary))"></path>
      <path d="m13.5 12.5 1.5-1.5" stroke="hsl(var(--primary))"></path>
      <path d="m9 17 1.5-1.5" stroke="hsl(var(--primary))"></path>
      <path d="m10.5 12.5-1.5-1.5" stroke="hsl(var(--primary))"></path>
      <path d="m15 17-1.5-1.5" stroke="hsl(var(--primary))"></path>

      {/* Outer nodes */}
      <circle cx="12" cy="10" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="12" cy="18" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="16" cy="14" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="8" cy="14" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="15" cy="11" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="9" cy="11" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="10.5" cy="17" r="0.5" fill="hsl(var(--primary))"></circle>
      <circle cx="13.5" cy="17" r="0.5" fill="hsl(var(--primary))"></circle>
    </svg>
  );
}
