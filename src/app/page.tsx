'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, User } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { AuthSection } from '@/components/auth/AuthSection';
import { NotesSection } from '@/components/notes/NotesSection';
import { PostsSection } from '@/components/posts/PostsSection';
import { AggregationsSection } from '@/components/aggregations/AggregationsSection';
import { AdminSection } from '@/components/admin/AdminSection';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    const stored = ApiService.getStoredUser();

    if (stored) {
      ApiService.getProfile()
        .then((fresh) => {
          if (!ignore) {
            setUser(fresh);
            ApiService.setStoredUser(fresh);
            setInitializing(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            ApiService.clearToken();
            setUser(null);
            setInitializing(false);
          }
        });
    } else {
      Promise.resolve().then(() => {
        if (!ignore) {
          setInitializing(false);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = () => {
    ApiService.clearToken();
    setUser(null);
    setActiveTab('notes');
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveTab('notes');
  };

  if (initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Initializing SecureNotes application...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="mx-auto max-w-6xl w-full px-6 py-8 flex-1">
        {!user ? (
          <AuthSection onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div>
            {activeTab === 'notes' && <NotesSection user={user} />}
            {activeTab === 'posts' && <PostsSection user={user} />}
            {activeTab === 'aggregations' && <AggregationsSection />}
            {activeTab === 'admin' && user.role === 'admin' && <AdminSection />}
          </div>
        )}
      </main>
    </div>
  );
}
