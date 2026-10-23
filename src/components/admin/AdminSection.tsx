'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, User, PaginatedResponse } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AdminSection() {
  const [usersData, setUsersData] = useState<PaginatedResponse<User> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [interests, setInterests] = useState('');
  const [creating, setCreating] = useState(false);

  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getUsers(page, 5);
      setUsersData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    ApiService.getUsers(page, 5)
      .then((res) => {
        if (!ignore) {
          setUsersData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to fetch users');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [page]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const interestsArr = interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      await ApiService.createUser({
        name,
        email,
        password,
        role,
        interests: interestsArr,
      });

      setSuccess('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setInterests('');
      setShowAddForm(false);
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await ApiService.updateUser(targetUser._id, { role: newRole });
      setSuccess(`Updated role of ${targetUser.name} to ${newRole}`);
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleEditInterests = async (targetUser: User) => {
    const current = targetUser.interests?.join(', ') || '';
    const newInterestsStr = window.prompt(
      `Enter interests for ${targetUser.name} (comma separated):`,
      current,
    );
    if (newInterestsStr === null) return;

    const newInterests = newInterestsStr
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      await ApiService.updateUser(targetUser._id, { interests: newInterests });
      setSuccess(`Updated interests for ${targetUser.name}`);
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user interests');
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await ApiService.deleteUser(id);
      setSuccess(`User "${userName}" deleted successfully`);
      refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Admin User Management
          </h2>
          <p className="text-xs text-neutral-500">
            Manage platform accounts. Query supported by{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">
              UserSchema.index(&#123; createdAt: -1 &#125;)
            </code>
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Close Form' : '+ Add New User'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <Card className="border-indigo-100 dark:border-indigo-900/40">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Create User Account (Admin)
          </h3>
          <form onSubmit={handleCreateUser} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User name"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
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
                placeholder="Min 6 characters"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Interests (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="chess, reading, security"
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={creating}>
                Save User
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Name / Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Interests</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading && !usersData ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Loading user records...
                </td>
              </tr>
            ) : usersData?.data.map((u) => (
              <tr key={u._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{u.name}</div>
                  <div className="text-[11px] text-neutral-400">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.interests && u.interests.length > 0 ? (
                      u.interests.map((i, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                        >
                          {i}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400 italic">none</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditInterests(u)}
                      className="rounded px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      Edit Interests
                    </button>
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="rounded px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name)}
                      className="rounded px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {usersData && usersData.totalPages > 1 && (
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
            Page {usersData.page} of {usersData.totalPages} ({usersData.total} users)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= usersData.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
