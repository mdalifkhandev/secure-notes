'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, Note, User, PaginatedResponse } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NotesSectionProps {
  user: User;
}

export function NotesSection({ user }: NotesSectionProps) {
  const [notesData, setNotesData] = useState<PaginatedResponse<Note> | null>(null);
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const refreshNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getNotes(page, 6, viewAll);
      setNotesData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    ApiService.getNotes(page, 6, viewAll)
      .then((res) => {
        if (!ignore) {
          setNotesData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to fetch notes');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [page, viewAll]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await ApiService.createNote(title, content);
      setTitle('');
      setContent('');
      refreshNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await ApiService.updateNote(id, { title: editTitle, content: editContent });
      setEditingNoteId(null);
      refreshNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await ApiService.deleteNote(id);
      refreshNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Note Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Create a New Secure Note
          </h2>
          {user.role === 'admin' && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-purple-700 dark:text-purple-400">
              <input
                type="checkbox"
                checked={viewAll}
                onChange={(e) => {
                  setViewAll(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
              />
              View Everyone&apos;s Notes (Admin Privilege)
            </label>
          )}
        </div>

        <form onSubmit={handleCreateNote} className="space-y-3">
          <div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your private note content here..."
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Save Note
            </Button>
          </div>
        </form>
      </Card>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Notes List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {viewAll ? "All Platform Notes (Admin Global View)" : "Your Notes"}
          </h3>
          <p className="text-xs text-neutral-500">
            Total Notes: {notesData?.total ?? 0} • Supported by compound index{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">
              {viewAll ? '{ createdAt: -1 }' : '{ owner: 1, createdAt: -1 }'}
            </code>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshNotes} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {/* Notes Grid */}
      {loading && !notesData ? (
        <div className="py-12 text-center text-sm text-neutral-400">Loading notes...</div>
      ) : notesData?.data.length === 0 ? (
        <Card className="py-12 text-center text-sm text-neutral-500">
          No notes found. Create your first note above!
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notesData?.data.map((note) => {
            const isEditing = editingNoteId === note._id;
            const canModify = note.owner?._id === user._id || user.role === 'admin';

            return (
              <Card key={note._id} className="flex flex-col justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        {note.title}
                      </h4>
                      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      Owner: {note.owner?.name || 'Unknown'}
                    </span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>

                  {canModify && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingNoteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveEdit(note._id)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(note)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                            onClick={() => handleDelete(note._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {notesData && notesData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-xs text-neutral-500">
            Page {notesData.page} of {notesData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= notesData.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
