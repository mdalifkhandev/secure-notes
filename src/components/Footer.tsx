import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200/80 bg-neutral-50/50 py-8 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-neutral-500 sm:flex-row dark:text-neutral-400">
        <p>Clean Next.js + NestJS Architecture • Ready to code</p>
        <div className="flex items-center gap-6 font-mono text-xs">
          <span>frontend/ (Next.js)</span>
          <span>•</span>
          <span>backend/ (NestJS)</span>
        </div>
      </div>
    </footer>
  );
}
