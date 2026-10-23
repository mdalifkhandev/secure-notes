'use client';

import React, { useState } from 'react';
import { ApiService, User } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AuthSectionProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthSection({ onAuthSuccess }: AuthSectionProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const interestsArray = interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

        const res = await ApiService.register({
          name,
          email,
          password,
          interests: interestsArray,
        });

        ApiService.setToken(res.accessToken);
        ApiService.setStoredUser(res.user);
        onAuthSuccess(res.user);
      } else {
        const res = await ApiService.login({ email, password });
        ApiService.setToken(res.accessToken);
        ApiService.setStoredUser(res.user);
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.login({
        email: 'admin@example.com',
        password: 'admin123',
      });
      ApiService.setToken(res.accessToken);
      ApiService.setStoredUser(res.user);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} (Tip: Ensure backend is running with 'pnpm run start:dev')`
          : 'Failed to login as admin'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            {isRegister ? 'Register to manage your personal notes' : 'Sign in to access your notes'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Interests (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="chess, reading, tech"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-neutral-400">Used for Aggregation Scenario 1</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            {isRegister ? 'Register' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={quickLoginAdmin}
            isLoading={loading}
          >
            ⚡ Quick Login as Default Admin (admin@example.com)
          </Button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </Card>
    </div>
  );
}
