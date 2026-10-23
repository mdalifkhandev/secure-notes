'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, Post, User, PaginatedResponse } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PostsSectionProps {
  user: User;
}

export function PostsSection({ user }: PostsSectionProps) {
  const [postsData, setPostsData] = useState<PaginatedResponse<Post> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create post state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refreshPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getPosts(page, 5);
      setPostsData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    ApiService.getPosts(page, 5)
      .then((res) => {
        if (!ignore) {
          setPostsData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to fetch posts');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [page]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await ApiService.createPost(title, content);
      setTitle('');
      setContent('');
      refreshPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Publish a Public Post (Posting as {user.name})
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          Public posts are visible to all users and are used in Scenario 2 ($lookup aggregation).
        </p>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <textarea
              required
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share publicly?"
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Publish Post
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Posts Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Public Posts Feed ({postsData?.total ?? 0})
          </h3>
          <p className="text-xs text-neutral-500">
            Sorted by newest. Supported by index:{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">
              PostSchema.index(&#123; createdAt: -1 &#125;)
            </code>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshPosts} isLoading={loading}>
          Refresh Feed
        </Button>
      </div>

      {/* Feed List */}
      {loading && !postsData ? (
        <div className="py-12 text-center text-sm text-neutral-400">Loading feed...</div>
      ) : postsData?.data.length === 0 ? (
        <Card className="py-8 text-center text-xs text-neutral-500">
          No public posts found. Write the first one!
        </Card>
      ) : (
        <div className="space-y-3">
          {postsData?.data.map((post) => (
            <Card key={post._id} className="p-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {post.title}
                </h4>
                <span className="text-[10px] text-neutral-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Author: {post.author?.name || 'Anonymous'}</span>
                <span className="font-mono text-[10px]">Author ID: {post.author?._id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {postsData && postsData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-xs text-neutral-500">
            Page {postsData.page} of {postsData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= postsData.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
