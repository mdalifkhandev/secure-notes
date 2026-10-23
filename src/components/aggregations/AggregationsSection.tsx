'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, InterestGroup, UserPostsLookupResult, User } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AggregationsSection() {
  const [activeTab, setActiveTab] = useState<'interests' | 'lookup'>('interests');

  // Scenario 1 state
  const [interestsData, setInterestsData] = useState<InterestGroup[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);

  // Scenario 2 state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [lookupResult, setLookupResult] = useState<UserPostsLookupResult | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchInterests = async () => {
    setLoadingInterests(true);
    setInterestsError(null);
    try {
      const data = await ApiService.getGroupedByInterests();
      setInterestsData(data);
    } catch (err) {
      setInterestsError(err instanceof Error ? err.message : 'Failed to fetch grouped interests');
    } finally {
      setLoadingInterests(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (activeTab === 'interests') {
      ApiService.getGroupedByInterests()
        .then((data) => {
          if (!ignore) {
            setInterestsData(data);
            setLoadingInterests(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setInterestsError(err instanceof Error ? err.message : 'Failed to fetch grouped interests');
            setLoadingInterests(false);
          }
        });
    } else {
      ApiService.getUsers(1, 20)
        .then((res) => {
          if (!ignore) {
            setUsersList(res.data);
            setSelectedUserId((prev) => prev || (res.data.length > 0 ? res.data[0]._id : ''));
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const handleRunLookup = async (userIdToQuery?: string) => {
    const id = userIdToQuery || selectedUserId;
    if (!id.trim()) return;

    setLoadingLookup(true);
    setLookupError(null);
    try {
      const res = await ApiService.getUserPostsLookup(id);
      setLookupResult(res);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Failed to execute $lookup aggregation');
    } finally {
      setLoadingLookup(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('interests')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'interests'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Scenario 1: Group by Interests ($unwind + $group)
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'lookup'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Scenario 2: User Posts ($lookup)
        </button>
      </div>

      {/* Scenario 1: Group by Interests */}
      {activeTab === 'interests' && (
        <div className="space-y-4">
          <Card className="border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Scenario 1: Users Grouped by Interests
                </h3>
                <p className="text-xs text-neutral-500">
                  Constraint satisfied: Exactly <strong>one</strong> collection.aggregate() call.
                  Supported by multikey index:{' '}
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                    UserSchema.index(&#123; interests: 1 &#125;)
                  </code>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInterests}
                isLoading={loadingInterests}
              >
                Re-run Aggregation
              </Button>
            </div>
          </Card>

          {interestsError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              {interestsError}
            </div>
          )}

          {loadingInterests && interestsData.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              Running aggregation pipeline...
            </div>
          ) : interestsData.length === 0 ? (
            <Card className="py-8 text-center text-xs text-neutral-500">
              No users with interests found. Register users with interests to see them grouped!
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interestsData.map((group) => (
                <Card key={group.interest} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 capitalize text-sm">
                        🏷️ {group.interest}
                      </span>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {group.count} {group.count === 1 ? 'user' : 'users'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {group.users.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs dark:bg-neutral-800/40"
                        >
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {u.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 uppercase font-mono">
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scenario 2: User Posts ($lookup) */}
      {activeTab === 'lookup' && (
        <div className="space-y-4">
          <Card className="border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/40">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Scenario 2: Retrieve User Posts with $lookup
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Constraint satisfied: Single aggregation pipeline with a $lookup stage joining Posts.
              Supported by compound index:{' '}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                PostSchema.index(&#123; author: 1, createdAt: -1 &#125;)
              </code>
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {usersList.length > 0 && (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Or paste MongoDB User ID..."
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleRunLookup()}
                isLoading={loadingLookup}
              >
                Execute $lookup
              </Button>
            </div>
          </Card>

          {lookupError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              {lookupError}
            </div>
          )}

          {lookupResult && (
            <Card>
              <div className="border-b border-neutral-200 pb-3 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      User Profile: {lookupResult.name} ({lookupResult.email})
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      User ID: {lookupResult._id} • Role: {lookupResult.role}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Joined {lookupResult.posts?.length ?? 0} Posts via $lookup
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Posts Joined from &apos;posts&apos; Collection:
                </h5>

                {lookupResult.posts?.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">
                    This user has not authored any posts yet. (Publish a post under the &quot;Posts&quot; tab).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lookupResult.posts.map((post) => (
                      <div
                        key={post._id}
                        className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900/50"
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-neutral-100">
                          <span>{post.title}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
