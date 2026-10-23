import React from 'react';
import { User } from '@/services/api';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ user, onLogout, activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
              N
            </span>
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              SecureNotes
            </span>
          </div>

          {user && (
            <nav className="flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setActiveTab('notes')}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-neutral-100 text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-neutral-100 text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('aggregations')}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  activeTab === 'aggregations'
                    ? 'bg-neutral-100 text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Aggregations
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300'
                  }`}
                >
                  Admin Panel
                </button>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</div>
                <div className="text-neutral-500">{user.email}</div>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                    : 'bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                }`}
              >
                {user.role}
              </span>
              <button
                onClick={onLogout}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="font-mono text-xs text-neutral-500">Not authenticated</span>
          )}
        </div>
      </div>
    </header>
  );
}
